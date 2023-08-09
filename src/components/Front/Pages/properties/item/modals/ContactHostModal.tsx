import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import FrontInput, { InputType } from '../../../../Global/input';
import { FrontModal } from '../../../../Global/modal';
import { setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import ModalFooter from '../../../../Global/modalFooter';
import { PropertySidebarModalsState } from '../PropertySidebar';

interface Props {
    propertyId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<PropertySidebarModalsState>>;
}

interface MessageInitialValues {
    propertyId: string;
    fromUserType: UserType.guest;
    message: string;
}

const ContactHostModal: FC<Props> = ({ propertyId, isVisible, setIsVisible }) => {
    const { messagesStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');
    const initialValues: MessageInitialValues = {
        propertyId,
        fromUserType: UserType.guest,
        message: '',
    };

    const validationSchema = Yup.object().shape({
        message: Yup.string().required(UseLangMessage('Message', ValidationMessage.requiredFront)),
    });

    const sendMessage = async (values: MessageInitialValues, formikHelpers: FormikHelpers<MessageInitialValues>) => {
        setErrors(null);
        setSuccess(null);
        try {
            await messagesStore.sendMessage(values);
            setSuccess('The message has been sent successfully.');
            formikHelpers.resetForm();
        } catch (error) {
        } finally {
            formikHelpers.setSubmitting(false);
        }
    };

    const hideModal = (props?: FormikProps<MessageInitialValues>) => {
        setIsVisible('');
        props?.resetForm();
    };

    const onHide = (props?: FormikProps<MessageInitialValues>) => () => {
        if (!props?.isSubmitting) {
            setErrors(null);
            setSuccess(null);
            hideModal(props);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={sendMessage}
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setErrors);
                return (
                    <FrontModal
                        visible={isVisible}
                        header="Contact Host"
                        position="center"
                        dismissableMask
                        onHide={onHide(props)}
                        className="message-modal p-dialog-content_scroll"
                        footer={
                            <ModalFooter<MessageInitialValues>
                                formId="messageForm"
                                primaryButtonText={'Send'}
                                closeModalHandler={onHide(props)}
                                isSubmitting={props.isSubmitting}
                                isCancelLoading={props.isSubmitting}
                                resetForm={props.resetForm}
                            />
                        }
                    >
                        <Form id="messageForm">
                            <FrontNotificationField alertType={AlertType.danger} message={errors} />
                            {!errors ? (
                                <FrontNotificationField alertType={AlertType.success} message={success} />
                            ) : null}
                            <FrontInput
                                id="message"
                                name="message"
                                type={InputType.textarea}
                                label="Message"
                                required={true}
                                value={props.values.message}
                                onChange={props.handleChange}
                                classWrapper="opaque-label"
                            />
                        </Form>
                    </FrontModal>
                );
            }}
        </Formik>
    );
};

export default ContactHostModal;
