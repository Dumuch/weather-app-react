import { Dispatch, FC, SetStateAction, useState } from 'react';
import { useStores } from '../../../../store';
import { FrontButton } from '../../Global/button';
import { FrontModal } from '../../Global/modal';
import ModalFooter from '../../Global/modalFooter';
import { AlertType, FrontNotificationField } from '../../Global/notificationField';

interface Props {
    searchId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<boolean>>;
}

const RemoveSearchModal: FC<Props> = ({ searchId, isVisible, setIsVisible }) => {
    const [success, setSuccess] = useState<string | null>('');
    const [isRemoving, setIsRemoving] = useState(false);
    const { userStore, globalStore } = useStores();

    const removeSearch = async () => {
        setSuccess(null);
        setIsRemoving(true);
        await userStore.removeUserSearch(searchId);
        setIsRemoving(false);
        setSuccess('Your search has been removed successfully');
    };
    const hideModal = () => {
        if (success) {
            userStore.getUserSearches();
        }
        if (!isRemoving) {
            setIsVisible(false);
        }
    };
    return (
        <FrontModal
            visible={isVisible}
            header="Remove search"
            position="center"
            footer={
                <ModalFooter
                    success={success}
                    primaryButtonText="REMOVE"
                    closeModalHandler={hideModal}
                    saveHandler={removeSearch}
                    isSubmitting={isRemoving}
                />
            }
            dismissableMask
            onHide={hideModal}
        >
            {success ? (
                <FrontNotificationField alertType={AlertType.success} message={success} />
            ) : (
                <p>Are you sure you want to delete this search?</p>
            )}
        </FrontModal>
    );
};

export default RemoveSearchModal;
