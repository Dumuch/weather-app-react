import { observer } from 'mobx-react-lite';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';

const FourthStep = observer(() => {
    return (
        <div className="step-content">
            <h4>Bid Confirmation</h4>
            <div className="textbox mb">
                <p>
                    Congratulations! Your bid has been sent to the host. They will review the details of your bid and if
                    accepted, your trip will be automatically booked. If you have any questions, please visit our Help
                    Center.
                </p>
            </div>

            <FrontNotificationField alertType={AlertType.success} message={'Your bid has been submitted'} />
        </div>
    );
});

export default FourthStep;
