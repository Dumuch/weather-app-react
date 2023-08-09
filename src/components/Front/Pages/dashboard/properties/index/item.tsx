import React, { FunctionComponent } from 'react';
import { Property } from '../../../../../../models/api/property';
import Link from 'next/link';
import { FrontRoutesList } from '../../../FrontRoutesList';
import { FrontImage } from '../../../../Global/image';

interface Props {
    property: Property;
}

const DashboardPropertiesSectionCard: FunctionComponent<Props> = ({ property }) => {
    return (
        <div className={`item ${!property.active || property.blocked ? 'deactivated' : ''}`}>
            <div className="image">
                {property?.mainPhoto ? (
                    <FrontImage
                        src={`${property.id}/thumbnails/thumbnail-500_${property?.mainPhoto}`}
                        identityId={'properties'}
                        alt={property.name}
                    />
                ) : (
                    <>
                        {property?.propertyPhotos && property?.propertyPhotos.length > 0 ? (
                            <FrontImage
                                src={`${property.id}/thumbnails/thumbnail-500_${
                                    property?.propertyPhotos.sort((a, b) => (a.order < b.order ? -1 : 1))[0].name
                                }`}
                                identityId={'properties'}
                                alt={property.name}
                            />
                        ) : (
                            <FrontImage src={''} alt={property.name} />
                        )}
                    </>
                )}
            </div>
            <div className="content">
                {(property.blocked || !property.active) && (
                    <div className={`${property.blocked ? 'blocked-label' : 'deactivated-label'}  mb-half`}>
                        <span>{property.blocked ? 'Blocked' : 'Deactivated'}</span>
                    </div>
                )}
                <h3 className="h6-style property-name">{property.name}</h3>
                <div className="info">
                    {property.description.length > 300
                        ? property.description.slice(0, 300) + '...'
                        : property.description}
                </div>
            </div>
            <Link href={`${FrontRoutesList.DashboardProperties}/${property.id}`}>
                <a className="area-link" title="View Details"></a>
            </Link>
        </div>
    );
};

export default DashboardPropertiesSectionCard;
