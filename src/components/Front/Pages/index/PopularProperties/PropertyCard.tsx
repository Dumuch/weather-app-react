import Image from 'next/image';
import { Rating } from 'primereact/rating';
import Link from 'next/link';
import { Property } from '../../../../../models/api/property';
import Bed from '../../../../../../public/assets/img/i-bed.svg';
import Bath from '../../../../../../public/assets/img/i-bath.svg';
import { concatString } from '../../../../../utils/helpers';
import { FrontRoutesList } from '../../FrontRoutesList';
import { FC } from 'react';
import { DictionaryValue } from '../../../../../models/api';
import { FrontImage } from '../../../Global/image';
import { FrontStaticImage } from '../../../Global/staticImage';

interface Props {
    property: Property;
}

const PropertyCard: FC<Props> = ({ property }) => {
    const getAmenitiesValue = (amenities: DictionaryValue[]) => {
        return concatString([...amenities.map((amenity) => amenity.fullName ?? '')], ' / ');
    };

    const mainPhoto = property?.propertyPhotos?.find((photo) => photo.mainPhoto === true);

    const propertyBedrooms = property.propertyBedrooms?.reduce((prev, next) => prev + next.value!, 0);
    return (
        <div className="item">
            <div className="image">
                {mainPhoto ? (
                    <FrontStaticImage
                        src={`${property.id}/thumbnails/thumbnail-500_${mainPhoto.path}`}
                        identityId={'properties'}
                        alt={property.name}
                        isStaticImport={false}
                        layout="responsive"
                        width={372}
                        height={270}
                    />
                ) : (
                    <>
                        {property?.propertyPhotos && property?.propertyPhotos.length > 0 ? (
                            <FrontStaticImage
                                src={`${property.id}/thumbnails/thumbnail-500_${
                                    property?.propertyPhotos.sort((a, b) => (a.order < b.order ? -1 : 1))[0].name
                                }`}
                                identityId={'properties'}
                                alt={property.name}
                                isStaticImport={false}
                                layout="responsive"
                                width={372}
                                height={270}
                            />
                        ) : (
                            <FrontImage src={''} alt={property.name} />
                        )}
                    </>
                )}
            </div>
            <div className="content">
                <h3 className="h6-style mb-half color-black">{property?.name ?? ''}</h3>
                <div className="rating-wrap mb-half">
                    <div className="sleeps-block color-blue">
                        {property.numberOfGuests ? (
                            <div className="sleeps">Sleeps {property.numberOfGuests}</div>
                        ) : null}
                        {propertyBedrooms ? (
                            <div className="has-icon big">
                                <Image src={Bed} alt="icon" />
                                <span className="icon-value">{propertyBedrooms}</span>
                            </div>
                        ) : null}
                        {property.bathrooms ? (
                            <div className="has-icon big">
                                <Image src={Bath} alt="icon" />
                                <span className="icon-value">{property.bathrooms}</span>
                            </div>
                        ) : null}
                    </div>
                    {property.overallRating ? <Rating value={property.overallRating} readOnly cancel={false} /> : null}
                </div>
                <div className="amenities-block">{property.amenities ? getAmenitiesValue(property.amenities) : ''}</div>
            </div>
            <Link href={`${FrontRoutesList.Properties}/${property.id}`}>
                <a className="area-link" title={property?.name ?? ''}></a>
            </Link>
        </div>
    );
};

export default PropertyCard;
