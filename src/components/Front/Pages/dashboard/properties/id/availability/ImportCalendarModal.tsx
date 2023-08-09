import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { CalendarModalsState } from '.';
import { useStores } from '../../../../../../../store';
import { ExternalCalendarPayload } from '../../../../../../../models/api';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../../lang/en/validatons';
import { FrontModal } from '../../../../../Global/modal';
import ModalFooter from '../../../../../Global/modalFooter';
import { Element } from 'react-scroll';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';
import FrontInput, { InputType } from '../../../../../Global/input';

interface Props {
    propertyId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<CalendarModalsState>>;
    fetchCalendar: () => void;
}

const ImportCalendarModal: FC<Props> = ({ propertyId, isVisible, setIsVisible, fetchCalendar }) => {
    const { propertiesStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');
    const initialValues: ExternalCalendarPayload = {
        url: '',
        name: '',
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(UseLangMessage('Calendar Name', ValidationMessage.requiredFront)),
        url: Yup.string().url().required(UseLangMessage('Calendar address (URL)', ValidationMessage.requiredFront)),
    });

    const importCalendar = async (
        values: ExternalCalendarPayload,
        formikHelpers: FormikHelpers<ExternalCalendarPayload>
    ) => {
        setErrors(null);
        try {
            await propertiesStore.importIcsLink(propertyId, values);
            setSuccess('The calendar has been imported successfully');
            formikHelpers.resetForm();
            fetchCalendar();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setErrors(e.message);
            }
        }
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

    useEffect(() => {
        if (errors?.length || success?.length) {
            scrollToElement('notificationScrollToElement', -100, 1000, 'importCalendar_content');
        }
    }, [errors, success]);

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={importCalendar}
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setErrors);
                return (
                    <FrontModal
                        visible={isVisible}
                        header="Import a New Calendar"
                        className="decline-modal p-dialog-content_scroll"
                        position="center"
                        dismissableMask
                        id="importCalendar"
                        onHide={onHide(props)}
                        footer={
                            <ModalFooter<ExternalCalendarPayload>
                                formId="importCalendarForm"
                                primaryButtonText={'Import Calendar'}
                                closeButtonVisible={false}
                                //closeModalHandler={onHide(props)}
                                isSubmitting={props.isSubmitting}
                                resetForm={props.resetForm}
                            />
                        }
                    >
                        <Form id="importCalendarForm">
                            <Element name="notificationScrollToElement" />
                            <FrontNotificationField alertType={AlertType.danger} message={errors} />
                            {!errors ? (
                                <FrontNotificationField alertType={AlertType.success} message={success} />
                            ) : null}
                            <p className="mb">
                                Paste the iCal link from an external application below and give your new calendar a
                                name. Then select &quot;IMPORT CALENDAR&quot; and we will keep this listing&apos;s
                                availability up to date.
                            </p>
                            <p className="mb">
                                Please keep in mind that the dates will be synced within one year from today.
                            </p>
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
                        </Form>
                    </FrontModal>
                );
            }}
        </Formik>
    );
};

export default ImportCalendarModal;
