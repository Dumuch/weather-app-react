import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../../store';
import { FrontButton } from '../../../../../Global/button';
import { FrontModal } from '../../../../../Global/modal';

interface Props {
    isOpenModal: boolean;
    closeActivateDeactivateModal: () => void;
}

const PropertySectionActivateDeactivateModal: FunctionComponent<Props> = observer(
    ({ isOpenModal, closeActivateDeactivateModal }) => {
        const { propertiesStore, userStore } = useStores();
        const [isLoading, setIsLoading] = useState(false);

        const toggleActiveProperty = async () => {
            if (propertiesStore.item.item) {
                setIsLoading(true);
                try {
                    await propertiesStore.updateItem(
                        {
                            id: propertiesStore.item.item.id,
                            active: !propertiesStore.item.item.active,
                        },
                        false
                    );
                    userStore.properties.isFetched = false;
                    userStore.isFetched = false;
                    closeModal()();
                } catch (e) {
                } finally {
                    setIsLoading(false);
                }
            }
        };

        const closeModal = () =>
            function () {
                closeActivateDeactivateModal();
            };

        const renderFooter = () => {
            return (
                <>
                    <FrontButton
                        onClick={toggleActiveProperty}
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
                header={propertiesStore.item.item?.active ? 'Deactivate Property?' : 'Activate Property?'}
                visible={isOpenModal}
                onHide={closeModal()}
                footer={renderFooter}
                dismissableMask={true}
                position={'top'}
            >
                {propertiesStore.item.item?.active ? (
                    <p>
                        By deactivating this listing, the property will no longer be able to be booked. You may
                        reactivate this property at any time. Please click &quot;CONFIRM&quot; if you wish to continue.
                    </p>
                ) : (
                    <p>
                        By activating this listing, the property will now be able to be booked. Please click
                        &quot;CONFIRM&quot; if you wish to continue.
                    </p>
                )}
            </FrontModal>
        );
    }
);
export default PropertySectionActivateDeactivateModal;
