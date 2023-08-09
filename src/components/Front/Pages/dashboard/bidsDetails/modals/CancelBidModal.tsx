import { observer } from 'mobx-react-lite';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { FrontModal } from '../../../../Global/modal';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import ModalFooter from '../../../../Global/modalFooter';
import { BidsModalsState } from '../host';

interface Props {
    reservationId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<BidsModalsState>>;
}

const CancelBidModal: FC<Props> = observer(({ reservationId, isVisible, setIsVisible }) => {
    const { globalStore, reservationsStore } = useStores();
    const [success, setSuccess] = useState<string | null>('');

    const hideModal = () => setIsVisible((prevState) => ({ ...prevState, cancelBid: false }));
    const handleCancel = async () => {
        setSuccess(null);
        try {
            await reservationsStore.cancelBid(reservationId);
            setSuccess('Confirmed');
        } catch (error) {
        } finally {
            await reservationsStore.getBid(reservationId, UserType.guest);
        }
    };

    const onHide = () => () => {
        setSuccess(null);
        hideModal();
    };

    return (
        <FrontModal
            visible={isVisible}
            header="Cancel Bid"
            className="decline-modal"
            footer={
                <ModalFooter
                    success={success}
                    primaryButtonText="CONFIRM"
                    closeModalHandler={onHide()}
                    saveHandler={handleCancel}
                    isSubmitting={globalStore.isLoading}
                />
            }
            position="center"
            dismissableMask
            onHide={onHide()}
        >
            <>
                <FrontNotificationField alertType={AlertType.success} message={success} />
                {!success ? (
                    <p>
                        By clicking the &quot;CONFIRM&quot; button below, you are cancelling this bid for the listed
                        dates, displayed guest(s), and bid amount. The bid will be deleted and no longer able to be
                        accepted by the host. You are also agreeing to all of BidBookStay.com&apos;s policies,
                        procedures, and Terms & Conditions.
                    </p>
                ) : null}
            </>
        </FrontModal>
    );
});

export default CancelBidModal;
