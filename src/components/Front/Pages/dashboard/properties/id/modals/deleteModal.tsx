import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../../store';
import { FrontButton } from '../../../../../Global/button';
import { FrontModal } from '../../../../../Global/modal';
import { FrontRoutesList } from '../../../../FrontRoutesList';
import { useRouter } from 'next/router';

interface Props {
    isOpenModal: boolean;
    closeDeleteModal: () => void;
}

const PropertySectionDeleteModal: FunctionComponent<Props> = observer(({ isOpenModal, closeDeleteModal }) => {
    const router = useRouter();
    const { propertiesStore, userStore } = useStores();
    const [isLoading, setIsLoading] = useState(false);

    const deleteProperty = async () => {
        if (propertiesStore.item.item) {
            setIsLoading(true);
            try {
                await propertiesStore.delete(propertiesStore.item.item.id);
                userStore.isFetched = false;
                userStore.properties.isFetched = false;
                closeModal()();
                await router.push(FrontRoutesList.DashboardProperties);
            } catch (e) {
            } finally {
                setIsLoading(false);
            }
        }
    };

    const closeModal = () =>
        function () {
            closeDeleteModal();
        };

    const renderFooter = () => {
        return (
            <>
                <FrontButton
                    onClick={deleteProperty}
                    className={'btn-primary'}
                    type={'button'}
                    form={'changePasswordForm'}
                    loading={isLoading}
                >
                    Confirm
                </FrontButton>
                <FrontButton className={'btn-border'} type={'button'} onClick={closeModal()} disabled={isLoading}>
                    Cancel
                </FrontButton>
            </>
        );
    };

    return (
        <FrontModal
            header={'Delete Property?'}
            visible={isOpenModal}
            onHide={closeModal()}
            footer={renderFooter}
            dismissableMask={true}
            position={'top'}
        >
            <p>
                By deleting this listing, the property and all associated data will be deleted from the website. Please
                click &quot;CONFIRM&quot; if you wish to continue.
            </p>
        </FrontModal>
    );
});
export default PropertySectionDeleteModal;
