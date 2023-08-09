import { observer } from 'mobx-react-lite';
import { Tooltip } from 'primereact/tooltip';
import { Dispatch, FC, MouseEvent, SetStateAction, useEffect, useState } from 'react';
import { CalendarModalsState } from '.';
import { useStores } from '../../../../../../../store';
import FrontInput, { InputType } from '../../../../../Global/input';
import { FrontModal } from '../../../../../Global/modal';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';
import ModalFooter from '../../../../../Global/modalFooter';

interface Props {
    propertyId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<CalendarModalsState>>;
}

const ExportCalendarModal: FC<Props> = observer(({ propertyId, isVisible, setIsVisible }) => {
    const [success, setSuccess] = useState<string | null>(null);
    const [errors, setErrors] = useState<string | null>(null);
    const { propertiesStore } = useStores();
    const hideModal = () => {
        setIsVisible('');
        setSuccess(null);
        setErrors(null);
    };

    const onClipboardClick = (e: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
        setSuccess('Successfully copied link!');
    };

    useEffect(() => {
        if (isVisible) {
            try {
                propertiesStore.fetchIcsLink(propertyId);
            } catch (e) {
                setErrors('Error getting link');
            }
        }
    }, [isVisible]);

    return (
        <FrontModal
            visible={isVisible}
            header="Export Calendar"
            position="center"
            footer={<ModalFooter saveButtonVisible={false} closeButtonVisible={false} />}
            dismissableMask
            onHide={hideModal}
        >
            {success ? (
                <FrontNotificationField alertType={AlertType.success} message={success} />
            ) : (
                <>
                    {errors ? <FrontNotificationField alertType={AlertType.danger} message={errors} /> : null}
                    <p>Copy the link below to sync this calendar with another iCal application.</p>
                    <FrontInput
                        type={InputType.clipboard}
                        onClipboardClick={onClipboardClick}
                        name="some"
                        value={propertiesStore.icsLink.data ?? ''}
                        classWrapper="clipboard-input"
                        isLoading={propertiesStore.icsLink.isLoading}
                    />
                    <Tooltip target=".clipboard-input .p-inputtext" position="top" mouseTrack>
                        Click to copy this link to clipboard
                    </Tooltip>
                </>
            )}
        </FrontModal>
    );
});

export default ExportCalendarModal;
