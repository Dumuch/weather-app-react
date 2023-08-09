import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';

interface Props {
    requiresApproval: boolean;
}

const ThirdStep: FC<Props> = observer(({ requiresApproval }) => {
    return (
        <>
            <div className="step-content">
                <div className="textbox mb">
                    <p>
                        {requiresApproval
                            ? `Congratulations! Your reservation request has been sent. 
                            The host will review the details of your reservation request and if approved, your trip will be automatically booked. 
                            Please reference your confirmation email for any additional details about your stay. 
                            If you have any questions, please visit our Help Center.`
                            : `Congratulations! Your reservation has been confirmed. 
                            Please reference your confirmation email for additional details about your trip. 
                            If you have any questions, please visit our Help Center.`}
                    </p>
                </div>
                {requiresApproval ? (
                    <FrontNotificationField alertType={AlertType.success} message={'Reservation request submitted'} />
                ) : (
                    <FrontNotificationField alertType={AlertType.success} message={'Reservation confirmed'} />
                )}
            </div>
        </>
    );
});

export default ThirdStep;
