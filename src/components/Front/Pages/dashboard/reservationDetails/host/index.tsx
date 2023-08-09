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
import { DeclineReservationModal, NewMessageModal, ReviewGuestModal, SubmitClaimModal } from '../modals';
import ApproveReservationModal from '../modals/ApproveReservationModal';
import CancelReservationModal from '../modals/CancelReservationModal';

export interface ModalsState {
    newMessage: boolean;
    declineReservation?: boolean;
    reviewGuest?: boolean;
    reviewProperty?: boolean;
    submitClaim?: boolean;
    requestRefund?: boolean;
    approveReservation?: boolean;
    cancelReservation?: boolean;
}

const ReservationDetailsHost = observer(() => {
    const router = useRouter();
    const { reservationsStore, userStore, messagesStore, reviewsStore } = useStores();

    const [isModalVisible, setIsModalVisible] = useState<ModalsState>({
        newMessage: false,
        reviewGuest: false,
        approveReservation: false,
        cancelReservation: false,
    });

    const showNewMessageModal = () => setIsModalVisible((prevState) => ({ ...prevState, newMessage: true }));
    const showDeclineReservationModal = () =>
        setIsModalVisible((prevState) => ({ ...prevState, declineReservation: true }));
    const showReviewGuestModal = () => setIsModalVisible((prevState) => ({ ...prevState, reviewGuest: true }));
    const showSubmitClaimModal = () => setIsModalVisible((prevState) => ({ ...prevState, submitClaim: true }));
    const showApproveReservationModal = () =>
        setIsModalVisible((prevState) => ({ ...prevState, approveReservation: true }));
    const showCancelReservation = () => setIsModalVisible((prevState) => ({ ...prevState, cancelReservation: true }));

    const reservationStatusUpdated = new Date(reservationsStore.item.item?.updatedAt!);

    const isUpdatedWithinTwoWeeks = isWithinInterval(reservationStatusUpdated, {
        start: dateConfig.values.twoWeeksBeforeNow,
        end: new Date(),
    });

    const isReviewAllowedByStatus =
        reservationsStore.item.item?.status?.fullName &&
        (validReservationStatusesFor.claim.includes(reservationsStore.item.item?.status?.fullName) ||
            validReservationStatusesFor.decline.includes(reservationsStore.item.item?.status?.fullName));

    const RenderReviewButtons = useMemo(() => {
        if (
            (reservationsStore.item.item?.status?.fullName === ReservationStatusFilters.completed ||
                isBefore(new Date(reservationsStore.item.item?.checkOut ?? Date.now()), Date.now())) &&
            isUpdatedWithinTwoWeeks &&
            isReviewAllowedByStatus
        ) {
            return reservationsStore.item.item?.guestReview?.overallRating ? (
                <a className="details-link" onClick={showReviewGuestModal}>
                    Edit Your Review
                    <span className="fas fa-chevron-right" />
                </a>
            ) : (
                <a className="btn btn-border btn-sm btn-block" onClick={showReviewGuestModal}>
                    Review Guest
                </a>
            );
        }
    }, [
        reservationsStore.item.item?.id,
        reservationsStore.item.item?.guestReview?.id,
        reservationsStore.item.item?.guestReview?.overallRating,
        isReviewAllowedByStatus,
    ]);

    useEffect(() => {
        if (!router.query.id) return;
        reservationsStore.get(router.query.id as string, UserType.host);
        messagesStore.fetchReservationMessages(router.query.id as string);
    }, [router.query.id, reviewsStore.guestReview.item]);

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb-big">
                <h2 className="h4-style title">{reservationsStore.item.item?.property?.name}</h2>
            </div>
            <div className="content-with-side-panel">
                <div className="col-fluid mb-big-xs">
                    <h3 className="h5-style">
                        {concatString([
                            reservationsStore.item.item?.guest?.firstName ?? '',
                            reservationsStore.item.item?.guest?.lastName ?? '',
                        ])}
                    </h3>
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
                        {formatIntoPriceValue(reservationsStore.item.item?.hostPayout ?? 0, true, true, 2)}
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
                                    <div>{reservationsStore.item.item.additionalRules}</div>
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
                            <FrontButton onClick={showNewMessageModal}>Message Guest</FrontButton>
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
                        validReservationStatusesFor.approve.includes(reservationsStore.item.item?.status?.fullName) ? (
                            <>
                                <FrontButton
                                    className={'btn-primary btn-sm'}
                                    type={'button'}
                                    onClick={showApproveReservationModal}
                                >
                                    Approve
                                </FrontButton>
                            </>
                        ) : null}
                        {reservationsStore.item.item?.status?.fullName &&
                        validReservationStatusesFor.decline.includes(reservationsStore.item.item?.status?.fullName) ? (
                            <>
                                <FrontButton
                                    className={'btn-border btn-sm'}
                                    type={'button'}
                                    onClick={showDeclineReservationModal}
                                >
                                    Decline
                                </FrontButton>
                            </>
                        ) : null}
                        <DeclineReservationModal
                            reservationId={reservationsStore.item.item?.id ?? ''}
                            isVisible={isModalVisible.declineReservation!}
                            setIsVisible={setIsModalVisible}
                        />
                        {reservationsStore.item.item?.status?.fullName &&
                        validReservationStatusesFor.cancel.includes(reservationsStore.item.item?.status?.fullName) ? (
                            <>
                                <FrontButton
                                    className={'btn-border btn-sm'}
                                    type={'button'}
                                    onClick={showCancelReservation}
                                >
                                    Cancel
                                </FrontButton>
                            </>
                        ) : null}
                        {reservationsStore.item.item?.status?.fullName &&
                        validReservationStatusesFor.message.includes(reservationsStore.item.item?.status?.fullName) ? (
                            <FrontButton className={'btn-border btn-sm'} type={'button'} onClick={showNewMessageModal}>
                                Message Guest
                            </FrontButton>
                        ) : null}
                        {reservationsStore.item.item?.status?.fullName &&
                        validReservationStatusesFor.claim.includes(reservationsStore.item.item?.status?.fullName) ? (
                            <>
                                <a className="btn btn-border btn-sm" onClick={showSubmitClaimModal}>
                                    Submit Claim
                                </a>
                            </>
                        ) : null}
                        <SubmitClaimModal
                            reservationId={reservationsStore.item.item?.id ?? ''}
                            isVisible={isModalVisible.submitClaim!}
                            setIsVisible={setIsModalVisible}
                        />
                    </div>
                    <div className="review-block text-center">
                        <h3 className="name h6-style">
                            {concatString([
                                reservationsStore.item.item?.guest?.firstName ?? '',
                                reservationsStore.item.item?.guest?.lastName ?? '',
                            ])}
                        </h3>
                        <div className="image guest-avatar">
                            {reservationsStore.item.item?.guest &&
                            reservationsStore.item.item?.guest?.profilePicture ? (
                                <FrontImage
                                    src={`${reservationsStore.item.item?.guest?.id}/${reservationsStore.item.item?.guest?.profilePicture}`}
                                    identityId="users"
                                    width="auto"
                                />
                            ) : (
                                <FrontImage src={''} alt={reservationsStore.item.item?.property?.name} />
                            )}
                        </div>
                        {reservationsStore.item.item?.guestReview?.overallRating ? (
                            <div className="rating">
                                <div className="stars">
                                    <Rating
                                        value={reservationsStore.item.item?.guestReview?.overallRating ?? 0}
                                        readOnly
                                        cancel={false}
                                    />
                                </div>
                                <div className="digit">{reservationsStore.item.item?.guestReview?.overallRating}</div>
                            </div>
                        ) : null}
                        {reservationsStore.item.item?.status?.fullName &&
                            validReservationStatusesFor.hostReview.includes(
                                reservationsStore.item.item?.status?.fullName
                            ) && <>{RenderReviewButtons ?? null}</>}
                        <ReviewGuestModal
                            reservationId={reservationsStore.item.item?.id ?? ''}
                            guestReview={reservationsStore.item.item?.guestReview}
                            isVisible={isModalVisible.reviewGuest!}
                            setIsVisible={setIsModalVisible}
                        />
                        <ApproveReservationModal
                            reservationId={reservationsStore.item.item?.id ?? ''}
                            isVisible={isModalVisible.approveReservation!}
                            setIsVisible={setIsModalVisible}
                        />
                        <CancelReservationModal
                            reservationId={reservationsStore.item.item?.id ?? ''}
                            isVisible={isModalVisible.cancelReservation!}
                            setIsVisible={setIsModalVisible}
                        >
                            By clicking the &quot;CONFIRM&quot; button below, you are cancelling this reservation for
                            the listed dates, displayed guest(s), and reservation amount. The reservation will be
                            deleted and the selected dates will become available. A cancelled reservation cannot be
                            undone and may result in an account review. By clicking &quot;CONFIRM&quot;, you are
                            agreeing to have the reservation amount refunded to the guest in full as well as pay the
                            associated fees as laid out in BidBookStay.com&apos;s Terms & Conditions. You are also
                            agreeing to all of BidBookStay.com&apos;s policies, procedures, and Terms & Conditions.e
                            also agreeing to all of BidBookStay.com&apos;s policies, procedures, and Terms & Conditions.
                        </CancelReservationModal>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ReservationDetailsHost;
