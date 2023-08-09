import Link from 'next/link';
import { FC } from 'react';
import { FrontImage } from '../../Global/image';
import { FrontRoutesList } from '../FrontRoutesList';

interface Props {
    imgSrc: string | null;
    propertyName: string;
    reservationId: string;
    checkIn: string;
    checkOut: string;
    propertyInfo?: string;
}

const UpcomingBidsBlock: FC<Props> = ({ imgSrc, propertyName, reservationId, checkIn, checkOut, propertyInfo }) => {
    return (
        <div className="item">
            <div className="image">
                <FrontImage src={imgSrc} identityId="properties" width="216px" height="160px" />
            </div>
            <div className="content">
                <h3 className="h6-style property-name">{propertyName}</h3>
                <div className="dates">
                    <span className="nobr">{checkIn}</span> - <span className="nobr">{checkOut}</span>
                </div>
                <div className="info">{propertyInfo}</div>
            </div>
            <Link href={`${FrontRoutesList.DashboardReservations}/${reservationId}`}>
                <a className="area-link" title="View Details" />
            </Link>
        </div>
    );
};

export default UpcomingBidsBlock;
