import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { observer } from 'mobx-react-lite';
import { FrontModal } from '../../../../Global/modal';
import ModalFooter from '../../../../Global/modalFooter';
import { PropertySidebarModalsState } from '../PropertySidebar';

interface Props {
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<PropertySidebarModalsState>>;
    cancellationPolicy: string;
}

const PolicyDetailsModal: FunctionComponent<Props> = observer(({ isVisible, setIsVisible, cancellationPolicy }) => {
    const hideModal = () => setIsVisible('');
    return (
        <FrontModal
            header={'Cancellation Policy'}
            visible={isVisible}
            onHide={hideModal}
            footer={<ModalFooter success={'true'} closeModalHandler={hideModal} />}
            dismissableMask={true}
            position={'top'}
            className={'modal-lg p-dialog-content_scroll'}
        >
            <div className="textbox">
                <ul>
                    {cancellationPolicy.split('\n').map((paragraph, idx) => (
                        <li key={idx}>{paragraph}</li>
                    ))}
                </ul>
            </div>
        </FrontModal>
    );
});
export default PolicyDetailsModal;
