import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { CalendarModalsState } from '.';
import { useStores } from '../../../../../../../store';
import { ExternalCalendar, ExternalCalendarPayload } from '../../../../../../../models/api';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../../lang/en/validatons';
import { FrontModal } from '../../../../../Global/modal';
import ModalFooter from '../../../../../Global/modalFooter';
import { Element } from 'react-scroll';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';
import FrontInput, { InputType } from '../../../../../Global/input';
import DeleteCalendarModal from './DeleteCalendarModal';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';

interface Props {
    propertyId: string;
    calendar?: ExternalCalendar;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<CalendarModalsState>>;
    fetchCalendar: () => void;
}

const EditCalendarModal: FC<Props> = observer(({ propertyId, calendar, isVisible, setIsVisible, fetchCalendar }) => {
    const { propertiesStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const initialValues: ExternalCalendarPayload = {
        url: calendar?.url ?? '',
        name: calendar?.name ?? '',
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(UseLangMessage('Calendar Name', ValidationMessage.requiredFront)),
        url: Yup.string().url().required(UseLangMessage('Calendar address (URL)', ValidationMessage.requiredFront)),
    });

    const editCalendar = async (
        values: ExternalCalendarPayload,
        formikHelpers: FormikHelpers<ExternalCalendarPayload>
    ) => {
        setErrors(null);
        try {
            await propertiesStore
                .updateExternalCalendar(propertyId, calendar?.id ?? '', values)
                .then(() => propertiesStore.fetchExternalCalendars(propertyId));
            setSuccess('The calendar has been updated successfully');
        } catch (e) {
            setErrors('An error has occured');
        } finally {
            formikHelpers.resetForm();
        }
    };

    const syncCalendar = async () => {
        setErrors(null);
        try {
            await propertiesStore
                .syncCalendars(propertyId)
                .then(() => propertiesStore.fetchExternalCalendars(propertyId));
            setSuccess('The calendar has been synced successfully');
            fetchCalendar();
        } catch (e) {
            setErrors('Sync error');
        }
    };

    const deleteCalendar = () => {
        setIsDeleteModalVisible(true);
    };

    const hideModal = (props?: FormikProps<ExternalCalendarPayload>) => {
        setIsVisible('');
        props?.resetForm();
    };

    const onHide = (props?: FormikProps<ExternalCalendarPayload>) => () => {
        if (!props?.isSubmitting) {
            setErrors(null);
            setSuccess(null);
            hideModal(props);
        }
    };

    const onDeleteModalHide = () => {
        setIsDeleteModalVisible(false);
        setIsVisible('');
    };

    useEffect(() => {
        if (errors?.length || success?.length) {
            scrollToElement('notificationScrollToElement', -100, 1000, 'editCalendar_content');
        }
    }, [errors, success]);

    const isSyncLoading = propertiesStore.externalCalendars.isSyncLoading;
    const isRemoveLoading = propertiesStore.externalCalendars.isRemoveLoading;

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={editCalendar}
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setErrors);
                return (
                    <FrontModal
                        visible={isVisible}
                        header="Edit Imported Calendar"
                        className="decline-modal p-dialog-content_scroll"
                        position="center"
                        dismissableMask
                        id="editCalendar"
                        onHide={onHide(props)}
                        footer={
                            <ModalFooter<ExternalCalendarPayload>
                                formId="editCalendarForm"
                                primaryButtonText={'Save'}
                                success={success === 'The calendar has been deleted successfully'}
                                utilityButtonVisible
                                utilityButtonText={'Sync'}
                                utilityButtonHandler={syncCalendar}
                                secondaryButtonText={'Delete'}
                                isLoading={isSyncLoading}
                                closeModalHandler={deleteCalendar}
                                isSubmitting={props.isSubmitting}
                                resetForm={props.resetForm}
                            />
                        }
                    >
                        <Form id="editCalendarForm">
                            <DeleteCalendarModal
                                isDeleting={isRemoveLoading}
                                propertyId={propertyId}
                                calendar={calendar}
                                isVisible={isDeleteModalVisible}
                                onHide={onDeleteModalHide}
                                fetchCalendar={fetchCalendar}
                            />
                            <Element name="notificationScrollToElement" />
                            <FrontNotificationField alertType={AlertType.danger} message={errors} />
                            {success === 'The calendar has been deleted successfully' ? (
                                <FrontNotificationField alertType={AlertType.success} message={success} />
                            ) : (
                                <>
                                    {!errors ? (
                                        <FrontNotificationField alertType={AlertType.success} message={success} />
                                    ) : null}
                                    <p className="mb">Update the fields below to edit your imported calendar.</p>
                                    <div className="form-group">
                                        <div className="input-wrap">
                                            <FrontInput
                                                id="url"
                                                name="url"
                                                type={InputType.text}
                                                label="Calendar address (URL)"
                                                required
                                                value={props.values.url}
                                                onChange={props.handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="input-wrap">
                                            <FrontInput
                                                id="name"
                                                name="name"
                                                type={InputType.text}
                                                label="Calendar Name"
                                                required
                                                value={props.values.name}
                                                onChange={props.handleChange}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </Form>
                    </FrontModal>
                );
            }}
        </Formik>
    );
});

export default EditCalendarModal;
