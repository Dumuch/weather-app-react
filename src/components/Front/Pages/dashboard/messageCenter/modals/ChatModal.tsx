import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import React, { Dispatch, FC, SetStateAction, useState, useEffect, useMemo, useRef } from 'react';
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
import { observer } from 'mobx-react-lite';
import FrontSkeleton from '../../../../Global/skeleton';
import classnames from 'classnames';

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
const CHAT_HEIGHT = 344;
const OFFSET_SCROLL_PX = 200;
const LIMIT_PER_MESSAGES = 20;

const ChatModal: FC<Props> = observer(
    ({ message, header, readonly, userType, isVisible, setIsVisible, limit, offset }) => {
        const { messagesStore, userStore } = useStores();
        const [errors, setErrors] = useState<string | null>('');
        const [success, setSuccess] = useState<string | null>('');
        const [currentOffset, setCurrentOffset] = useState(0);

        const chatContainer = useRef<HTMLDivElement | null>(null);
        const [scrollHeight, setScrollHeight] = useState(CHAT_HEIGHT);
        const [prevHeight, setPrevHeight] = useState(CHAT_HEIGHT);
        const [newHeight, setNewHeight] = useState(0);

        useEffect(() => {
            if (!chatContainer.current) return;
            if (messagesStore.currentChat.isLoading) {
                setPrevHeight(chatContainer.current?.scrollHeight);
            } else {
                setNewHeight(chatContainer.current?.scrollHeight);
            }

            setScrollHeight(chatContainer.current.scrollHeight);
        }, [messagesStore.currentChat.isLoading]);

        useEffect(() => {
            const heightDiff = newHeight - prevHeight;
            if (chatContainer.current) {
                chatContainer.current.scrollTop += heightDiff;
            }
        }, [chatContainer.current]);

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

        const sendMessage = async (
            values: MessageInitialValues,
            formikHelpers: FormikHelpers<MessageInitialValues>
        ) => {
            setErrors(null);
            setSuccess(null);
            try {
                await messagesStore.sendMessage(values);
                setSuccess('The reply has been sent successfully');
                formikHelpers.resetForm();
                fetchChat(false);
            } catch (error) {
            } finally {
                formikHelpers.setSubmitting(false);
                setTimeout(() => {
                    if (chatContainer.current) {
                        chatContainer.current.scrollTop = chatContainer.current?.scrollHeight;
                    }
                }, 100);
            }
        };

        const hideModal = (props?: FormikProps<MessageInitialValues>) => {
            setIsVisible('');
            props?.resetForm();
            messagesStore.currentChat.isFetched = false;
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

        const scrollHandler = (e: React.UIEvent<HTMLDivElement>) => {
            if (messagesStore.currentChat.count === 0) {
                return;
            }
            if (
                e.currentTarget.scrollTop < OFFSET_SCROLL_PX &&
                messagesStore.currentChat.rows.length < messagesStore.currentChat.count &&
                !messagesStore.isLoading
            ) {
                fetchChat && fetchChat();
            }
        };

        useEffect(() => {
            if (isVisible) {
                fetchChat(false);
                setCurrentOffset(0);
                setNewHeight(0);
                setPrevHeight(0);
            }
        }, [isVisible]);

        const fetchChat = async (isMerge = true) => {
            await messagesStore.getChatById(
                {
                    limit: LIMIT_PER_MESSAGES,
                    offset: isMerge ? currentOffset + LIMIT_PER_MESSAGES : 0,
                    userType: userStore.activeType as Omit<UserType, 'admin'>,
                    reservationId: message?.reservationId,
                    propertyId: message?.propertyId,
                },
                isMerge
            );
            setCurrentOffset((prevState) => (isMerge ? prevState + LIMIT_PER_MESSAGES : 0));
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
                                    isSubmitting={messagesStore.currentChat.isLoading || props.isSubmitting}
                                    resetForm={props.resetForm}
                                />
                            }
                        >
                            <div className={'chat-block mb'}>
                                {!messagesStore.currentChat.isFetched ? (
                                    <FrontSkeleton width="100%" height="5rem" />
                                ) : (
                                    <>
                                        {messagesStore?.currentChat?.count > 0 ? (
                                            <div
                                                className={classnames('chat', {
                                                    'chat-overflow': scrollHeight > CHAT_HEIGHT,
                                                })}
                                                ref={chatContainer}
                                                onScroll={scrollHandler}
                                            >
                                                {messagesStore.isLoading ? (
                                                    <>
                                                        <div className="message in">
                                                            <FrontSkeleton width="10rem" height="3rem" />
                                                        </div>
                                                    </>
                                                ) : null}
                                                {messagesStore?.currentChat.rows.map((message) => {
                                                    const isOwnMessage = message.from?.id === userStore.user?.id;
                                                    const formattedBody = message.body
                                                        .replaceAll('\n', '<br>')
                                                        .replaceAll(' ', '&thinsp;');
                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={classnames(
                                                                'message',
                                                                { in: !isOwnMessage },
                                                                { out: isOwnMessage }
                                                            )}
                                                        >
                                                            <div className="user small">
                                                                {!isOwnMessage
                                                                    ? `${concatString([
                                                                          message.from?.firstName ?? '',
                                                                          message.from?.lastName ?? '',
                                                                      ])} | `
                                                                    : null}
                                                                {getFormatData(
                                                                    message.createdAt,
                                                                    dateConfig.formats.dateWithoutSeconds
                                                                )}
                                                            </div>
                                                            <div
                                                                className="text"
                                                                dangerouslySetInnerHTML={{ __html: formattedBody }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="textbox">
                                                <p>There are no messages yet.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

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
    }
);

export default ChatModal;
