import React, { useEffect } from 'react';
import OccupancySvg from '../../../../../../../public/assets/img/i-occupancy.svg';
import RevenueSvg from '../../../../../../../public/assets/img/i-revenue.svg';
import RatingSvg from '../../../../../../../public/assets/img/i-rating.svg';
import ReservationBlock from '../../ReservationBlock';
import { useStores } from '../../../../../../store';
import { formatIntoPriceValue } from '../../../../../../utils/helpers';
import StatisticsBlock from '../../StatisticsBlock';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { FrontRoutesList } from '../../../FrontRoutesList';
import { getFormatData } from '../../../../../../utils/dateTime';
import { dateConfig } from '../../../../../../config/date';
import { ReservationStatus, StripeAccountStatusType, UserType } from '../../../../../../models/api';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';

const DashboardHost = observer(() => {
    const { userStore, reservationsStore } = useStores();
    const fetchReservations = async () => {
        await reservationsStore.fetchList(UserType.host, ReservationStatus.current, { limit: 5 });
        await reservationsStore.fetchList(UserType.host, ReservationStatus.upcoming, { limit: 10 });
    };

    const removeNotifications = () =>
        userStore.user && userStore.updateUser({ ...userStore.user, notifications: null }, false);

    const customBodyNotification = () => {
        return (
            <p>
                You do not have a Stripe account, or you have a problem with it. Please visit your&nbsp;
                <Link href={`${FrontRoutesList.DashboardProfile}?tabIndex=1`} passHref>
                    <a>profile settings.</a>
                </Link>
            </p>
        );
    };

    useEffect(() => {
        fetchReservations();
    }, [userStore.user?.id]);

    return (
        <>
            <div
                className={`${
                    userStore.user?.stripeAccountStatus !== StripeAccountStatusType.completed
                        ? 'wrapper-main-panel'
                        : 'flex-grow-1'
                }`}
            >
                {userStore.user?.stripeAccountStatus !== StripeAccountStatusType.completed ? (
                    <FrontNotificationField
                        alertType={AlertType.danger}
                        message={''}
                        closeButton={false}
                        handlerCloseButton={removeNotifications}
                        isMarginBottom={false}
                        iconSrc={'/assets/img/i-info.svg'}
                        customBody={customBodyNotification}
                    />
                ) : null}
                <div className="main-panel">
                    <div className="block-heading mb">
                        <h2 className="h4-style title">
                            {reservationsStore.list.items.current.count || null} Currently Hosting
                        </h2>
                        {reservationsStore.list.items.current.data.length > 0 ? (
                            <Link href={`${FrontRoutesList.DashboardReservations}?tabIndex=0`}>
                                <a className="sp-link">View all</a>
                            </Link>
                        ) : null}
                    </div>
                    <div className="hosting-listing mb-big">
                        {reservationsStore.list.items.current.data.length > 0 ? (
                            reservationsStore.list.items.current.data.map((reservation, idx) => (
                                <ReservationBlock
                                    key={reservation.id}
                                    guestName={reservation.guest?.firstName ?? ''}
                                    propertyId={reservation.propertyId}
                                    reservationId={reservation.id}
                                    propertyName={reservation.property?.name ?? ''}
                                    checkOut={getFormatData(
                                        reservation.checkOut,
                                        dateConfig.formats.localizedDate,
                                        true
                                    )}
                                />
                            ))
                        ) : (
                            <div className="textbox">
                                <p>No items found.</p>
                            </div>
                        )}
                    </div>
                    <div className="block-heading mb">
                        <h2 className="h4-style title">
                            {reservationsStore.list.items.upcoming.count || null} Upcoming Reservations
                        </h2>
                        {reservationsStore.list.items.upcoming.data.length > 0 ? (
                            <Link href={`${FrontRoutesList.DashboardReservations}?tabIndex=1`}>
                                <a className="sp-link">View all</a>
                            </Link>
                        ) : null}
                    </div>
                    <div className="hosting-listing mb-big">
                        {reservationsStore.list.items.upcoming.data.length > 0 ? (
                            reservationsStore.list.items.upcoming.data.map((reservation, idx) => (
                                <ReservationBlock
                                    key={reservation.id}
                                    guestName={reservation.guest?.firstName ?? ''}
                                    propertyId={reservation.propertyId}
                                    reservationId={reservation.id}
                                    propertyName={reservation.property?.name ?? ''}
                                    checkIn={getFormatData(reservation.checkIn, dateConfig.formats.localizedDate, true)}
                                />
                            ))
                        ) : (
                            <div className="textbox">
                                <p>No items found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <aside className="side-panel">
                <h2 className="h4-style">Performance</h2>
                <div className="stat-block mb-big">
                    <StatisticsBlock
                        icon={OccupancySvg}
                        value={`${userStore.user?.occupancyRate?.toFixed(1) ?? 0}%`}
                        caption="Occupancy rate"
                    />
                    <StatisticsBlock
                        icon={RevenueSvg}
                        value={formatIntoPriceValue(userStore.user?.monthlyRevenue ?? 0, true, true, 2)}
                        caption="Monthly revenue"
                    />
                    <StatisticsBlock
                        icon={RatingSvg}
                        value={userStore.user?.hostOverallRating?.toFixed(1) ?? 0}
                        caption="Overall rating"
                    />
                </div>
            </aside>
        </>
    );
});

export default DashboardHost;
