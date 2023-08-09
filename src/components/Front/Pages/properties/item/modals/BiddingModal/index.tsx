import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useState, useEffect } from 'react';

import { BidCreate } from '../../../../../../../models/api';
import { CostCalculations, PropertySidebarModalsState } from '../../PropertySidebar';
import {
    formatIntoPriceValue,
    initialCheckInOut,
    scrollToElement,
    setErrorsMessageFormik,
    UseLangMessage,
} from '../../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../../lang/en/validatons';
import { FrontModal } from '../../../../../Global/modal';
import ModalFooter from '../../../../../Global/modalFooter';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';
import FrontInput, { InputType } from '../../../../../Global/input';
import SecondStep from './SecondStep';
import ThirdStep from './ThirdStep';
import FourthStep from './FourthStep';
import CalendarInput from '../../../../index/Masthead/CalendarInput';
import { useStores } from '../../../../../../../store';
import { observer } from 'mobx-react-lite';
import differenceInDays from 'date-fns/differenceInDays';
import format from 'date-fns/format';

import { dateConfig } from '../../../../../../../config/date';
import { Property } from '../../../../../../../models/api/property';
import { FrontButton } from '../../../../../Global/button';
import FirstStep from './FirstStep';
import { Element } from 'react-scroll';

interface Props {
    property: Property;
    serviceFee: string;
    propertyName: string;
    address: string | null;
    costBreakdown: {
        minimumBid: number;
        avgNightlyCost: number;
        numberOfNights: number;
        cleaningFee: number;
        additionalFees: number;
        serviceFeeAmount: number;
        taxRate: number;
        total: number;
    };
    reservationData: BidCreate;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<PropertySidebarModalsState>>;
    onCloseModal: () => void;
}

export interface BiddingInitialValues {
    bidAmount: number | null;
    bidTimer: number | null;
    bidUnit: string;
    checkIn: string | Date;
    checkOut: string | Date;
    checkInOut: Date[] | null;
    numberOfGuests: number | undefined;
}

