import React, { FC, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import * as Yup from 'yup';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import format from 'date-fns/format';
import isBefore from 'date-fns/isBefore';
import isValid from 'date-fns/isValid';
import parseISO from 'date-fns/parseISO';

import { Element } from 'react-scroll';
import { Property, PropertyAvailability, PropertyAvailabilityStatus } from '../../../../../models/api/property';
import { useStores } from '../../../../../store';
import { AlertType, FrontNotificationField } from '../../../Global/notificationField';
import { Avatar } from 'primereact/avatar';
import { FrontImage } from '../../../Global/image';
import {
    concatString,
    formatIntoPriceValue,
    initialCheckInOut,
    scrollToElement,
    setErrorsMessageFormik,
    UseLangMessage,
} from '../../../../../utils/helpers';
import ContactHostModal from './modals/ContactHostModal';
import { dateConfig } from '../../../../../config/date';
import CalendarInput from '../../index/Masthead/CalendarInput';
import { FrontButton } from '../../../Global/button';
import { ReservationCreate, UserType } from '../../../../../models/api';
import { ValidationMessage } from '../../../../../lang/en/validatons';
import FrontInput, { InputType } from '../../../Global/input';
import { useRouter } from 'next/router';
import PolicyDetailsModal from './modals/PolicyDetailsModal';
import BookingModal from './modals/BookingModal';
import BiddingModal from './modals/BiddingModal';
import FrontSkeleton from '../../../Global/skeleton';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import { eachDayOfInterval, isEqual } from 'date-fns';

interface Props {
    property: Property;
    serviceFee: string;
}

interface initialValuesInterface {
    checkIn: string | Date;
    checkOut: string | Date;
    numberOfGuests: number | string | undefined;
    checkInOut: Date[] | null;
}

export interface CostCalculations {
    minimumBid?: number;
    taxRate: number;
    avgNightlyCost: number;
    numberOfNights: number;
    serviceFeeAmount: number;
    total: number;
}

export type PropertySidebarModalsState = '' | 'bid' | 'book' | 'policy_details' | 'contact_host';

const PropertySidebar: FC<Props> = observer(({ property, serviceFee }) => {
    const router = useRouter();
    const formRef = useRef<FormikProps<initialValuesInterface>>(null);
    const { userStore, propertiesStore, reservationsStore } = useStores();
    const [currentProperty, setCurrentProperty] = useState<Property>(property);
    const defaultCalendarView =
        propertiesStore.searchComponent.filters.checkIn || propertiesStore.searchComponent.filters.checkOut;

    const getParseDate = (dateFromRouter: string[] | string | undefined, dateFromState: string | undefined) => {
        return typeof dateFromRouter === 'string' && isValid(parseISO(dateFromRouter))
            ? parseISO(dateFromRouter)
            : dateFromState
            ? new Date(dateFromState)
            : '';
    };

    const initialValues: initialValuesInterface = {
        checkIn: getParseDate(router.query.checkIn, propertiesStore.searchComponent.filters.checkIn),
        checkOut: getParseDate(router.query.checkOut, propertiesStore.searchComponent.filters.checkOut),
        checkInOut: initialCheckInOut(
            getParseDate(router.query.checkIn, propertiesStore.searchComponent.filters.checkIn),
            getParseDate(router.query.checkOut, propertiesStore.searchComponent.filters.checkOut)
        ),
        numberOfGuests:
            typeof router.query.guests === 'string'
                ? Number(router.query.guests)
                : propertiesStore.searchComponent.filters.guests ?? 1,
    };

    const [currentUserType, setCurrentUserType] = useState<UserType | null>(null);
    const [activeBidsLoading, setActiveBidsLoading] = useState(false);
    const [isHighlightMessage, setIsHighlightMessage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reservationCreateData, setReservationCreateData] = useState<ReservationCreate | null>(null);
    const [formValues, setFormValues] = useState(initialValues);
    const [viewDate, setViewDate] = useState(() => (defaultCalendarView ? new Date(defaultCalendarView) : new Date()));
    const [activeYear, setActiveYear] = useState(Number(new Date().getFullYear()));
    const [disabledDates, setDisabledDates] = useState<Date[]>([]);

    const [calculations, setCalculations] = useState<CostCalculations>({
        avgNightlyCost: 0,
        taxRate: 0,
        numberOfNights: 0,
        serviceFeeAmount: 0,
        total: 0,
    });
    const [visibleModal, setVisibleModal] = useState<PropertySidebarModalsState>('');
    const [isLoading, setIsLoading] = useState(true);
    const fullAddress = concatString(
        [
            currentProperty.address1 ?? '',
            currentProperty.address2 ?? '',
            currentProperty.city ?? '',
            currentProperty.state ?? '',
            currentProperty.zip ?? '',
        ],
        ','
    );

    const [availabilities, setAvailabilities] = useState<PropertyAvailability[]>([]);

    const partialAddress = concatString([currentProperty.city ?? '', currentProperty.state ?? ''], ',');

    const showPlaceBidModal = async () => {
        if (!userStore.user) {
            scrollToElement('details_scrollTo', -300);
            setError('Booking & bid process is not possible if the user is not logged in. Please log in first');
            return;
        }

        setActiveBidsLoading(true);
        await reservationsStore.checkUserHasActiveBids({ propertyId: currentProperty.id });
        setActiveBidsLoading(false);

        if (reservationsStore.hasActiveBids) {
            scrollToElement('details_scrollTo', -300);
            setError('You can have only one active bid at a time');
            return;
        }
        setVisibleModal('bid');
    };

    const showBookNowModal = () => {
        if (!userStore.user) {
            scrollToElement('details_scrollTo', -300);
            setError('Booking & bid process is not possible if the user is not logged in. Please log in first');
            return;
        }
        setVisibleModal('book');
    };
    const onCloseBookNowModal = () => {
        setReservationCreateData(null);
        setCalculations({
            avgNightlyCost: 0,
            numberOfNights: 0,
            taxRate: 0,
            serviceFeeAmount: 0,
            total: 0,
        });
        formRef.current?.resetForm();
        formRef.current?.setFieldValue('numberOfGuests', '');
    };

    const showPolicyDetailsModal = () => setVisibleModal('policy_details');
    const showContactHostModal = () => {
        if (!userStore.user) {
            scrollToElement('details_scrollTo', -300);
            setError('You must be logged in to contact the host. Please create an account or log in to continue.');
            return;
        }
        setVisibleModal('contact_host');
    };

    const validationSchema = Yup.object().shape({
        checkInOut: Yup.array()
            .test('max', '', (value) => {
                if (!value) {
                    setIsHighlightMessage(true);
                    return false;
                }
                return true;
            })
            .required(UseLangMessage('Check-in Check-out', ValidationMessage.requiredFront))
            .typeError(UseLangMessage('Check-in Check-out', ValidationMessage.requiredFront)),

        numberOfGuests: Yup.number()
            .required(UseLangMessage('Number of Guests', ValidationMessage.requiredFront))
            .test('is-decimal', UseLangMessage('Number of Guests', ValidationMessage.invalid), (value) => {
                return !!!(value + '').match(/^\d*\.{1}\d*$/);
            })
            .test(
                'max',
                `It is not possible to accommodate more than ${currentProperty.numberOfGuests} guests at this currentProperty. Choose another property or message the host`,
                (value) => {
                    return Number(value) <= (currentProperty.numberOfGuests || 50);
                }
            )
            .test('min', 'There should be at least 1 guest to accommodate this property', (value) => {
                return Number(value) >= 1;
            }),
    });
    const onSubmit = async (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        setIsLoading(true);
        try {
            await propertiesStore.get(currentProperty.id, true).then((value) => value && setCurrentProperty(value));

            const availabilities = await propertiesStore.checkAvailability({
                checkIn: props.checkInOut ? format(props.checkInOut[0], dateConfig.formats.dateOnlyDayAtBackend) : '',
                checkOut: props.checkInOut ? format(props.checkInOut[1], dateConfig.formats.dateOnlyDayAtBackend) : '',
                numberOfGuests: Number(props.numberOfGuests),
            });

            if (availabilities && availabilities.availabilityList.length > 0) {
                setAvailabilities(availabilities.availabilityList);
                setReservationCreateData({
                    ...props,
                    propertyId: propertiesStore.item?.item?.id ?? '',
                    checkIn: props.checkInOut
                        ? format(props.checkInOut[0], dateConfig.formats.dateOnlyDayAtBackend)
                        : '',
                    checkOut: props.checkInOut
                        ? format(props.checkInOut[1], dateConfig.formats.dateOnlyDayAtBackend)
                        : '',
                    numberOfGuests: Number(props.numberOfGuests),
                    isAvailableForBid: availabilities.isAvailableForBid,
                });
            } else {
                scrollToElement('details_scrollTo', -300);
                availabilities && setError(availabilities.errorList.join('\n'));
            }
        } catch (e) {
            console.error('Error with availability onSubmit', e);
        } finally {
            setIsLoading(false);
            formikHelpers.setSubmitting(false);
        }
    };

    useEffect(() => {
        setReservationCreateData(null);
        // hide "total" block, if dates has changed
        setCalculations((prevState) => ({ ...prevState, total: 0 }));
    }, [formValues.checkIn, formValues.checkOut, formValues.checkInOut]);

    useEffect(() => {
        if (availabilities && availabilities.length > 0) {
            const nightsAvailabilities = availabilities;

            const minBid = Math.max(...nightsAvailabilities.map((availability) => availability.minNightBidPrice ?? 0));
            const avgPerNight =
                nightsAvailabilities.reduce((prev: number, next) => prev + (next.nightlyPrice ?? 0), 0) /
                nightsAvailabilities.length;

            const taxRate =
                (avgPerNight * nightsAvailabilities.length +
                    (currentProperty.cleaningFee ?? 0) +
                    (currentProperty.additionalFees ?? 0)) *
                ((currentProperty.taxRate ?? 0) / 100);

            const serviceFeeCount =
                (avgPerNight * nightsAvailabilities.length +
                    (currentProperty.cleaningFee ?? 0) +
                    taxRate +
                    (currentProperty.additionalFees ?? 0)) *
                (Number(serviceFee) / 100);

            const totalAmount =
                avgPerNight * nightsAvailabilities.length +
                (currentProperty.cleaningFee ?? 0) +
                taxRate +
                (currentProperty.additionalFees ?? 0) +
                serviceFeeCount;

            setCalculations((prevState) => ({
                ...prevState,
                avgNightlyCost: avgPerNight,
                taxRate,
                numberOfNights: nightsAvailabilities.length,
                serviceFeeAmount: serviceFeeCount,
                total: totalAmount,
                minimumBid: minBid,
            }));
        }
    }, [availabilities]);

    useEffect(() => {
        let isCheckInBefore = false;
        const parsedCheckIn = typeof router.query.checkIn === 'string' ? parseISO(router.query.checkIn) : null;
        const parsedCheckOut = typeof router.query.checkOut === 'string' ? parseISO(router.query.checkOut) : null;
        const isValidCheckIn = isValid(parsedCheckIn);
        const isValidCheckOut = isValid(parsedCheckOut);

        if (parsedCheckIn !== null && parsedCheckOut !== null) {
            isCheckInBefore = isBefore(parsedCheckIn, parsedCheckOut);
        }
        if (formRef.current && isValidCheckIn && isValidCheckOut && isCheckInBefore) {
            formRef.current.handleSubmit();
        } else if (!userStore.isColdStart) {
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    }, [router.query.checkIn, router.query.checkOut, formRef.current?.values.checkIn, userStore.isColdStart]);

    useEffect(() => {
        setCurrentUserType(userStore.activeType);
    }, [userStore.activeType]);

    const onSubmitForm = () => {
        if (error) {
            scrollToElement('details_scrollTo', -300);
        }
    };

    const updateDisabledDates = (year: number) => {
        const arrayDates = eachDayOfInterval({
            start: new Date(year - 1, 12, 1),
            end: new Date(year + 1, 2, 1),
        });
        propertiesStore.findAvailability(year, currentProperty.id).then((res) => {
            if (res?.findAvailable) {
                const disabledDaysArray = arrayDates.filter(
                    (day) =>
                        !res.findAvailable.find(
                            (available) =>
                                isEqual(utcToZonedTime(new Date(available.date), dateConfig.defaultTimeZone), day) &&
                                available.status === PropertyAvailabilityStatus.available
                        )
                );
                setDisabledDates(disabledDaysArray);
            }
        });
    };

    useEffect(() => {
        updateDisabledDates(activeYear);
    }, []);

    useEffect(() => {
        const updateYear = Number(format(viewDate, 'yyyy'));
        if (Number(activeYear) !== updateYear) {
            setActiveYear(updateYear);
            updateDisabledDates(updateYear);
        }
    }, [viewDate]);

    return (
        <aside className="side-panel wide property-book-details">
            {currentProperty.user?.isCompletedStripeAccountStatus ? (
                <div className="bd-cost-block mb-big">
                    <div className="cost-table mb">
                        <div className="item">
                            <div>
                                <span className="big">Avg/night</span>
                            </div>
                            <div>
                                {isLoading ? (
                                    <FrontSkeleton width={'70px'} height={'1.37rem'} />
                                ) : (
                                    <>
                                        <span className="big">
                                            {formatIntoPriceValue(calculations.avgNightlyCost ?? 0, true, true, 2)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="item">
                            <div>Cleaning Fee</div>
                            <div>
                                {isLoading ? (
                                    <FrontSkeleton width={'50px'} height={'1.2rem'} />
                                ) : (
                                    <>{formatIntoPriceValue(currentProperty.cleaningFee ?? 0, true, true, 2)}</>
                                )}
                            </div>
                        </div>
                        <div className="item">
                            <div>Additional Fees</div>
                            <div>
                                {isLoading ? (
                                    <FrontSkeleton width={'50px'} height={'1.2rem'} />
                                ) : (
                                    <>{formatIntoPriceValue(currentProperty.additionalFees ?? 0, true, true, 2)}</>
                                )}
                            </div>
                        </div>
                        <div className="item">
                            <div>Service Fee</div>
                            <div>
                                {isLoading ? (
                                    <FrontSkeleton width={'50px'} height={'1.2rem'} />
                                ) : (
                                    <>{formatIntoPriceValue(calculations.serviceFeeAmount, true, true, 2)}</>
                                )}
                            </div>
                        </div>
                        <div className="item">
                            <div>Tax Rate</div>
                            <div>
                                {isLoading ? (
                                    <FrontSkeleton width={'50px'} height={'1.2rem'} />
                                ) : (
                                    <>{formatIntoPriceValue(calculations.taxRate, true, true, 2)}</>
                                )}
                            </div>
                        </div>
                    </div>
                    <Formik
                        initialValues={initialValues}
                        onSubmit={onSubmit}
                        enableReinitialize={true}
                        validateOnChange={false}
                        validateOnBlur={false}
                        validationSchema={validationSchema}
                        innerRef={formRef}
                    >
                        {(props) => {
                            setFormValues(props.values);
                            setErrorsMessageFormik(props.errors, setError);
                            return (
                                <Form>
                                    <div className="trip-details form-wrap mb">
                                        {!isLoading &&
                                        !props.isSubmitting &&
                                        (!props.values.checkInOut ||
                                            !props.values.checkInOut[0] ||
                                            !props.values.checkInOut[1]) ? (
                                            <div
                                                className={`bd-alert-message mb ${
                                                    isHighlightMessage ? 'alert alert-danger' : null
                                                }`}
                                            >
                                                <span className="fas fa-exclamation-circle" />
                                                <span>Add dates for total pricing</span>
                                            </div>
                                        ) : null}
                                        <Element name="details_scrollTo" />
                                        {!isLoading ? (
                                            <FrontNotificationField alertType={AlertType.danger} message={error} />
                                        ) : null}
                                        <div className="check-dates mb">
                                            <div className="form-group w-full">
                                                <CalendarInput
                                                    label="Check-in Check-out"
                                                    calendarClassName="calendar-input"
                                                    viewDate={viewDate}
                                                    setViewDate={setViewDate}
                                                    disabledDates={disabledDates}
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
                                            />
                                        </div>
                                    </div>

                                    {calculations.total > 0 && !isLoading ? (
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
                                    ) : null}
                                    <div className="bd-buttons-block">
                                        {reservationCreateData && currentUserType !== UserType.host ? (
                                            <>
                                                <FrontButton type="button" onClick={showBookNowModal}>
                                                    Book Now
                                                </FrontButton>
                                                <BookingModal
                                                    property={currentProperty}
                                                    serviceFee={serviceFee}
                                                    address={
                                                        reservationsStore.isGuest.status
                                                            ? fullAddress
                                                            : reservationsStore.isGuest.status !== null
                                                            ? partialAddress
                                                            : null
                                                    }
                                                    propertyRequiresApproval={
                                                        currentProperty.reservationApprovalRequired ?? false
                                                    }
                                                    costBreakdown={{
                                                        avgNightlyCost: calculations.avgNightlyCost,
                                                        numberOfNights: calculations.numberOfNights,
                                                        additionalFees: currentProperty.additionalFees ?? 0,
                                                        cleaningFee: currentProperty.cleaningFee ?? 0,
                                                        serviceFeeAmount: calculations.serviceFeeAmount,
                                                        taxRate: calculations.taxRate,
                                                        total: calculations.total,
                                                    }}
                                                    onCloseModal={onCloseBookNowModal}
                                                    propertyName={currentProperty.name}
                                                    reservationData={reservationCreateData}
                                                    isVisible={visibleModal === 'book'}
                                                    setIsVisible={setVisibleModal}
                                                />
                                                {reservationCreateData.isAvailableForBid ? (
                                                    <FrontButton
                                                        type="button"
                                                        loading={activeBidsLoading}
                                                        onClick={showPlaceBidModal}
                                                    >
                                                        Place Bid
                                                    </FrontButton>
                                                ) : null}
                                                <BiddingModal
                                                    property={currentProperty}
                                                    serviceFee={serviceFee}
                                                    address={
                                                        reservationsStore.isGuest.status
                                                            ? fullAddress
                                                            : reservationsStore.isGuest.status !== null
                                                            ? partialAddress
                                                            : null
                                                    }
                                                    costBreakdown={{
                                                        minimumBid: calculations.minimumBid ?? 0,
                                                        avgNightlyCost: 0,
                                                        numberOfNights: calculations.numberOfNights,
                                                        additionalFees: currentProperty.additionalFees ?? 0,
                                                        cleaningFee: currentProperty.cleaningFee ?? 0,
                                                        serviceFeeAmount: calculations.serviceFeeAmount,
                                                        taxRate: calculations.taxRate,
                                                        total: calculations.total,
                                                    }}
                                                    onCloseModal={onCloseBookNowModal}
                                                    propertyName={currentProperty.name}
                                                    reservationData={{
                                                        ...reservationCreateData,
                                                        nightlyBidAmount: 0,
                                                        bidTimer: 0,
                                                        bidTimerType: '1',
                                                    }}
                                                    isVisible={visibleModal === 'bid'}
                                                    setIsVisible={setVisibleModal}
                                                />
                                            </>
                                        ) : (
                                            <FrontButton
                                                type="submit"
                                                loading={props.isSubmitting}
                                                onClick={onSubmitForm}
                                            >
                                                Check Availability
                                            </FrontButton>
                                        )}
                                    </div>
                                </Form>
                            );
                        }}
                    </Formik>
                </div>
            ) : null}

            <div className="bd-service-block">
                {currentProperty.cancellationPolicy?.metadata.description ? (
                    <div className="cancellation-link mb">
                        <span className="fas fa-undo"></span>
                        <span>
                            Cancellation policy <a onClick={showPolicyDetailsModal}>details</a>
                        </span>
                        <PolicyDetailsModal
                            cancellationPolicy={currentProperty.cancellationPolicy?.metadata.description}
                            isVisible={visibleModal === 'policy_details'}
                            setIsVisible={setVisibleModal}
                        />
                    </div>
                ) : null}
                <div className="security-info mb">
                    <h2 className="h6-style mb-half">Damages and Incidentals</h2>
                    <div className="textbox">
                        <p>
                            You will be responsible for any damages to the property caused by you or your party during
                            your stay.
                        </p>
                    </div>
                </div>
                {currentUserType !== UserType.host ? (
                    <div className="contact-host mb-big">
                        <Avatar shape="circle" className="review-avatar">
                            <FrontImage
                                src={`${currentProperty.userId}/${currentProperty.user.profilePicture}`}
                                identityId="users"
                                width="auto"
                            />
                        </Avatar>
                        <div>
                            <div className="name">{currentProperty.user?.displayName}</div>
                            <a className="sp-link" onClick={showContactHostModal}>
                                Contact host
                            </a>
                        </div>
                        <ContactHostModal
                            propertyId={currentProperty.id}
                            isVisible={visibleModal === 'contact_host'}
                            setIsVisible={setVisibleModal}
                        />
                    </div>
                ) : null}
            </div>
        </aside>
    );
});

export default PropertySidebar;
