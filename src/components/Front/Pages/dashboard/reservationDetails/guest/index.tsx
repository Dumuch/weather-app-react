import isBefore from 'date-fns/isBefore';
import isWithinInterval from 'date-fns/isWithinInterval';

import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { Rating } from 'primereact/rating';
import React, { useEffect, useMemo, useState } from 'react';
import { validReservationStatusesFor } from '../../../../../../config/app';
import { dateConfig } from '../../../../../../config/date';
import { UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { ReservationStatusFilters } from '../../../../../../utils/constants';
import { getFormatData, getTime } from '../../../../../../utils/dateTime';
import { concatString, formatIntoPriceValue } from '../../../../../../utils/helpers';
import { FrontButton } from '../../../../Global/button';
import { FrontImage } from '../../../../Global/image';
import ChatBlock from '../ChatBlock';
import { ModalsState } from '../host';
import { NewMessageModal, ReviewPropertyModal, RequestRefundModal } from '../modals';
import CancelReservationModal from '../modals/CancelReservationModal';

const ReservationDetailsGuest = observer(() => {
    const router = useRouter();
    const { reservationsStore, userStore, messagesStore, reviewsStore } = useStores();
    const [isModalVisible, setIsModalVisible] = useState<ModalsState>({
        newMessage: false,
        reviewGuest: false,
        approveReservation: false,
        cancelReservation: false,
    });
    const showNewMessageModal = () => setIsModalVisible((prevState) => ({ ...prevState, newMessage: true }));
    const showReviewPropertyModal = () => setIsModalVisible((prevState) => ({ ...prevState, reviewProperty: true }));
    const showRequestRefundModal = () => setIsModalVisible((prevState) => ({ ...prevState, requestRefund: true }));
    const showCancelReservation = () => setIsModalVisible((prevState) => ({ ...prevState, cancelReservation: true }));

    const mainPhoto = reservationsStore.item.item?.property?.propertyPhotos?.find((photo) => photo.mainPhoto === true);
    const firstRegularPhoto = reservationsStore.item.item?.property?.propertyPhotos
        ?.slice()
        .sort((a, b) => (a.order < b.order ? -1 : 1))[0]?.path;
    const imgSrc = mainPhoto
        ? `${reservationsStore.item.item?.property?.id}/thumbnails/thumbnail-500_${mainPhoto?.path}`
        : firstRegularPhoto
        ? `${reservationsStore.item.item?.property?.id}/thumbnails/thumbnail-500_${firstRegularPhoto}`
        : null;

    const reservationStatusUpdated = new Date(reservationsStore.item.item?.updatedAt!);
    const isUpdatedWithinTwoWeeks = isWithinInterval(reservationStatusUpdated, {
        start: dateConfig.values.twoWeeksBeforeNow,
        end: new Date(),
    });

    const RenderReviewButtons = useMemo(() => {
        if (
            (reservationsStore.item.item?.status?.fullName === ReservationStatusFilters.completed ||
                isBefore(new Date(reservationsStore.item.item?.checkOut ?? Date.now()), Date.now())) &&
            isUpdatedWithinTwoWeeks
        ) {
            return reservationsStore.item.item?.propertyReview?.overallRating ? (
                <a className="details-link" onClick={showReviewPropertyModal}>
                    Edit Your Review
                    <span className="fas fa-chevron-right" />
                </a>
            ) : (
                <a className="btn btn-border btn-sm btn-block" onClick={showReviewPropertyModal}>
                    Review Host
                </a>
            );
        }
    }, [
        reservationsStore.item.item?.id,
        reservationsStore.item.item?.propertyReview?.id,
        reservationsStore.item.item?.propertyReview?.overallRating,
    ]);

    useEffect(() => {
        if (!router.query.id) return;
        reservationsStore.get(router.query.id as string, UserType.guest);
        messagesStore.fetchReservationMessages(router.query.id as string);
    }, [router.query.id, reviewsStore.propertyReview.item]);

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb-big">
                <h2 className="h4-style title">Reservation Details</h2>
            </div>
            <div className="content-with-side-panel">
                <div className="col-fluid mb-big-xs">
                    <h3 className="h5-style">{reservationsStore.item.item?.property?.name}</h3>
                    <div className="row mb-big">
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className="info-label color-dark-grey">Check-in - Check-out</div>
                                <div>
                                    <span className="nobr">
                                        {getFormatData(
                                            reservationsStore.item.item?.checkIn,
                                            dateConfig.formats.localizedDate,
                                            true
                                        )}
                                    </span>{' '}
                                    -{' '}
                                    <span className="nobr">
                                        {getFormatData(
                                            reservationsStore.item.item?.checkOut,
                                            dateConfig.formats.localizedDate,
                                            true
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className="info-label color-dark-grey">Number of Guests</div>
                                <div>{reservationsStore.item.item?.numberOfGuests}</div>
                            </div>
                        </div>
                    </div>

                    <div className="sep bg-color-light-grey mb-big"></div>
                    <h3 className="h5-style">Payment Summary and Policies</h3>
                    <h4 className="h6-style color-blue">
                        Total Reservation Amount:{' '}
                        {formatIntoPriceValue(reservationsStore.item.item?.total ?? 0, true, true, 2)}
                    </h4>
                    <h4 className="h6-style mb-half">Cancellation Policy</h4>
                    <div className="textbox mb">
                        {reservationsStore.item.item?.cancellationPolicy?.metadata.description && (
                            <ul>
                                {reservationsStore.item.item.cancellationPolicy.metadata.description
                                    .split('\n')
                                    .map((paragraph, idx) => (
                                        <li key={idx}>{paragraph}</li>
                                    ))}
                            </ul>
                        )}
                    </div>
                    <h4 className="h6-style mb-half">House rules</h4>
                    <div className="row mb-half">
                        {reservationsStore.item.item?.maxGuests && (
                            <div className="col-lg-4 col-md-6 col-sm-6 mb-xs">
                                <div className="info-block">
                                    <div className="info-label color-dark-grey">Max guests</div>
                                    <div>{reservationsStore.item.item?.maxGuests}</div>
                                </div>
                            </div>
                        )}
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className={'info-label color-dark-grey'}>
                                    {reservationsStore.item.item?.smokingAllowed ? 'Smoking is allowed' : 'No smoking'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-half">
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className={'info-label color-dark-grey'}>
                                    {reservationsStore.item.item?.eventsAllowed
                                        ? 'Parties or events allowed'
                                        : 'No parties or events'}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className={'info-label color-dark-grey'}>
                                    {reservationsStore.item.item?.petsAllowed ? 'Pets allowed' : 'No pets'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-half">
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-xs">
                            <div className="info-block">
                                {reservationsStore.item.item?.checkInTimes ? (
                                    <div className="item">
                                        <div className="info-label color-dark-grey">Check-in after:</div>{' '}
                                        {getTime(reservationsStore.item.item?.checkInTimes)}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-xs">
                            <div className="info-block">
                                {reservationsStore.item.item?.checkOutTimes ? (
                                    <div className="item">
                                        <div className="info-label color-dark-grey">Check-out before:</div>{' '}
                                        {getTime(reservationsStore.item.item?.checkOutTimes)}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    {reservationsStore.item.item?.additionalRules && (
                        <div className="row mb-big">
                            <div className="col-lg-4 col-md-6 col-sm-6 mb-xs">
                                <div className="info-block">
                                    <div className="info-label color-dark-grey">Additional Rules</div>
                                    <div>{reservationsStore.item.item?.additionalRules}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="sep bg-color-light-grey mb-big"></div>
                    <h3 className="h5-style">Messages History</h3>
                    <div className="chat-block">
                        <ChatBlock messages={messagesStore.listByReservation.items} />
                        {reservationsStore.item.item?.status?.fullName &&
                        validReservationStatusesFor.message.includes(reservationsStore.item.item?.status?.fullName) ? (
                            <FrontButton onClick={showNewMessageModal}>Message Host</FrontButton>
                        ) : null}
                        <NewMessageModal
                            reservationId={reservationsStore.item.item?.id ?? ''}
                            userType={userStore.activeType ?? UserType.guest}
                            isVisible={isModalVisible.newMessage}
                            setIsVisible={setIsModalVisible}
                        />
                    </div>
                </div>
                <div className="col-fixed">
                    <div className="page-controls mb-big">
                        {reservationsStore.item.item?.status?.fullName &&
                        validReservationStatusesFor.refund.includes(reservationsStore.item.item?.status?.fullName) ? (
                            <a className="btn btn-primary btn-sm" onClick={showRequestRefundModal}>
                                Request Refund
                            </a>
                        ) : null}
                        <RequestRefundModal
                            reservationId={reservationsStore.item.item?.id ?? ''}
                            isVisible={isModalVisible.requestRefund!}
                            setIsVisible={setIsModalVisible}
                        />
                        {reservationsStore.item.item?.status?.fullName &&
                        validReservationStatusesFor.message.includes(reservationsStore.item.item?.status?.fullName) ? (
                            <a className="btn btn-border btn-sm" onClick={showNewMessageModal}>
                                Message Host
                            </a>
                        ) : null}
                        {reservationsStore.item.item?.status?.fullName &&
                        validReservationStatusesFor.cancel.includes(reservationsStore.item.item?.status?.fullName) ? (
                            <>
                                <FrontButton
                                    className={'btn-border btn-sm'}
                                    type={'button'}
                                    onClick={showCancelReservation}
                                >
                                    Cancel Reservation
                                </FrontButton>
                            </>
                        ) : null}
                    </div>
                    <div className="review-block text-center">
                        <h3 className="name h6-style text-left">
                            {concatString([
                                reservationsStore.item.item?.property?.address1
                                    ? `${reservationsStore.item.item?.property?.address1},`
                                    : '',
                                reservationsStore.item.item?.property?.address2
                                    ? `${reservationsStore.item.item?.property?.address2},`
                                    : '',
                                reservationsStore.item.item?.property?.city
                                    ? `${reservationsStore.item.item?.property?.city},`
                                    : '',
                                reservationsStore.item.item?.property?.state ?? '',
                                reservationsStore.item.item?.property?.zip ?? '',
                            ])}
                        </h3>
                        <div className="image property-thumbnail">
                            {reservationsStore.item.item?.property?.propertyPhotos &&
                            reservationsStore.item.item?.property?.propertyPhotos.length > 0 ? (
                                <FrontImage
                                    src={imgSrc}
                                    identityId={'properties'}
                                    alt={reservationsStore.item.item?.property?.name}
                                />
                            ) : (
                                <FrontImage src={''} alt={reservationsStore.item.item?.property?.name} />
                            )}
                        </div>
                        {reservationsStore.item.item?.propertyReview?.overallRating ? (
                            <div className="rating">
                                <div className="stars">
                                    <Rating
                                        value={reservationsStore.item.item?.propertyReview?.overallRating ?? 0}
                                        readOnly
                                        cancel={false}
                                    />
                                </div>
                                <div className="digit">
                                    {reservationsStore.item.item?.propertyReview?.overallRating}
                                </div>
                            </div>
                        ) : null}
                        {reservationsStore.item.item?.status?.fullName &&
                            validReservationStatusesFor.guestReview.includes(
                                reservationsStore.item.item?.status?.fullName
                            ) && <>{RenderReviewButtons ?? null}</>}
                        <ReviewPropertyModal
                            reservationId={reservationsStore.item.item?.id ?? ''}
                            propertyReview={reservationsStore.item.item?.propertyReview}
                            isVisible={isModalVisible.reviewProperty!}
                            setIsVisible={setIsModalVisible}
                        />
                        <CancelReservationModal
                            reservationId={reservationsStore.item.item?.id ?? ''}
                            isVisible={isModalVisible.cancelReservation!}
                            setIsVisible={setIsModalVisible}
                        >
                            By clicking the &quot;CONFIRM&quot; button below, you are cancelling this reservation for
                            the listed dates. You agree to forfeiting any funds you have paid thus far, in accordance to
                            the property&apos;s listed cancellation policy. A cancelled reservation cannot be undone. By
                            clicking &quot;CONFIRM&quot;, you are also agreeing to all of BidBookStay.com&apos;s
                            policies, procedures, and Terms & Conditions.
                        </CancelReservationModal>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ReservationDetailsGuest;
