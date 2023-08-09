import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { FrontModal } from '../modal';

interface Props {
    isOpenModal: boolean;
    closeCancellationPolicyModal: () => void;
}

const CancellationPolicyModal: FunctionComponent<Props> = observer(({ isOpenModal, closeCancellationPolicyModal }) => {
    const closeModal = () =>
        function () {
            closeCancellationPolicyModal();
        };

    const renderFooter = () => {
        return <></>;
    };

    return (
        <FrontModal
            header={'Cancellation Policies'}
            visible={isOpenModal}
            onHide={closeModal()}
            dismissableMask={true}
            position={'top'}
            footer={renderFooter}
            className={'modal-lg cancellation-policies-modal p-dialog-content_scroll'}
        >
            <div className="textbox">
                <p>“24 Hour Cancellation Policy (Lenient)”</p>
                <ul>
                    <li>
                        If the reservation is cancelled at least 24 hours before check-in time/date, the full
                        reservation amount will be refunded, minus the service fee.
                    </li>
                    <li>
                        If the reservation is cancelled less than 24 hours before check-in time/date, the first night
                        and service fee will not be refunded. The remainder of the reservation will be refunded.
                    </li>
                </ul>
                <p>“7 Day Cancellation Policy (Moderate)”</p>
                <ul>
                    <li>
                        If the reservation is cancelled within 24 hours of making the reservation or at least 7 days
                        before check-in time/date, the full reservation amount will be refunded, minus the service fee.
                    </li>
                    <li>
                        If the reservation is cancelled after 24 hours of making the reservation and less than 7 days
                        before check-in time/date, 50% of the reservation amount will be refunded, minus the service
                        fee.
                    </li>
                </ul>
                <p>“14 Day Cancellation Policy (Moderate)”</p>
                <ul>
                    <li>
                        If the reservation is cancelled at least 14 days prior to check-in date/time, the full
                        reservation amount will be refunded, minus the service fee.
                    </li>
                    <li>
                        If the reservation is cancelled less than 14 days and at least 7 days before check-in time/date,
                        50% of the reservation amount will be refunded, minus the service fee.
                    </li>
                    <li>
                        If the reservation is cancelled less than 7 days before check-in date/time, no refund will be
                        issued.
                    </li>
                </ul>
                <p>“30 Day Cancellation Policy (Strict)”</p>
                <ul>
                    <li>
                        If the reservation is cancelled at least 30 days prior to check-in date/time, the full
                        reservation amount will be refunded, minus the service fee.
                    </li>
                    <li>
                        If the reservation is cancelled less than 30 days and at least 14 days before check-in
                        time/date, 50% of the reservation amount will be refunded, minus the service fee.
                    </li>
                    <li>
                        If the reservation is cancelled less than 14 days before check-in date/time, no refund will be
                        issued.
                    </li>
                </ul>
                <p>“Non-Refundable”</p>
                <ul>
                    <li>The reservation is non-refundable.</li>
                </ul>
            </div>
        </FrontModal>
    );
});
export default CancellationPolicyModal;
