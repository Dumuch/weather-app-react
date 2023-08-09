import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../../store';
import { FrontButton } from '../../../../../Global/button';
import { FrontModal } from '../../../../../Global/modal';
import { getLastErrorMessage } from '../../../../../../../utils/helpers';

interface Props {
    isOpenModal: boolean;
    closeModalHandler: () => void;
}

const ProfileSectionPaymentDeleteCardModal: FunctionComponent<Props> = observer(
    ({ isOpenModal, closeModalHandler }) => {
        const { userStore } = useStores();
        const [error, setError] = useState<string | null>(null);

        const deleteCard = async () => {
            closeModal()();
            const { data, success } = await userStore.deleteCard();
            if (success) {
                userStore.isFetched = false;
                userStore.properties.isFetched = false;
            } else {
                setError(getLastErrorMessage(data));
            }
        };

        const closeModal = () =>
            function () {
                closeModalHandler();
            };

        const renderFooter = () => {
            return (
                <>
                    <FrontButton
                        onClick={deleteCard}
                        className={'btn-primary'}
                        type={'button'}
                        form={'changePasswordForm'}
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
                header={'Delete Credit Card'}
                visible={isOpenModal}
                onHide={closeModal()}
                footer={renderFooter}
                dismissableMask={true}
                position={'top'}
            >
                {error && (
                    <div className="alert alert-danger mb" role="alert">
                        {error}
                    </div>
                )}
                <p>
                    By clicking the &quot;CONFIRM&quot; button below, you are deleting this credit card and all
                    associated payment information from the system. You are also agreeing to all of
                    BidBookStay.com&apos;s policies, procedures, and Terms & Conditions.
                </p>
            </FrontModal>
        );
    }
);
export default ProfileSectionPaymentDeleteCardModal;
