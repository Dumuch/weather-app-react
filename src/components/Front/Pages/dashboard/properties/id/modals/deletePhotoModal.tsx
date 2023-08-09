import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../../store';
import { FrontButton } from '../../../../../Global/button';
import { FrontModal } from '../../../../../Global/modal';

interface Props {
    isOpenModal: boolean;
    closeDeleteModal: () => void;
    photoId: string;
    photoSize: number;
    handlerDeletePhoto: (size: number) => void;
}

const PropertySectionDeletePhotoModal: FunctionComponent<Props> = observer(
    ({ isOpenModal, closeDeleteModal, photoId, photoSize, handlerDeletePhoto }) => {
        const { propertiesStore, userStore } = useStores();
        const [isLoading, setIsLoading] = useState(false);

        const deletePhoto = async () => {
            setIsLoading(true);
            closeModal()();
            await propertiesStore.deletePhoto(photoId, false);
            userStore.properties.isFetched = false;
            handlerDeletePhoto(photoSize);
            setIsLoading(false);
        };

        const closeModal = () =>
            function () {
                closeDeleteModal();
            };

        const renderFooter = () => {
            return (
                <>
                    <FrontButton
                        onClick={deletePhoto}
                        className={'btn-primary'}
                        type={'button'}
                        form={'changePasswordForm'}
                        loading={isLoading}
                    >
                        Confirm
                    </FrontButton>
                    <FrontButton className={'btn-border'} type={'button'} onClick={closeModal()}>
                        Cancel
                    </FrontButton>
                </>
            );
        };

        return (
            <FrontModal
                header={'Delete Photo?'}
                visible={isOpenModal}
                onHide={closeModal()}
                footer={renderFooter}
                dismissableMask={true}
                position={'top'}
            >
                <p>Please click &quot;CONFIRM&quot; if you wish to continue.</p>
            </FrontModal>
        );
    }
);
export default PropertySectionDeletePhotoModal;
