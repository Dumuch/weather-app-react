import Link from 'next/link';
import { FC } from 'react';
import { FrontRoutesList } from '../FrontRoutesList';

interface Props {
    guestName: string;
    propertyId: string;
    reservationId: string;
    propertyName: string;
    checkIn?: string;
    checkOut?: string;
}

const ReservationBlock: FC<Props> = ({ guestName, propertyName, propertyId, reservationId, checkIn, checkOut }) => {
    return (
        <div className="item">
            <h3 className="h6-style guest-name">{guestName}</h3>
            <div className="property">
                <Link href={`${FrontRoutesList.DashboardProperties}/${propertyId}`}>
                    <a>{propertyName}</a>
                </Link>
            </div>
            {checkIn ? (
                <div className="date">
                    will be checking in on <span className="nobr">{checkIn}</span>
                </div>
            ) : checkOut ? (
                <div className="date">
                    will be checking out on <span className="nobr">{checkOut}</span>
                </div>
            ) : null}
            <Link href={`${FrontRoutesList.DashboardReservations}/${reservationId}`}>
                <a className="area-link" title="View Details" />
            </Link>
        </div>
    );
};
export default ReservationBlock;
