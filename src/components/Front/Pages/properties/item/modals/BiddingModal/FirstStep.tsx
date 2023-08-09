import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import { useState, FC } from 'react';
import { BiddingInitialValues } from '.';
import { formatIntoPriceValue } from '../../../../../../../utils/helpers';
import { FrontDropdown } from '../../../../../Global/dropdown';
import FrontInput, { InputType } from '../../../../../Global/input';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';

interface Props {
    errors: string | null;
    minimumBid: number;
    bidUnits: {
        id: string;
        name: string;
    }[];
}

const FirstStep: FC<Props> = observer(({ errors, minimumBid, bidUnits }) => {
    const { handleChange, values } = useFormikContext<BiddingInitialValues>();
    return (
        <div className="step-content">
            <div className="textbox mb">
                <p>
                    Enter the nightly amount you would like to bid for this reservation. The total bid amount on the
                    right side of your screen will update as you enter your nightly bid. You must select a bid amount
                    higher than the &quot;Minimum Nightly Bid:&quot; shown.
                </p>
                <p>
                    Use the dropdown to select a unit of time and then enter a value to set how long you would like your
                    bid to remain active. This will be the amount of time a host has to respond to your bid.
                </p>
                <p>
                    If the host does not respond to your bid within the set time, then the bid will expire, and you are
                    free to place a new bid on this property or another property of your choice.
                </p>
                <p>
                    After your nightly bid amount is entered and the bid timer has been set, you can move forward by
                    clicking the &quot;NEXT&quot; button.
                </p>
                <p>
                    <strong>Minimum Nightly Bid: {formatIntoPriceValue(minimumBid, true, true, 2)}</strong>
                </p>
            </div>
            <div className="form-wrap">
                <div className="row">
                    <div className="col-lg-8 col-md-10">
                        <FrontNotificationField
                            alertType={AlertType.danger}
                            message={
                                errors
                                    ?.split('\n')
                                    .filter((error) => error.indexOf('Form Error') === 0)
                                    .map((error) => error.replaceAll('Form Error', ''))
                                    .join('\n') ?? ''
                            }
                        />
                        <div className="form-group mb">
                            <div className="input-wrap">
                                <FrontInput
                                    name="bidAmount"
                                    onChange={handleChange}
                                    label="Nightly bid amount"
                                    value={values.bidAmount ?? ''}
                                    required={true}
                                    type={InputType.number}
                                    min={1}
                                />
                            </div>
                        </div>
                        <div className="bid-timer-wrap">
                            <div className="form-group">
                                <div className="input-wrap">
                                    <FrontInput
                                        name="bidTimer"
                                        onChange={handleChange}
                                        label="Bid timer value"
                                        value={values.bidTimer ?? ''}
                                        required={true}
                                        type={InputType.number}
                                        min={1}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-wrap has-content select-wrap">
                                    <FrontDropdown
                                        optionValue="id"
                                        optionLabel="name"
                                        label="Bid timer unit"
                                        id="bidUnit"
                                        value={values.bidUnit}
                                        options={bidUnits}
                                        handlerDropdown={handleChange}
                                        name="bidUnit"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FirstStep;
