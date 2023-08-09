import { Dispatch, FC, SetStateAction, useState } from 'react';
import { MessageTypes, UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { FrontModal } from '../../../../Global/modal';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import ModalFooter from '../../../../Global/modalFooter';

interface Props {
    propertyId: string | null;
    reservationId: string | null;
    userType: Omit<UserType, 'admin'>;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<'' | 'reply' | 'remove'>>;
    limit: number;
    offset: number;
}

const RemoveChatModal: FC<Props> = ({
    propertyId,
    reservationId,
    userType,
    isVisible,
    setIsVisible,
    limit,
    offset,
}) => {
    const { messagesStore } = useStores();
    const [success, setSuccess] = useState<string | null>('');

    const removeMessage = () => {
        messagesStore.hideChatById({ reservationId, propertyId, userType });
        setSuccess('The message has been removed successfully');
    };
    const hideModal = () => {
        messagesStore.fetchMessages({
            messageType: MessageTypes.message,
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
            header="Remove chat"
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
                <p>Are you sure you want to delete this chat?</p>
            )}
        </FrontModal>
    );
};

export default RemoveChatModal;
