import React, { FunctionComponent, useEffect, useState } from 'react';
import { Property } from '../../../../../models/api/property';
import { FrontStaticImage } from '../../../Global/staticImage';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../store';
import FrontSkeleton from '../../../Global/skeleton';
import Link from 'next/link';
import { getObHref } from '../../../../../utils/helpers';
interface Props {
    property: Property;
}
const PropertyListSectionCard: FunctionComponent<Props> = observer(({ property }) => {
    const { propertiesStore, userStore } = useStores();
    const [isLoading, setIsLoading] = useState(true);

    const mainPhoto = property?.propertyPhotos?.find((photo) => photo.mainPhoto === true);
    useEffect(() => {
        setIsLoading(propertiesStore.isLoading);
    }, [propertiesStore.isLoading]);

    const onMouseOver = () => {
        propertiesStore.setHoverProperty(property);
    };
    const onMouseOut = () => {
        propertiesStore.setHoverProperty(null);
    };

    const setPreviewPhoto = (photo: string) => propertiesStore.setPreviewPhotoForSearch(property, photo);

    return (
        <div className="property-card" onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
            <div className="image">
                {userStore.isColdStart || isLoading ? (
                    <FrontSkeleton width={'377px'} height={'232px'} />
                ) : (
                    <>
                        {mainPhoto ? (
                            <FrontStaticImage
                                src={`${property.id}/thumbnails/thumbnail-500_${mainPhoto.path}`}
                                identityId={'properties'}
                                alt={property.name}
                                isStaticImport={false}
                                layout="responsive"
                                width={372}
                                height={270}
                                priority={true}
                                onLoadImage={setPreviewPhoto}
                            />
                        ) : (
                            <>
                                {property?.propertyPhotos && property?.propertyPhotos.length > 0 ? (
                                    <FrontStaticImage
                                        src={`${property.id}/thumbnails/thumbnail-500_${
                                            property?.propertyPhotos
                                                .slice()
                                                .sort((a, b) => (a.order < b.order ? -1 : 1))[0].name
                                        }`}
                                        identityId={'properties'}
                                        alt={property.name}
                                        isStaticImport={false}
                                        layout="responsive"
                                        width={372}
                                        height={270}
                                        onLoadImage={setPreviewPhoto}
                                    />
                                ) : (
                                    <FrontStaticImage
                                        src={``}
                                        identityId={'properties'}
                                        alt={property.name}
                                        isStaticImport={false}
                                        layout="responsive"
                                        width={372}
                                        height={270}
                                        noImage={true}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
            <div className="content">
                <h2 className="h6-style name">
                    {!userStore.isColdStart && isLoading ? (
                        <FrontSkeleton width={'200px'} height={'20px'} />
                    ) : (
                        <>{property.name}</>
                    )}
                </h2>
                <div className="rating-wrap">
                    {!userStore.isColdStart && isLoading ? (
                        <FrontSkeleton width={'120px'} height={'20px'} />
                    ) : (
                        <>
                            {property.overallRating && property.countReviews && property.countReviews >= 5 ? (
                                <>
                                    <div className="rating">
                                        <span className="fas fa-star"></span>
                                        <span className="score">{property.overallRating?.toFixed(1)}</span>
                                    </div>
                                    <div className="reviews">
                                        ({property.countReviews} {property.countReviews === 1 ? 'review' : 'reviews'})
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </>
                    )}
                </div>
                <div className="config-wrap">
                    {!userStore.isColdStart && isLoading ? (
                        <>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <FrontSkeleton width={'50px'} height={'20px'} />
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <FrontSkeleton width={'50px'} height={'20px'} />
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <FrontSkeleton width={'50px'} height={'20px'} />
                            </span>
                        </>
                    ) : (
                        <>
                            {property.propertyBedrooms && property.propertyBedrooms?.length > 0 && (
                                <span>{property.propertyBedrooms.length} Bedrooms</span>
                            )}
                            {property.bathrooms && <span>{property.bathrooms} Bathroom</span>}
                            {property.numberOfGuests && <span>Sleeps {property.numberOfGuests}</span>}
                        </>
                    )}
                </div>
                <div className="amenities-wrap">
                    {!userStore.isColdStart && isLoading ? (
                        <FrontSkeleton width={'150px'} height={'20px'} />
                    ) : (
                        <>
                            {property.amenities.length > 0 &&
                                property.amenities.map((amenity) => {
                                    return <span key={amenity.shortName}>{amenity.fullName}</span>;
                                })}
                        </>
                    )}
                </div>
                <div className="pricing-wrap">
                    {!userStore.isColdStart && isLoading ? (
                        <>
                            <div className="night">
                                <FrontSkeleton width={'50px'} height={'20px'} />
                            </div>
                            <div className="total">
                                <FrontSkeleton width={'50px'} height={'20px'} />
                            </div>
                        </>
                    ) : (
                        <>
                            {property.nightlyPrice ? (
                                <div className="night">Night: ${property.nightlyPrice.toFixed(2)}</div>
                            ) : null}
                            {property.total && <div className="total">Total: ${property.total.toFixed(2)}</div>}
                        </>
                    )}
                </div>
                {!userStore.isColdStart && isLoading ? (
                    <FrontSkeleton width={'120px'} height={'20px'} />
                ) : (
                    <>
                        {property.acceptingBids && (
                            <div className="bids-status small">
                                <span>Accepting Bids</span>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Link href={getObHref(propertiesStore, property)}>
                <a target={'_blank'} className="area-link" rel="noreferrer"></a>
            </Link>
        </div>
    );
});

export default PropertyListSectionCard;
