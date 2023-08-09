import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { dateConfig } from '../../../../../../config/date';
import { Reservation, ReservationStatus, UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { getFormatData } from '../../../../../../utils/dateTime';
import { concatString } from '../../../../../../utils/helpers';
import { FrontRoutesList } from '../../../FrontRoutesList';
import SearchBlock from '../../SearchBlock';
import UpcomingBidsBlock from '../../UpcomingBidsBlock';

const USER_SEARCHES_COUNT = 5;
const UPCOMING_RESERVATIONS_COUNT = 5;

const DashboardGuest = observer(() => {
    const { userStore, reservationsStore } = useStores();

    useEffect(() => {
        reservationsStore.fetchList(UserType.guest, ReservationStatus.current, { limit: 5 });
        reservationsStore.fetchList(UserType.guest, ReservationStatus.upcoming, { limit: UPCOMING_RESERVATIONS_COUNT });
        userStore.getUserSearches(USER_SEARCHES_COUNT);
    }, [userStore.user?.id]);

    const reservationItem = (reservation: Reservation) => {
        const mainPhoto = reservation.property?.propertyPhotos?.find((photo) => photo.mainPhoto === true);
        const firstRegularPhoto = reservation.property?.propertyPhotos
            ?.slice()
            .sort((a, b) => (a.order < b.order ? -1 : 1))[0]?.name;

        const checkInDate = getFormatData(reservation.checkIn, dateConfig.formats.localizedMonthDay, true);
        const checkOutDate = getFormatData(reservation.checkOut, dateConfig.formats.localizedDate, true);
        const location = concatString([
            reservation.property?.address1 ? `${reservation.property?.address1},` : '',
            reservation.property?.address2 ? `${reservation.property?.address2},` : '',
            reservation.property?.city ? `${reservation.property?.city},` : '',
            reservation.property?.state ?? '',
            reservation.property?.zip ?? '',
        ]);

        const imgSrc = mainPhoto
            ? `${reservation.property?.id}/thumbnails/thumbnail-500_${mainPhoto?.path}`
            : firstRegularPhoto
            ? `${reservation.property?.id}/thumbnails/thumbnail-500_${firstRegularPhoto}`
            : null;

        return (
            <UpcomingBidsBlock
                key={reservation.id}
                imgSrc={imgSrc}
                checkIn={checkInDate}
                checkOut={checkOutDate}
                reservationId={reservation.id}
                propertyName={reservation.property?.name ?? ''}
                propertyInfo={location}
            />
        );
    };

    return (
        <>
            <div className="main-panel">
                <div className="block-heading mb">
                    <h2 className="h4-style title">Currently Staying</h2>
                    {reservationsStore.list.items.current.data.length > 0 ? (
                        <Link href={`${FrontRoutesList.DashboardReservations}?tabIndex=2`}>
                            <a className="sp-link">View all</a>
                        </Link>
                    ) : null}
                </div>
                <div className="bookings-listing mb-big">
                    {reservationsStore.list.items.current.data.length > 0 ? (
                        reservationsStore.list.items.current.data.map((reservation) => reservationItem(reservation))
                    ) : (
                        <div className="textbox">
                            <p>No items found.</p>
                        </div>
                    )}
                </div>
                <div className="block-heading mb">
                    <h2 className="h4-style title">Upcoming Bookings</h2>
                    {reservationsStore.list.items.upcoming.data.length > 0 ? (
                        <Link href={`${FrontRoutesList.DashboardReservations}?tabIndex=1`}>
                            <a className="sp-link">View all</a>
                        </Link>
                    ) : null}
                </div>
                <div className="bookings-listing mb-big">
                    {reservationsStore.list.items.upcoming.data.length > 0 ? (
                        reservationsStore.list.items.upcoming.data.map((reservation) => reservationItem(reservation))
                    ) : (
                        <div className="textbox">
                            <p>No items found.</p>
                        </div>
                    )}
                </div>
                <div className="block-heading mb">
                    <h2 className="h4-style title">Your Saved Searches</h2>
                    {userStore.userSearches.items.length > 0 ? (
                        <Link href={FrontRoutesList.DashboardSavedSearches}>
                            <a className="sp-link">View all</a>
                        </Link>
                    ) : null}
                </div>
                <div className="searches-listing mb-big">
                    {userStore.userSearches.items.length > 0 ? (
                        userStore.userSearches.items.map((obSearch, idx) => {
                            if (idx <= USER_SEARCHES_COUNT - 1) {
                                return <SearchBlock obSearch={obSearch} key={obSearch.id} />;
                            }
                        })
                    ) : (
                        <div className="textbox">
                            <p>No items found.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
});

export default DashboardGuest;
