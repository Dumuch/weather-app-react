import { observer } from 'mobx-react-lite';

const FirstStep = observer(() => {
    return (
        <div className="step-content">
            <h4>Terms &amp; Conditions</h4>
            <div className="textbox">
                <p>
                    By clicking the &quot;AGREE & CONTINUE&quot; button below, you are agreeing to book this reservation
                    for the selected property, listed dates, and total reservation amount. You accept the cancellation
                    policy, house rules, and additional rules displayed on the property listing page.
                </p>
                <p>
                    By clicking the &quot;AGREE & CONTINUE&quot; button below, you are agreeing to be charged the total
                    reservation amount, including all associated fees, at the time the reservation is confirmed. You
                    also acknowledge and agree to all BidBookStay.com&apos;s policies, procedures, Terms & Conditions
                    and to receive booking related text messages/notifications. Standard messaging rates may apply.
                </p>
            </div>
        </div>
    );
});

export default FirstStep;
