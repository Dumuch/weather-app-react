import { Dispatch, FC, SetStateAction, useState } from 'react';
import { MessageTypes, UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { FrontModal } from '../../../../Global/modal';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import ModalFooter from '../../../../Global/modalFooter';

interface Props {
    messageId: string;
    userType: Omit<UserType, 'admin'>;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<'' | 'reply' | 'remove'>>;
    limit: number;
    offset: number;
}

const RemoveMessageModal: FC<Props> = ({ messageId, userType, isVisible, setIsVisible, limit, offset }) => {
    const { messagesStore } = useStores();
    const [success, setSuccess] = useState<string | null>('');

    const removeMessage = () => {
        messagesStore.removeMessage(messageId);
        setSuccess('The message has been removed successfully');
    };
    const hideModal = () => {
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
        setIsVisible('');
        setSuccess(null);
    };
    return (
        <FrontModal
            visible={isVisible}
            header="Remove message"
            position="center"
            footer={
                <ModalFooter
                    saveHandler={removeMessage}
                    primaryButtonText="Remove"
                    closeModalHandler={hideModal}
                    isSubmitting={messagesStore.isLoading}
                    success={success}
                />
            }
            dismissableMask
            onHide={hideModal}
        >
            {success ? (
                <FrontNotificationField alertType={AlertType.success} message={success} />
            ) : (
                <p>Are you sure you want to delete this message?</p>
            )}
        </FrontModal>
    );
};

export default RemoveMessageModal;
