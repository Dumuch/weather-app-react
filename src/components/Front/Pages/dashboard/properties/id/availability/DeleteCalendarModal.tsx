import { Dispatch, FC, SetStateAction, useState } from 'react';
import { useStores } from '../../../../../../../store';
import { ExternalCalendar } from '../../../../../../../models/api';
import { FrontModal } from '../../../../../Global/modal';
import ModalFooter from '../../../../../Global/modalFooter';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';

interface Props {
    propertyId: string;
    calendar?: ExternalCalendar;
    isVisible: boolean;
    isDeleting: boolean;
    onHide: () => void;
    fetchCalendar: () => void;
}

const DeleteCalendarModal: FC<Props> = ({ propertyId, calendar, isVisible, isDeleting, onHide, fetchCalendar }) => {
    const { propertiesStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');

    const deleteCalendar = async () => {
        setErrors(null);
        try {
            await propertiesStore
                .deleteExternalCalendar(propertyId, calendar?.id ?? '')
                .then(() => propertiesStore.fetchExternalCalendars(propertyId));
            setSuccess('The calendar has been deleted successfully');
            fetchCalendar();
        } catch (e) {
            setErrors('An error has occured');
        }
    };

    return (
        <FrontModal
            visible={isVisible}
            header="Delete Imported Calendar"
            className="decline-modal p-dialog-content_scroll"
            position="center"
            dismissableMask
            onHide={onHide}
            footer={
                <ModalFooter
                    primaryButtonText={'Delete'}
                    success={success}
                    secondaryButtonText={'Cancel'}
                    saveHandler={deleteCalendar}
                    closeModalHandler={onHide}
                    isSubmitting={isDeleting}
                />
            }
        >
            <>
                <FrontNotificationField alertType={AlertType.success} message={success} />
                <FrontNotificationField alertType={AlertType.danger} message={errors} />
                {!success ? <p className="mb">Are you sure you want to delete this calendar?</p> : null}
            </>
        </FrontModal>
    );
};

export default DeleteCalendarModal;
