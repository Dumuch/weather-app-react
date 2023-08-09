import { observer } from 'mobx-react-lite';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { FrontModal } from '../../../../Global/modal';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import ModalFooter from '../../../../Global/modalFooter';
import { BidsModalsState } from '../host';
import { getLastErrorMessage } from '../../../../../../utils/helpers';
import { useRouter } from 'next/router';
import { FrontRoutesList } from '../../../FrontRoutesList';

interface Props {
    reservationId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<BidsModalsState>>;
}

const ApproveBidModal: FC<Props> = observer(({ reservationId, isVisible, setIsVisible }) => {
    const { globalStore, reservationsStore } = useStores();
    const [success, setSuccess] = useState<string | null>('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const hideModal = () => setIsVisible((prevState) => ({ ...prevState, approveBid: false }));
    const handleCancel = async () => {
        setSuccess(null);
        setError(null);
        const { data, success } = await reservationsStore.approveBid(reservationId);
        if (success) {
            setSuccess('Confirmed');
        } else {
            setError(getLastErrorMessage(data));
            await reservationsStore.getBid(reservationId, UserType.host);
        }
    };

    useEffect(() => {
        setSuccess(null);
        setError(null);
    }, [isVisible]);

    const onHide = () => () => {
        hideModal();
        success && router.push(`${FrontRoutesList.DashboardReservations}/${reservationId}`);
    };

    return (
        <FrontModal
            visible={isVisible}
            header="Accept Bid"
            className="decline-modal"
            footer={
                <ModalFooter
                    success={success}
                    primaryButtonText={'Accept'}
                    secondaryButtonText={'Cancel'}
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
                <FrontNotificationField alertType={AlertType.danger} message={error} />

                {!success ? (
                    <>
                        <p>
                            By clicking the &quot;ACCEPT&quot; button below, you are agreeing to accept this bid for the
                            listed dates, displayed guest(s), and bid amount. This bid will become a reservation for the
                            listed bid amount and be automatically approved. The dates will then become booked on this
                            property&apos;s calendar.
                        </p>
                        <p>
                            By clicking &quot;ACCEPT&quot; you are also agreeing to the selected this property and to
                            all of BidBookStay.com&apos;s policies, procedures, and Terms & Conditions.
                        </p>
                    </>
                ) : null}
            </>
        </FrontModal>
    );
});

export default ApproveBidModal;
