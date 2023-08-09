import { observer } from 'mobx-react-lite';
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { FrontModal } from '../../../../Global/modal';
import { ModalsState } from '../host';
import ModalFooter from '../../../../Global/modalFooter';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { getLastErrorMessage } from '../../../../../../utils/helpers';

interface Props {
    reservationId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<ModalsState>>;
    children: any;
}

const CancelReservationModal: FC<Props> = observer(({ reservationId, isVisible, setIsVisible, children }) => {
    const { globalStore, reservationsStore } = useStores();
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { userStore } = useStores();
    const hideModal = () => {
        setIsVisible((prevState) => ({ ...prevState, cancelReservation: false }));
    };
    const handle = async () => {
        const { data, success } = await reservationsStore.cancelReservation(reservationId);
        if (success) {
            await reservationsStore.get(reservationId, userStore.activeType as Exclude<UserType, 'admin'>);
            setIsSuccess(true);
        } else if (!success) {
            setError(getLastErrorMessage(data));
        }
    };

    useEffect(() => {
        setError(null);
        setIsSuccess(false);
    }, [isVisible]);

    return (
        <FrontModal
            visible={isVisible}
            header="Cancel Reservation"
            footer={
                !isSuccess && (
                    <ModalFooter
                        formId="messageForm"
                        primaryButtonText="Confirm"
                        closeModalHandler={hideModal}
                        saveHandler={handle}
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
                    message="The reservation has been cancelled successfully"
                />
            ) : (
                <>
                    <FrontNotificationField alertType={AlertType.danger} message={error} />
                    <p>{children}</p>
                </>
            )}
        </FrontModal>
    );
});

export default CancelReservationModal;
