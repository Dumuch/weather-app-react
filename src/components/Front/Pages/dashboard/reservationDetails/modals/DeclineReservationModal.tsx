import { observer } from 'mobx-react-lite';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { FrontModal } from '../../../../Global/modal';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { ModalsState } from '../host';
import ModalFooter from '../../../../Global/modalFooter';

interface Props {
    reservationId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<ModalsState>>;
}

const DeclineReservationModal: FC<Props> = observer(({ reservationId, isVisible, setIsVisible }) => {
    const { globalStore, reservationsStore } = useStores();
    const [success, setSuccess] = useState<string | null>('');

    const hideModal = () => setIsVisible((prevState) => ({ ...prevState, declineReservation: false }));
    const handleDecline = async () => {
        setSuccess(null);
        try {
            await reservationsStore.declineReservation(reservationId);
            setSuccess('The reservation has been declined successfully');
        } catch (error) {
        } finally {
            await reservationsStore.get(reservationId, UserType.host);
        }
    };

    const onHide = () => () => {
        setSuccess(null);
        hideModal();
    };

    return (
        <FrontModal
            visible={isVisible}
            header="Decline Reservation"
            className="decline-modal"
            footer={
                <ModalFooter
                    success={success}
                    formId="messageForm"
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
                        By clicking the &quot;DECLINE&quot; button below, you are declining to accept this reservation
                        for the listed dates, displayed guest(s), and reservation amount. The reservation request will
                        be deleted and the selected dates will remain available. A declined reservation cannot be undone
                        and may result in an account review. By clicking &quot;DECLINE&quot;, you are also agreeing to
                        all of BidBookStay.com&apos;s policies, procedures, and Terms & Conditions.
                    </p>
                ) : null}
            </>
        </FrontModal>
    );
});

export default DeclineReservationModal;
