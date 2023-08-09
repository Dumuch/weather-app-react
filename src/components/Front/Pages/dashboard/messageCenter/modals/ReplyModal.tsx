import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useState, useEffect, useMemo } from 'react';
import { Message, MessageTypes, UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import FrontInput, { InputType } from '../../../../Global/input';
import { FrontModal } from '../../../../Global/modal';
import { concatString, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import ModalFooter from '../../../../Global/modalFooter';
import { getFormatData } from '../../../../../../utils/dateTime';
import { dateConfig } from '../../../../../../config/date';

interface Props {
    message: Message | null;
    header?: string;
    readonly: boolean;
    userType: Omit<UserType, 'admin'>;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<'' | 'reply' | 'remove'>>;
    limit: number;
    offset: number;
}

interface MessageInitialValues {
    reservationId?: string;
    propertyId?: string;
    replyTo: string;
    fromUserType: Omit<UserType, 'admin'>;
    message: string;
}

const ReplyModal: FC<Props> = ({ message, header, readonly, userType, isVisible, setIsVisible, limit, offset }) => {
    const { messagesStore, userStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');
    const initialValues: MessageInitialValues = {
        reservationId: message?.reservation?.id,
        propertyId: message?.propertyId ?? undefined,
        replyTo: message?.id ?? '',
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
            setSuccess('The reply has been sent successfully');
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

    const getModalHeader = () => header || message?.reservation?.property?.name || message?.property?.name;

    const onHide = (props?: FormikProps<MessageInitialValues>) => () => {
        if (!props?.isSubmitting) {
            messagesStore.fetchMessages({
                messageType: MessageTypes.message,
                userType: userType,
                limit,
                offset,
            });
            messagesStore.fetchMessages({
                messageType: MessageTypes.notification,
                userType: userType,
                limit,
                offset,
            });

            setErrors(null);
            setSuccess(null);
            hideModal(props);
        }
    };

    const formattedBody = useMemo(() => {
        if (message?.from) {
            return message?.body.replaceAll('\n', '<br>').replaceAll(' ', '&thinsp;');
        } else return message?.body;
    }, [message?.id]);

    useEffect(() => {
        if (!message?.id || message.isRead) return;
        messagesStore
            .markAsRead(message.id)
            .then(() =>
                messagesStore.fetchUnreadMessagesCount({ userType: userStore.activeType as Omit<UserType, 'admin'> })
            );
    }, [message?.id]);

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
                        header={getModalHeader()}
                        position="center"
                        dismissableMask
                        onHide={onHide(props)}
                        className="msg-modal p-dialog-content_scroll"
                        footer={
                            <ModalFooter<MessageInitialValues>
                                formId="messageForm"
                                primaryButtonText="Reply"
                                closeButtonVisible={false}
                                saveButtonVisible={!readonly}
                                isSubmitting={props.isSubmitting}
                                resetForm={props.resetForm}
                            />
                        }
                    >
                        <div className="msg-date mb-half">
                            {getFormatData(message?.createdAt, dateConfig.formats.localizedDateWithTime)}
                            {` | ${
                                message?.from
                                    ? concatString([message?.from?.firstName ?? '', message?.from?.lastName ?? ''])
                                    : 'System Notification'
                            }`}
                        </div>
                        <div className="msg-body mb" dangerouslySetInnerHTML={{ __html: formattedBody ?? '' }} />

                        {!readonly ? (
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
                                    value={props.values.message}
                                    onChange={props.handleChange}
                                    classWrapper="opaque-label"
                                    required
                                />
                            </Form>
                        ) : null}
                    </FrontModal>
                );
            }}
        </Formik>
    );
};

export default ReplyModal;
