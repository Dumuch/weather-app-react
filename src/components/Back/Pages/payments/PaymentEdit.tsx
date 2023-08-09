import React, { FunctionComponent } from 'react';
import { Payment, PaymentStatusUI } from '../../../../models/api';
import { DashBoardInput } from '../../dashboard/input';
import SavePanel from '../../dashboard/SavePanel';
import { Form, Formik } from 'formik';
import { DashboardSection } from '../../dashboard/Section';
import { DashBoardPanel } from '../../dashboard/Panel';
import { concatString, formatIntoPriceValue } from '../../../../utils/helpers';
import { dateConfig } from '../../../../config/date';
import { getFormatData } from '../../../../utils/dateTime';

export interface Props {
    payment: Payment;
}

export const PaymentEdit: FunctionComponent<Props> = ({ payment }) => {
    return (
        <Formik initialValues={{}} onSubmit={() => {}} enableReinitialize={true}>
            {(props) => {
                return (
                    <Form>
                        <div className="grid">
                            <DashboardSection sectionTitle="General Info">
                                <DashBoardPanel>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Payment Date:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={getFormatData(
                                                        payment.createdAt,
                                                        dateConfig.formats.date,
                                                        true
                                                    )}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">
                                                PN REF (
                                                <a
                                                    target={'_blank'}
                                                    href={`https://dashboard.stripe.com/${
                                                        process.env.NEXT_PUBLIC_REACT_APP_STRIPE_TEST_MODE
                                                            ? 'test/'
                                                            : ''
                                                    }payments/${payment.transactionId}`}
                                                    rel="noreferrer"
                                                >
                                                    View In Stripe
                                                </a>
                                                ):
                                            </label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={payment.transactionId}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Status:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={PaymentStatusUI[payment.status]}
                                                    setValue={() => {}}
                                                    className={'form-control capitalize'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Customer:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={concatString([
                                                        payment.billingFirst ?? '',
                                                        payment.billingLast ?? '',
                                                    ])}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </DashBoardPanel>
                            </DashboardSection>
                            <div className="col-4 pr-6 pl-6">
                                <h2>&nbsp;</h2>
                                <SavePanel
                                    timestamp={{
                                        createdAt: payment.createdAt,
                                        updatedAt: payment.updatedAt,
                                    }}
                                    inputsDisabled
                                    formikProps={props}
                                >
                                    <></>
                                </SavePanel>
                            </div>
                            <DashboardSection sectionTitle="Payment Details">
                                <DashBoardPanel>
                                    <span className={'dashboard__panel-title'}>Transaction</span>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Total Amount:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={formatIntoPriceValue(payment.total, true, false)}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Subtotal:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={formatIntoPriceValue(payment.subTotal, true, false)}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Cleaning Fee:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={formatIntoPriceValue(payment.cleaningFee ?? 0, true, false)}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Taxes:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={formatIntoPriceValue(payment.taxRate ?? 0, true, false)}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Additional Fee:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={formatIntoPriceValue(
                                                        payment.additionalFees ?? 0,
                                                        true,
                                                        false
                                                    )}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Guest Service Fee:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={formatIntoPriceValue(payment.serviceFee, true, false)}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Host Service Fee:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={formatIntoPriceValue(payment.hostServiceFee, true, false)}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <span className={'dashboard__panel-title'}>Stripe</span>

                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Application Fee:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={formatIntoPriceValue(
                                                        payment.applicationFee ?? 0,
                                                        true,
                                                        false
                                                    )}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Host Payout:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={formatIntoPriceValue(payment.hostPayout ?? 0, true, false)}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {payment.returnSum && payment.returnSum >= 0 ? (
                                        <>
                                            <span className={'dashboard__panel-title'}>Cancel</span>
                                            <div className="form-horizontal">
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">Returned to Guest:</label>
                                                    <div className="sm:col-10 p-0">
                                                        <DashBoardInput
                                                            readOnly={true}
                                                            value={formatIntoPriceValue(payment.returnSum, true, false)}
                                                            setValue={() => {}}
                                                            className={'form-control'}
                                                            type={'text'}
                                                            placeholder={''}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : null}

                                    {payment.returnSumHost && payment.returnSumHost >= 0 ? (
                                        <div className="form-horizontal">
                                            <div className="form-group">
                                                <label className="sm:col-2 control-label">Revoked from Host:</label>
                                                <div className="sm:col-10 p-0">
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={formatIntoPriceValue(
                                                            payment.returnSumHost -
                                                                (payment.penaltyHost ? payment.penaltyHost : 0),
                                                            true,
                                                            false
                                                        )}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {payment.penaltyHost && payment.penaltyHost >= 0 ? (
                                        <div className="form-horizontal">
                                            <div className="form-group">
                                                <label className="sm:col-2 control-label">Host Penalty:</label>
                                                <div className="sm:col-10 p-0">
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={formatIntoPriceValue(payment.penaltyHost, true, false)}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </DashBoardPanel>
                            </DashboardSection>
                            <DashboardSection sectionTitle="Basis of Payment">
                                <DashBoardPanel>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Booking Number:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={payment.reservation?.bookingNumber}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Property:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={payment.propertyName}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Check-in:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={getFormatData(
                                                        payment.checkIn,
                                                        dateConfig.formats.dateOnlyDayAtBackend,
                                                        true
                                                    )}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Check-out:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={getFormatData(
                                                        payment.checkOut,
                                                        dateConfig.formats.dateOnlyDayAtBackend,
                                                        true
                                                    )}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </DashBoardPanel>
                            </DashboardSection>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
};
