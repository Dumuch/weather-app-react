import { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useStores } from '../../../../../../../store';
import { setErrorsMessageFormik, UseLangMessage } from '../../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';
import FrontInput, { InputType } from '../../../../../Global/input';
import { FrontCheckbox } from '../../../../../Global/checkbox';
import { dateConfig } from '../../../../../../../config/date';
import { getFormatData } from '../../../../../../../utils/dateTime';
import { FrontButton } from '../../../../../Global/button';
import ProfileSectionPaymentUpdateCardModal from '../../../../dashboard/profile/payment/modals/modalUpdateCard';
import { BidCreate } from '../../../../../../../models/api';

export interface CardInitialValues {
    number: string;
    expiration: string;
    cvc: string;
    saveCard: boolean;
}

interface Props {
    reservationData: BidCreate;
    propertyId: string;
    proceedToNextStep: () => void;
    setIsNextStepLoading: Dispatch<SetStateAction<boolean>>;
}

const ThirdStep: FC<Props> = observer(({ reservationData, propertyId, proceedToNextStep, setIsNextStepLoading }) => {
    const { userStore, reservationsStore } = useStores();
    const [isUpdatingCard, setIsUpdatingCard] = useState(false);
    const [errors, setErrors] = useState<string | null>('');
    const [visibleModal, setVisibleModal] = useState<'' | 'update_card'>('');
    const card = userStore.stripeCard.data;

    const initialValuesCard: CardInitialValues = {
        number: '',
        expiration: '',
        cvc: '',
        saveCard: false,
    };

    const validationSchemaCard = Yup.object().shape({
        number: Yup.string()
            .required(UseLangMessage('Card Number', ValidationMessage.requiredFront))
            .test('length', UseLangMessage('Card Number', ValidationMessage.invalid), (value) => {
                if (!value) {
                    return true;
                }
                return value.replace(/[^0-9]/g, '').length === 16;
            }),
        expiration: Yup.string()
            .required(UseLangMessage('Expiration', ValidationMessage.requiredFront))
            .test('length', UseLangMessage('Expiration', ValidationMessage.invalid), (value) => {
                if (!value) {
                    return true;
                }
                return value.replace(/[^0-9]/g, '').length === 4;
            }),
        cvc: Yup.string().required(UseLangMessage('CVV', ValidationMessage.requiredFront)),
    });

    const showUpdateCardModal = () => setVisibleModal('update_card');

    const payWithNewCard = async (props: CardInitialValues, actions: FormikHelpers<CardInitialValues>) => {
        setErrors(null);
        try {
            setIsNextStepLoading(true);
            const month = props.expiration.split('/')[0];
            const year = props.expiration.split('/')[1];

            if (props.saveCard) {
                const { data, success } = await userStore.addCard({
                    number: Number(props.number.replace(/[^0-9]/g, '')),
                    exp_month: Number(month),
                    exp_year: Number(year),
                    cvc: props.cvc,
                });

                if (!success) {
                    throw new Error(data);
                }

                await reservationsStore.createBid({
                    checkIn: getFormatData(reservationData.checkIn, dateConfig.formats.dateOnlyDayAtBackend),
                    checkOut: getFormatData(reservationData.checkOut, dateConfig.formats.dateOnlyDayAtBackend),
                    numberOfGuests: reservationData.numberOfGuests,
                    propertyId,
                    nightlyBidAmount: reservationData.nightlyBidAmount,
                    bidTimer: reservationData.bidTimer,
                    bidTimerType: reservationData.bidTimerType,
                });
            } else {
                await reservationsStore.createBid({
                    checkIn: getFormatData(reservationData.checkIn, dateConfig.formats.dateOnlyDayAtBackend),
                    checkOut: getFormatData(reservationData.checkOut, dateConfig.formats.dateOnlyDayAtBackend),
                    numberOfGuests: reservationData.numberOfGuests,
                    propertyId,
                    nightlyBidAmount: reservationData.nightlyBidAmount,
                    bidTimer: reservationData.bidTimer,
                    bidTimerType: reservationData.bidTimerType,
                    card: {
                        number: Number(props.number.replace(/[^0-9]/g, '')),
                        exp_month: Number(month),
                        exp_year: Number(year),
                        cvc: props.cvc,
                    },
                });
            }
            proceedToNextStep();
        } catch (e) {
            if (e instanceof Error) {
                setErrors(e.message);
            } else {
                setErrors('An error has occurred, please try again.');
            }
        } finally {
            setIsNextStepLoading(false);
            actions.setSubmitting(false);
            setIsUpdatingCard(false);
        }
    };

    const payWithSavedCard = async (props: CardInitialValues, actions: FormikHelpers<CardInitialValues>) => {
        setErrors(null);
        try {
            setIsNextStepLoading(true);
            await reservationsStore.createBid({
                checkIn: getFormatData(reservationData.checkIn, dateConfig.formats.dateOnlyDayAtBackend),
                checkOut: getFormatData(reservationData.checkOut, dateConfig.formats.dateOnlyDayAtBackend),
                numberOfGuests: reservationData.numberOfGuests,
                propertyId,
                nightlyBidAmount: reservationData.nightlyBidAmount,
                bidTimer: reservationData.bidTimer,
                bidTimerType: reservationData.bidTimerType,
            });
            proceedToNextStep();
        } catch (e) {
            if (e instanceof Error) {
                setErrors(e.message);
            } else {
                setErrors('An error has occurred, please try again.');
            }
        } finally {
            setIsNextStepLoading(false);
            actions.setSubmitting(false);
        }
    };

    useEffect(() => {
        userStore.getCard();
    }, []);
    return (
        <div className="step-content">
            <h4>Payment Info</h4>
            {!userStore.user?.stripeCardId || !userStore.user?.stripeUserId ? (
                <>
                    <Formik
                        initialValues={initialValuesCard}
                        onSubmit={payWithNewCard}
                        validateOnChange={false}
                        enableReinitialize={true}
                        validationSchema={validationSchemaCard}
                    >
                        {(props) => {
                            setErrorsMessageFormik(props.errors, setErrors);
                            return (
                                <Form id="biddingStep3">
                                    <FrontNotificationField alertType={AlertType.danger} message={errors} />
                                    <div className="form-wrap mb">
                                        <div className="row mb">
                                            <div className="col-sm-12 mb-xs">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Card Number'}
                                                        value={props.values.number ?? ''}
                                                        type={InputType.mask}
                                                        mask={'9999-9999-9999-9999'}
                                                        name={'number'}
                                                        required={true}
                                                        onChange={props.handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb">
                                            <div className="col-sm-6 mb-xs">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Expiration'}
                                                        value={props.values.expiration}
                                                        name={'expiration'}
                                                        type={InputType.mask}
                                                        mask={'99/99'}
                                                        required={true}
                                                        onChange={props.handleChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb-xs">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'CVV'}
                                                        value={props.values.cvc ?? ''}
                                                        name={'cvc'}
                                                        required={true}
                                                        onChange={props.handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb">
                                            <div className="col-sm-6 mb-xs">
                                                <div className="form-group">
                                                    <FrontCheckbox
                                                        label={'Save & remember card'}
                                                        name="saveCard"
                                                        onChange={props.handleChange}
                                                        checked={props.values.saveCard}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="textbox">
                                        <p>
                                            By clicking the &quot;PLACE BID&quot; button below, you agree that if the
                                            host accepts your bid, the total bid amount will be charged to your payment
                                            method entered here in accordance with BidBookStay.com&apos;s policies,
                                            procedures, and Terms & Conditions. Click the &quot;PLACE BID&quot; button
                                            to proceed with placing your bid.
                                        </p>
                                    </div>
                                </Form>
                            );
                        }}
                    </Formik>
                </>
            ) : null}

            {userStore.user?.stripeCardId && userStore.user.stripeUserId && !isUpdatingCard && (
                <>
                    <Formik initialValues={initialValuesCard} onSubmit={payWithSavedCard}>
                        {(props) => {
                            return (
                                <Form id="biddingStep3_1">
                                    <FrontNotificationField alertType={AlertType.danger} message={errors} />
                                    <div className="credit-card-wrap mb">
                                        <div className="credit-card">
                                            <div className="card-type big text-right mb-half">{card?.brand}</div>
                                            <div className="color-dark-grey">Card Number</div>
                                            <div className="card-number mb-half">
                                                <span>****</span>
                                                <span>****</span>
                                                <span>****</span>
                                                <span>{card?.last4}</span>
                                            </div>
                                            <div className="color-dark-grey">Valid thru</div>
                                            <div className="card-exp">
                                                {card && (card.exp_month > 9 ? card.exp_month : `0${card.exp_month}`)}/
                                                {card?.exp_year.toString().slice(card.exp_year.toString().length - 2)}
                                            </div>
                                        </div>
                                        <div className="card-options">
                                            <FrontButton type="button" className="btn-sm" onClick={showUpdateCardModal}>
                                                Update
                                            </FrontButton>
                                            <ProfileSectionPaymentUpdateCardModal
                                                tooltip={
                                                    <>
                                                        If you need to update your current card’s <br />
                                                        expiration date, please use the form below. <br /> <br />
                                                        To use a different payment method, go to the <br />
                                                        &quot;Payment info&quot; tab on your profile, delete the <br />
                                                        current card, and add a new one.
                                                    </>
                                                }
                                                isOpenModal={visibleModal === 'update_card'}
                                                closeModalHandler={() => setVisibleModal('')}
                                            />
                                        </div>
                                    </div>
                                    <div className="textbox">
                                        <p>
                                            By clicking the &quot;PLACE BID&quot; button below, you agree that if the
                                            host accepts your bid, the total bid amount will be charged to your payment
                                            method entered here in accordance with BidBookStay.com&apos;s policies,
                                            procedures, and Terms & Conditions. Click the &quot;PLACE BID&quot; button
                                            to proceed with placing your bid.
                                        </p>
                                    </div>
                                </Form>
                            );
                        }}
                    </Formik>
                </>
            )}
        </div>
    );
});

export default ThirdStep;
