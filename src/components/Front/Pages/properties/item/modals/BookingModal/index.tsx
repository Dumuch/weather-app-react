import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useState, useEffect, useRef } from 'react';

import { ReservationCreate } from '../../../../../../../models/api';
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
import FirstStep from './FirstStep';
import SecondStep from './SecondStep';
import ThirdStep from './ThirdStep';
import CalendarInput from '../../../../index/Masthead/CalendarInput';
import { useStores } from '../../../../../../../store';
import { observer } from 'mobx-react-lite';
import format from 'date-fns/format';
import { dateConfig } from '../../../../../../../config/date';
import { Property } from '../../../../../../../models/api/property';
import { FrontButton } from '../../../../../Global/button';
import { Element } from 'react-scroll';

interface Props {
    property: Property;
    serviceFee: string;
    propertyName: string;
    address: string | null;
    propertyRequiresApproval: boolean;
    costBreakdown: {
        avgNightlyCost: number;
        numberOfNights: number;
        cleaningFee: number;
        additionalFees: number;
        serviceFeeAmount: number;
        taxRate: number;
        total: number;
    };
    reservationData: ReservationCreate;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<PropertySidebarModalsState>>;
    onCloseModal: () => void;
}

interface BookingInitialValues {
    checkIn: string | Date;
    checkOut: string | Date;
    checkInOut: Date[] | null;
    numberOfGuests: number | undefined;
}

