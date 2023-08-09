import { observer } from 'mobx-react-lite';
import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { FrontModal } from '../../../../Global/modal';
import { ModalsState } from '../host';
import ModalFooter from '../../../../Global/modalFooter';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';

interface Props {
    reservationId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<ModalsState>>;
}

const ApproveReservationModal: FC<Props> = observer(({ reservationId, isVisible, setIsVisible }) => {
    const { globalStore, reservationsStore } = useStores();
    const [isSuccess, setIsSuccess] = useState(false);

    const hideModal = () => {
        setIsVisible((prevState) => ({ ...prevState, approveReservation: false }));
        setTimeout(() => {
            setIsSuccess(false);
        }, 500);
    };
    const handleButton = async () => {
        try {
            await reservationsStore.approveReservation(reservationId, false);
            setIsSuccess(true);
        } catch (error) {
            hideModal();
            globalStore.showToast({
                severity: 'error',
                detail: 'There was a problem with the payment system. Unfortunately, your reservation has been cancelled.',
            });
        } finally {
            await reservationsStore.get(reservationId, UserType.host);
        }
    };

    return (
        <FrontModal
            visible={isVisible}
            header="Approve Reservation"
            footer={
                !isSuccess && (
                    <ModalFooter
                        formId="messageForm"
                        primaryButtonText="Approve"
                        closeModalHandler={hideModal}
                        saveHandler={handleButton}
                        isSubmitting={globalStore.isLoading}
                    />
                )
            }
            position="top"
            dismissableMask
            onHide={hideModal}
            className={`${isSuccess ? 'p-dialog_no-footer' : ''}`}
        >
            {isSuccess ? (
                <FrontNotificationField
                    alertType={AlertType.success}
                    message="The reservation has been approved successfully"
                />
            ) : (
                <p>
                    By clicking the &quot;APPROVE&quot; button below, you are agreeing to this reservation for the
                    listed dates, displayed guest(s), and reservation amount. The dates will become booked on this
                    property&apos;s calendar. You are also agreeing to the selected cancellation policy for this
                    property and to all of BidBookStay.com&apos;s policies, procedures, and Terms & Conditions.
                </p>
            )}
        </FrontModal>
    );
});

export default ApproveReservationModal;
