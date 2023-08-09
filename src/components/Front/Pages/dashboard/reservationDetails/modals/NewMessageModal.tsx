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
import { ModalsState } from '../host';
import ModalFooter from '../../../../Global/modalFooter';

interface Props {
    reservationId: string;
    userType: Omit<UserType, 'admin'>;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<ModalsState>>;
}

interface MessageInitialValues {
    reservationId: string;
    fromUserType: Omit<UserType, 'admin'>;
    message: string;
}

const NewMessageModal: FC<Props> = ({ reservationId, userType, isVisible, setIsVisible }) => {
    const { messagesStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');
    const initialValues: MessageInitialValues = {
        reservationId,
        fromUserType: userType,
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
            await messagesStore.fetchReservationMessages(reservationId);
            setSuccess('The message has been sent successfully. The message history is shown below');
            formikHelpers.resetForm();
        } catch (error) {
        } finally {
            formikHelpers.setSubmitting(false);
        }
    };

    const hideModal = (props?: FormikProps<MessageInitialValues>) => {
        setIsVisible((prevState) => ({ ...prevState, newMessage: false }));
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
                        header={(userType === 'guest' && 'Message Host') || (userType === 'host' && 'Message Guest')}
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

export default NewMessageModal;