const BookingModal: FC<Props> = observer(
    ({
        property,
        serviceFee,
        propertyName,
        address,
        propertyRequiresApproval,
        costBreakdown,
        reservationData,
        isVisible,
        setIsVisible,
        onCloseModal,
    }) => {
        const [reservationCreateData, setReservationCreateData] = useState<ReservationCreate>(reservationData);

        const getParseDate = (dateFromCreateData: string | undefined, dateFromReservationData: string | undefined) => {
            return dateFromCreateData
                ? new Date(dateFromCreateData)
                : dateFromReservationData
                ? new Date(dateFromReservationData)
                : '';
        };

        const initialValues: BookingInitialValues = {
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
        const formRef = useRef<FormikProps<BookingInitialValues>>(null);

        const [errors, setErrors] = useState<string | null>('');
        const [isNextStepLoading, setIsNextStepLoading] = useState(false);
        const { userStore, propertiesStore } = useStores();
        const [currentStep, setCurrentStep] = useState(0);
        const [calculations, setCalculations] = useState<CostCalculations>(costBreakdown);
        const [formValues, setFormValues] = useState(initialValues);

        const toNextStep = () => {
            scrollToElement('notificationScrollToElement', -100, 1000, 'bookingModal_content');
            setCurrentStep((prevStep) => (prevStep < 2 ? prevStep + 1 : prevStep));
        };
        const toPrevStep = () => {
            scrollToElement('notificationScrollToElement', -100, 1000, 'bookingModal_content');
            setCurrentStep((prevStep) => (prevStep >= 1 ? prevStep - 1 : prevStep));
        };

        const modalSteps = [
            <FirstStep key={1} />,
            <SecondStep
                key={2}
                reservationData={reservationCreateData}
                propertyId={property.id}
                proceedToNextStep={toNextStep}
                setIsNextStepLoading={setIsNextStepLoading}
            />,
            <ThirdStep key={3} requiresApproval={propertyRequiresApproval} />,
        ];

        const validationSchema = Yup.object().shape({
            checkInOut: Yup.array()
                .required(UseLangMessage('Check-in Check-out', ValidationMessage.requiredFront))
                .typeError(UseLangMessage('Check-in Check-out', ValidationMessage.requiredFront)),
            numberOfGuests: Yup.number().required(UseLangMessage('Guests', ValidationMessage.requiredFront)),
        });

        const onSubmit = async (values: BookingInitialValues, formikHelpers: FormikHelpers<BookingInitialValues>) => {
            setErrors(null);
            try {
                const availabilities = await propertiesStore.checkAvailability({
                    checkIn: format(new Date(values.checkIn), dateConfig.formats.dateOnlyDayAtBackend),
                    checkOut: format(new Date(values.checkOut), dateConfig.formats.dateOnlyDayAtBackend),
                    numberOfGuests: values.numberOfGuests,
                });
                if (availabilities && availabilities.availabilityList.length > 0) {
                    const nightsAvailabilities = availabilities?.availabilityList;
                    if (values.numberOfGuests) {
                        setReservationCreateData({
                            ...values,
                            propertyId: propertiesStore.item?.item?.id ?? '',
                            checkIn: format(new Date(values.checkIn), dateConfig.formats.dateOnlyDayAtBackend),
                            checkOut: format(new Date(values.checkOut), dateConfig.formats.dateOnlyDayAtBackend),
                        });
                    }
                    const avgPerNight =
                        nightsAvailabilities.reduce((prev: number, next) => prev + (next.nightlyPrice ?? 0), 0) /
                        nightsAvailabilities.length;

                    const taxRate =
                        (avgPerNight * nightsAvailabilities.length +
                            (property.cleaningFee ?? 0) +
                            (property.additionalFees ?? 0)) *
                        ((property.taxRate ?? 0) / 100);

                    const serviceFeeCount =
                        (avgPerNight * nightsAvailabilities.length +
                            (property.cleaningFee ?? 0) +
                            taxRate +
                            (property.additionalFees ?? 0)) *
                        (Number(serviceFee) / 100);

                    const totalAmount =
                        avgPerNight * nightsAvailabilities.length +
                        (property.cleaningFee ?? 0) +
                        taxRate +
                        (property.additionalFees ?? 0) +
                        serviceFeeCount;

                    setCalculations((prevState) => ({
                        ...prevState,
                        avgNightlyCost: avgPerNight,
                        numberOfNights: nightsAvailabilities.length,
                        serviceFeeAmount: serviceFeeCount,
                        total: totalAmount,
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

        const hideModal = (props?: FormikProps<BookingInitialValues>) => {
            setIsVisible('');
            props?.resetForm();
        };

        const onHide = (props?: FormikProps<BookingInitialValues>) => () => {
            if (!props?.isSubmitting && !isNextStepLoading) {
                setErrors(null);
                hideModal(props);
            }
            // reset form in sidebar on last step
            if (!props?.isSubmitting && !isNextStepLoading && currentStep === 2) {
                onCloseModal();
            }
        };

        useEffect(() => {
            setCalculations({ ...costBreakdown });
        }, [isVisible]);

        useEffect(() => {
            (async () => {
                if (formRef.current) {
                    setErrors(null);
                    const availabilities = await propertiesStore.checkAvailability({
                        checkIn: format(
                            new Date(formRef.current!.values.checkIn),
                            dateConfig.formats.dateOnlyDayAtBackend
                        ),
                        checkOut: format(
                            new Date(formRef.current!.values.checkOut),
                            dateConfig.formats.dateOnlyDayAtBackend
                        ),
                        numberOfGuests: formRef.current!.values.numberOfGuests,
                    });

                    if (availabilities && availabilities.availabilityList.length > 0) {
                        const nightsAvailabilities = availabilities?.availabilityList;
                        if (formRef.current.values.numberOfGuests) {
                            setReservationCreateData({
                                ...formRef.current.values,
                                propertyId: propertiesStore.item?.item?.id ?? '',
                                checkIn: format(
                                    new Date(formRef.current.values.checkIn),
                                    dateConfig.formats.dateOnlyDayAtBackend
                                ),
                                checkOut: format(
                                    new Date(formRef.current.values.checkOut),
                                    dateConfig.formats.dateOnlyDayAtBackend
                                ),
                            });
                        }
                        const avgPerNight =
                            nightsAvailabilities.reduce((prev: number, next) => prev + (next.nightlyPrice ?? 0), 0) /
                            nightsAvailabilities.length;

                        const taxRate =
                            (avgPerNight * nightsAvailabilities.length +
                                (property.cleaningFee ?? 0) +
                                (property.additionalFees ?? 0)) *
                            ((property.taxRate ?? 0) / 100);

                        const serviceFeeCount =
                            (avgPerNight * nightsAvailabilities.length +
                                (property.cleaningFee ?? 0) +
                                taxRate +
                                (property.additionalFees ?? 0)) *
                            (Number(serviceFee) / 100);

                        const totalAmount =
                            avgPerNight * nightsAvailabilities.length +
                            (property.cleaningFee ?? 0) +
                            taxRate +
                            (property.additionalFees ?? 0) +
                            serviceFeeCount;

                        setCalculations((prevState) => ({
                            ...prevState,
                            taxRate,
                            avgNightlyCost: avgPerNight,
                            numberOfNights: nightsAvailabilities.length,
                            serviceFeeAmount: serviceFeeCount,
                            total: totalAmount,
                        }));
                    } else {
                        availabilities && setErrors(availabilities.errorList.join('\n'));
                    }
                }
            })();
        }, [formRef.current?.values.checkIn, formRef.current?.values.checkOut]);

        useEffect(() => {
            scrollToElement('notificationScrollToElement', -100, 1000, 'bookingModal_content');
        }, [errors]);

        return (
            <Formik
                initialValues={initialValues}
                enableReinitialize
                onSubmit={onSubmit}
                validationSchema={validationSchema}
                validateOnChange={false}
                innerRef={formRef}
            >
                {(props) => {
                    setFormValues(props.values);
                    setErrorsMessageFormik(props.errors, setErrors);
                    return (
                        <FrontModal
                            visible={isVisible}
                            header="Book Now"
                            position="center"
                            dismissableMask
                            onHide={onHide(props)}
                            id="bookingModal"
                            className="booking-process-modal modal-lg p-dialog-content_scroll"
                            footer={
                                currentStep === 0 ? (
                                    <ModalFooter<BookingInitialValues>
                                        formId="bookingStep1"
                                        primaryButtonText={'Agree & Continue'}
                                        closeModalHandler={onHide(props)}
                                        isCancelLoading={props.isSubmitting}
                                        isSubmitting={props.isSubmitting}
                                        resetForm={props.resetForm}
                                    />
                                ) : currentStep === 1 ? (
                                    <>
                                        <div className="buttons-group width0">
                                            <FrontButton
                                                icon="pi pi-angle-left"
                                                className="clear-btn"
                                                onClick={toPrevStep}
                                                disabled={isNextStepLoading}
                                            >
                                                Back
                                            </FrontButton>
                                            <FrontButton
                                                form={
                                                    !userStore.user?.stripeCardId || !userStore.user?.stripeUserId
                                                        ? 'bookingStep2'
                                                        : 'bookingStep2_1'
                                                }
                                                loading={isNextStepLoading}
                                            >
                                                BOOK NOW
                                            </FrontButton>
                                        </div>
                                    </>
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
                                        <Form id="bookingStep1">
                                            <FrontNotificationField alertType={AlertType.danger} message={errors} />
                                            <div className="check-dates mb ">
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
                                                {formatIntoPriceValue(calculations.avgNightlyCost, true, true, 2)} per
                                                night * {calculations.numberOfNights} nights
                                            </div>
                                            <div>
                                                {formatIntoPriceValue(
                                                    calculations.avgNightlyCost * calculations.numberOfNights,
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
                                                    calculations.serviceFeeAmount ?? 0,
                                                    true,
                                                    true,
                                                    2
                                                )}
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div>Tax Rate</div>
                                            <div>{formatIntoPriceValue(calculations.taxRate, true, true, 2)}</div>
                                        </div>
                                    </div>
                                    <div className="cost-table mb">
                                        <div className="item">
                                            <div>
                                                <span className="big">Total</span>
                                            </div>
                                            <div>
                                                <span className="big">
                                                    {formatIntoPriceValue(calculations.total, true, true, 2)}
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

export default BookingModal;