const BiddingModal: FC<Props> = observer(
    ({
        property,
        serviceFee,
        propertyName,
        address,
        costBreakdown,
        reservationData,
        isVisible,
        setIsVisible,
        onCloseModal,
    }) => {
        const [reservationCreateData, setReservationCreateData] = useState<BidCreate>(reservationData);

        const bidTimerUnits = [
            { id: '1', name: 'hours' },
            { id: '2', name: 'days' },
        ];

        const getParseDate = (dateFromCreateData: string | undefined, dateFromReservationData: string | undefined) => {
            return dateFromCreateData
                ? new Date(dateFromCreateData)
                : dateFromReservationData
                ? new Date(dateFromReservationData)
                : '';
        };

        const initialValues: BiddingInitialValues = {
            bidAmount: reservationCreateData.nightlyBidAmount || null,
            bidTimer: reservationCreateData.bidTimer || null,
            bidUnit:
                reservationCreateData.bidTimerType === 'hours'
                    ? '1'
                    : (reservationCreateData.bidTimerType = 'days' ? '2' : '1'),
            checkIn: getParseDate(reservationCreateData.checkIn, reservationData?.checkIn),
            checkOut: getParseDate(reservationCreateData.checkOut, reservationData?.checkOut),
            checkInOut: initialCheckInOut(
                getParseDate(reservationCreateData.checkIn, reservationData?.checkIn),
                getParseDate(reservationCreateData.checkOut, reservationData?.checkOut)
            ),
            numberOfGuests: reservationCreateData.numberOfGuests
                ? reservationCreateData.numberOfGuests
                : reservationData?.numberOfGuests,
        };

        const [errors, setErrors] = useState<string | null>('');
        const [isNextStepLoading, setIsNextStepLoading] = useState(false);
        const { userStore, propertiesStore } = useStores();
        const [currentStep, setCurrentStep] = useState(0);
        const [calculations, setCalculations] = useState<CostCalculations>(costBreakdown);
        const [formValues, setFormValues] = useState(initialValues);

        const toNextStep = () => {
            scrollToElement('notificationScrollToElement', -100, 1000, 'biddingModal_content');
            setCurrentStep((prevStep) => (prevStep < 3 ? prevStep + 1 : prevStep));
        };
        const toPrevStep = () => {
            scrollToElement('notificationScrollToElement', -100, 1000, 'biddingModal_content');
            setCurrentStep((prevStep) => (prevStep >= 1 ? prevStep - 1 : prevStep));
        };

        const modalSteps = [
            <FirstStep key={1} errors={errors} minimumBid={calculations.minimumBid ?? 0} bidUnits={bidTimerUnits} />,
            <SecondStep key={2} />,
            <ThirdStep
                key={3}
                reservationData={reservationCreateData}
                propertyId={property.id}
                proceedToNextStep={toNextStep}
                setIsNextStepLoading={setIsNextStepLoading}
            />,
            <FourthStep key={4} />,
        ];

        const validationSchema = Yup.object().shape({
            bidAmount: Yup.number()
                .required(UseLangMessage('Nightly bid amount', `Form Error ${ValidationMessage.requiredFront}`))
                .typeError(UseLangMessage('Nightly bid amount', `Form Error ${ValidationMessage.requiredFront}`)),
            bidTimer: Yup.number()
                .test(
                    'isInt',
                    UseLangMessage('Bid timer value', `Form Error ${ValidationMessage.onlyInteger}`),
                    (value) => {
                        if (!value) {
                            return true;
                        }
                        return Number.isInteger(value);
                    }
                )
                .required(UseLangMessage('Bid timer value', `Form Error ${ValidationMessage.requiredFront}`))
                .typeError(UseLangMessage('Bid timer value', `Form Error ${ValidationMessage.requiredFront}`)),
            checkInOut: Yup.array()
                .required(UseLangMessage('Check-in Check-out', ValidationMessage.requiredFront))
                .typeError(UseLangMessage('Check-in Check-out', ValidationMessage.requiredFront)),
            numberOfGuests: Yup.number().required(UseLangMessage('Guests', ValidationMessage.requiredFront)),
        });

        const onSubmit = async (values: BiddingInitialValues, formikHelpers: FormikHelpers<BiddingInitialValues>) => {
            let bidTimerHours = 0;
            switch (values.bidUnit) {
                case '1':
                    bidTimerHours = values.bidTimer ?? 0;
                    break;
                case '2':
                    bidTimerHours = (values.bidTimer ?? 0) * 24;
                    break;
            }
            setErrors(null);
            try {
                const availabilities = await propertiesStore.checkAvailability({
                    checkIn: format(new Date(values.checkIn), dateConfig.formats.dateOnlyDayAtBackend),
                    checkOut: format(new Date(values.checkOut), dateConfig.formats.dateOnlyDayAtBackend),
                    numberOfGuests: values.numberOfGuests,
                    nightlyBidAmount: values.bidAmount || 0,
                    isBid: true,
                    bidTimer: bidTimerHours,
                    bidTimerType: bidTimerUnits.find((item) => item.id === values.bidUnit)?.name ?? 'hours',
                });
                if (availabilities && availabilities.availabilityList.length > 0) {
                    const nightsAvailabilities = availabilities?.availabilityList;
                    if (values.numberOfGuests) {
                        setReservationCreateData({
                            ...values,
                            nightlyBidAmount: values.bidAmount || 0,
                            bidTimer: bidTimerHours,
                            bidTimerType: 'hours',
                            propertyId: propertiesStore.item?.item?.id ?? '',
                            checkIn: format(new Date(values.checkIn), dateConfig.formats.dateOnlyDayAtBackend),
                            checkOut: format(new Date(values.checkOut), dateConfig.formats.dateOnlyDayAtBackend),
                        });
                    }

                    const minBid = Math.max(
                        ...nightsAvailabilities.map((availability) => availability.minNightBidPrice ?? 0)
                    );

                    const avgPerNight = nightsAvailabilities.length * (formValues.bidAmount ?? 0);

                    const taxRate =
                        (avgPerNight + (property.cleaningFee ?? 0) + (property.additionalFees ?? 0)) *
                        ((property.taxRate ?? 0) / 100);

                    const serviceFeeCount =
                        (avgPerNight + (property.cleaningFee ?? 0) + taxRate + (property.additionalFees ?? 0)) *
                        (Number(serviceFee) / 100);

                    const totalAmount =
                        avgPerNight +
                        (property.cleaningFee ?? 0) +
                        taxRate +
                        (property.additionalFees ?? 0) +
                        serviceFeeCount;

                    setCalculations((prevState) => ({
                        ...prevState,
                        avgNightlyCost: avgPerNight,
                        taxRate,
                        numberOfNights: availabilities.availabilityList.length - 1,
                        serviceFeeAmount: serviceFeeCount,
                        total: totalAmount,
                        minimumBid: minBid,
                    }));

                    toNextStep();
                } else {
                    availabilities && setErrors(availabilities.errorList.join('\n'));
                }
            } catch (e) {
                console.error('Error with availability onSubmit', e);
            } finally {
                formikHelpers.setSubmitting(false);
            }
        };

        const hideModal = (props?: FormikProps<BiddingInitialValues>) => {
            setIsVisible('');
            props?.resetForm();
        };

        const onHide = (props?: FormikProps<BiddingInitialValues>) => () => {
            if (!props?.isSubmitting && !isNextStepLoading) {
                setErrors(null);
                hideModal(props);
            }
            // reset form in sidebar on last step
            if (!props?.isSubmitting && !isNextStepLoading && currentStep === 3) {
                onCloseModal();
            }
        };

        useEffect(() => {
            setCalculations({ ...costBreakdown });
        }, [isVisible]);

        useEffect(() => {
            setCalculations((prevState) => {
                const taxRate =
                    ((prevState.numberOfNights ?? 0) * (formValues.bidAmount ?? 0) +
                        (property.cleaningFee ?? 0) +
                        (property.additionalFees ?? 0)) *
                    ((property.taxRate ?? 0) / 100);
                const serviceFeeCount =
                    ((prevState.numberOfNights ?? 0) * (formValues.bidAmount ?? 0) +
                        (property.cleaningFee ?? 0) +
                        taxRate +
                        (property.additionalFees ?? 0)) *
                    (Number(serviceFee) / 100);

                const totalAmount =
                    (prevState.numberOfNights ?? 0) * (formValues.bidAmount ?? 0) +
                    (property.cleaningFee ?? 0) +
                    taxRate +
                    (property.additionalFees ?? 0) +
                    serviceFeeCount;
                return { ...prevState, taxRate, total: totalAmount };
            });
        }, [formValues.bidAmount]);

        useEffect(() => {
            scrollToElement('notificationScrollToElement', -100, 1000, 'biddingModal_content');
        }, [errors]);

        return (
            <Formik
                initialValues={initialValues}
                enableReinitialize
                onSubmit={onSubmit}
                validationSchema={validationSchema}
                validateOnChange={false}
            >
                {(props) => {
                    setFormValues(props.values);
                    setErrorsMessageFormik(props.errors, setErrors);
                    return (
                        <FrontModal
                            visible={isVisible}
                            header="Place Bid"
                            position="center"
                            dismissableMask
                            onHide={onHide(props)}
                            id="biddingModal"
                            className="booking-process-modal modal-lg p-dialog-content_scroll"
                            footer={
                                currentStep === 0 ? (
                                    <ModalFooter<BiddingInitialValues>
                                        formId="biddingStep1"
                                        primaryButtonText={'Next'}
                                        closeModalHandler={onHide(props)}
                                        isSubmitting={props.isSubmitting}
                                        isCancelLoading={props.isSubmitting}
                                        resetForm={props.resetForm}
                                    />
                                ) : currentStep === 1 ? (
                                    <div className="buttons-group width0">
                                        <FrontButton icon="pi pi-angle-left" className="clear-btn" onClick={toPrevStep}>
                                            Back
                                        </FrontButton>
                                        <FrontButton key="wontsubmit" onClick={toNextStep}>
                                            Agree & Continue
                                        </FrontButton>
                                    </div>
                                ) : currentStep === 2 ? (
                                    <div className="buttons-group width0">
                                        <FrontButton
                                            icon="pi pi-angle-left"
                                            className="clear-btn"
                                            disabled={isNextStepLoading}
                                            onClick={toPrevStep}
                                        >
                                            Back
                                        </FrontButton>
                                        <FrontButton
                                            key="willsubmit"
                                            form={
                                                !userStore.user?.stripeCardId || !userStore.user?.stripeUserId
                                                    ? 'biddingStep3'
                                                    : 'biddingStep3_1'
                                            }
                                            loading={isNextStepLoading}
                                        >
                                            PLACE BID
                                        </FrontButton>
                                    </div>
                                ) : (
                                    <ModalFooter success={true} />
                                )
                            }
                        >
                            <div className="booking-step-content-wrap">
                                <Element name="notificationScrollToElement" />
                                {modalSteps[currentStep]}
                                <div className="property-book-details">
                                    <h4 className="h5-style color-black">{propertyName}</h4>
                                    <div className="property-location mb">{address}</div>

                                    <div className="trip-details form-wrap mb">
                                        <Form id="biddingStep1">
                                            <FrontNotificationField
                                                alertType={AlertType.danger}
                                                message={
                                                    errors
                                                        ?.split('\n')
                                                        .filter((error) => error.indexOf('Form Error') === -1)
                                                        .join('\n') ?? ''
                                                }
                                            />
                                            <div className="check-dates mb">
                                                <div className="form-group w-full">
                                                    <CalendarInput
                                                        label="Check-in Check-out"
                                                        calendarClassName="calendar-input"
                                                        disabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <FrontInput
                                                    name="numberOfGuests"
                                                    value={props.values.numberOfGuests}
                                                    onChange={props.handleChange}
                                                    label="Guests"
                                                    type={InputType.number}
                                                    min={1}
                                                    readOnly={true}
                                                />
                                            </div>
                                        </Form>
                                    </div>
                                    <div className="cost-table mb">
                                        <div className="item">
                                            <div>
                                                {formatIntoPriceValue(
                                                    props.values.bidAmount ? props.values.bidAmount : 0,
                                                    true,
                                                    true,
                                                    2
                                                )}{' '}
                                                per night *{' '}
                                                {differenceInDays(
                                                    new Date(props.values.checkOut),
                                                    new Date(props.values.checkIn)
                                                )}{' '}
                                                nights
                                            </div>
                                            <div>
                                                {formatIntoPriceValue(
                                                    differenceInDays(
                                                        new Date(props.values.checkOut),
                                                        new Date(props.values.checkIn)
                                                    ) * (props.values.bidAmount ?? 0),
                                                    true,
                                                    true,
                                                    2
                                                )}
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div>Cleaning Fee</div>
                                            <div>{formatIntoPriceValue(property.cleaningFee ?? 0, true, true, 2)}</div>
                                        </div>
                                        <div className="item">
                                            <div>Additional Fees</div>
                                            <div>
                                                {formatIntoPriceValue(property.additionalFees ?? 0, true, true, 2)}
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div>Service Fee</div>
                                            <div>
                                                {formatIntoPriceValue(
                                                    (differenceInDays(
                                                        new Date(props.values.checkOut),
                                                        new Date(props.values.checkIn)
                                                    ) *
                                                        (props.values.bidAmount ?? 0) +
                                                        (property.cleaningFee ?? 0) +
                                                        differenceInDays(
                                                            new Date(props.values.checkOut),
                                                            new Date(props.values.checkIn)
                                                        ) *
                                                            (formValues.bidAmount ?? 0) *
                                                            ((property.taxRate ?? 0) / 100) +
                                                        (property.additionalFees ?? 0)) *
                                                        (Number(serviceFee) / 100),
                                                    true,
                                                    true,
                                                    2
                                                )}
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div>Tax Rate</div>
                                            <div>
                                                {formatIntoPriceValue(
                                                    differenceInDays(
                                                        new Date(props.values.checkOut),
                                                        new Date(props.values.checkIn)
                                                    ) *
                                                        (formValues.bidAmount ?? 0) *
                                                        ((property.taxRate ?? 0) / 100),
                                                    true,
                                                    true,
                                                    2
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cost-table mb">
                                        <div className="item">
                                            <div>
                                                <span className="big">Total Bid</span>
                                            </div>
                                            <div>
                                                <span className="big">
                                                    {formatIntoPriceValue(
                                                        differenceInDays(
                                                            new Date(props.values.checkOut),
                                                            new Date(props.values.checkIn)
                                                        ) *
                                                            (formValues.bidAmount ?? 0) +
                                                            (property.cleaningFee ?? 0) +
                                                            differenceInDays(
                                                                new Date(props.values.checkOut),
                                                                new Date(props.values.checkIn)
                                                            ) *
                                                                (formValues.bidAmount ?? 0) *
                                                                ((property.taxRate ?? 0) / 100) +
                                                            (property.additionalFees ?? 0) +
                                                            (differenceInDays(
                                                                new Date(props.values.checkOut),
                                                                new Date(props.values.checkIn)
                                                            ) *
                                                                (formValues.bidAmount ?? 0) +
                                                                (property.cleaningFee ?? 0) +
                                                                differenceInDays(
                                                                    new Date(props.values.checkOut),
                                                                    new Date(props.values.checkIn)
                                                                ) *
                                                                    (formValues.bidAmount ?? 0) *
                                                                    ((property.taxRate ?? 0) / 100) +
                                                                (property.additionalFees ?? 0)) *
                                                                (Number(serviceFee) / 100),
                                                        true,
                                                        true,
                                                        2
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FrontModal>
                    );
                }}
            </Formik>
        );
    }
);

export default BiddingModal;
