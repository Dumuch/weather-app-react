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

const DeclineBidModal: FC<Props> = observer(({ reservationId, isVisible, setIsVisible }) => {
    const { globalStore, reservationsStore } = useStores();
    const [success, setSuccess] = useState<string | null>('');

    const hideModal = () => setIsVisible((prevState) => ({ ...prevState, declineBid: false }));
    const handleDecline = async () => {
        setSuccess(null);
        try {
            await reservationsStore.declineBid(reservationId);
            setSuccess('The bid has been declined successfully');
        } catch (error) {
        } finally {
            await reservationsStore.getBid(reservationId, UserType.host);
        }
    };

    const onHide = () => () => {
        setSuccess(null);
        hideModal();
    };

    return (
        <FrontModal
            visible={isVisible}
            header="Decline Bid"
            className="decline-modal"
            footer={
                <ModalFooter
                    success={success}
                    primaryButtonText="DECLINE"
                    closeModalHandler={onHide()}
                    saveHandler={handleDecline}
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
                        By clicking the &quot;DECLINE&quot; button below, you are declining this bid for the listed
                        dates, displayed guest(s), and bid amount. The bid will be deleted and the selected dates will
                        remain available. Declining a bid cannot be undone. By clicking &quot;DECLINE&quot;, you are
                        also agreeing to all of BidBookStay.com&apos;s policies, procedures, and Terms & Conditions.
                    </p>
                ) : null}
            </>
        </FrontModal>
    );
});

export default DeclineBidModal;
