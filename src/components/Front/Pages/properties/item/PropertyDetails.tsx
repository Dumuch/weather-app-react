import Image from 'next/image';
import { FC, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Property } from '../../../../../models/api/property';
import { concatString } from '../../../../../utils/helpers';
import { useStores } from '../../../../../store';
import Bed from '../../../../../../public/assets/img/i-bed.svg';
import Bath from '../../../../../../public/assets/img/i-bath.svg';
import PropertyPhotos from './PropertyPhotos';
import PropertyDetailsLocationModal from './modals/PropertyDetailsLocationModal';
import PropertyDetailsAmenitiesModal from './modals/PropertyDetailsAmenititesModal';
import { Skeleton } from 'primereact/skeleton';
import PropertyReviews from './PropertyReviews';
import { FindAndCountAll, PropertyReview } from '../../../../../models/api';
import { getTime } from '../../../../../utils/dateTime';

interface Props {
    property: Property;
    reviews: FindAndCountAll<PropertyReview[]>;
}

export type PropertyDetailsModalsState = '' | 'location' | 'amenities';

const PropertyDetails: FC<Props> = observer(({ property, reviews }) => {
    const { userStore, reservationsStore } = useStores();
    const [visibleModal, setVisibleModal] = useState<PropertyDetailsModalsState>('');

    const showLocationModal = () => setVisibleModal('location');
    const showAmenitiesModal = () => setVisibleModal('amenities');

    const propertyBedrooms = property.propertyBedrooms?.reduce((prev, next) => prev + next.value!, 0);
    const fullAddress = concatString(
        [
            property.address1 ?? '',
            property.address2 ?? '',
            property.city ?? '',
            property.state ?? '',
            property.zip ?? '',
        ],
        ','
    );

    const topAmenities = property.amenities.filter((amenity) => amenity.relatedTo !== null);

    const partialAddress = concatString([property.city ?? '', property.state ?? ''], ',');

    useEffect(() => {
        reservationsStore.checkUserIsGuest({ propertyId: property.id, guestId: userStore.user?.id });
    }, [userStore.isColdStart]);

    return (
        <div className="main-panel">
            <div className="property-details-header mb-big">
                <h1 className="h3-style mb-half">{property.name}</h1>
                <div className="property-location big mb-half">
                    {reservationsStore.isGuest.status ? (
                        fullAddress
                    ) : reservationsStore.isGuest.status !== null ? (
                        partialAddress
                    ) : (
                        <Skeleton width="30%" height="1.5rem" />
                    )}
                </div>
                <a className="sp-link" onClick={showLocationModal}>
                    Show on map
                </a>
                <PropertyDetailsLocationModal
                    location={
                        reservationsStore.isGuest.status
                            ? { lat: property.lat, lng: property.lng }
                            : reservationsStore.isGuest.status !== null
                            ? {
                                  lat: Math.floor(property.lat * 100 + 0.5) / 100,
                                  lng: Math.floor(property.lng * 100 + 0.5) / 100,
                              }
                            : { lat: 0, lng: 0 }
                    }
                    addressString={
                        reservationsStore.isGuest.status
                            ? fullAddress
                            : reservationsStore.isGuest.status !== null
                            ? partialAddress
                            : null
                    }
                    showExactLocation={reservationsStore.isGuest.status}
                    propertyName={property.name}
                    isVisible={visibleModal === 'location'}
                    setIsVisible={setVisibleModal}
                />
            </div>
            {property.propertyPhotos && property.propertyPhotos?.length > 0 ? (
                <PropertyPhotos propertyId={property.id} photos={property.propertyPhotos} />
            ) : null}
            <div className="property-details-description">
                <h2 className="h4-style">About this stay</h2>
                <div className="pdd-summary-block mb">
                    {propertyBedrooms ? (
                        <div className="item">
                            <Image src={Bed} alt="icon" />
                            {propertyBedrooms} Bedrooms
                        </div>
                    ) : null}
                    {property.bathrooms ? (
                        <div className="item">
                            <Image src={Bath} alt="icon" />
                            {property.bathrooms} Bathrooms
                        </div>
                    ) : null}
                    {property.numberOfGuests ? <div className="item">Sleeps {property.numberOfGuests}</div> : null}
                </div>
                <div className="textbox white-space-break">{property.description}</div>
                {topAmenities.length > 0 ? (
                    <>
                        <h3 className="h5-style">Top Amenities</h3>
                        <div className={`pdd-amenities-listing ${topAmenities.length > 10 ? 'mb' : 'mb-big'}`}>
                            <div className="inner-wrap">
                                {topAmenities.map((amenity, idx) => {
                                    if (idx <= 9) {
                                        return (
                                            <div key={idx} className="item">
                                                {amenity.fullName}
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    </>
                ) : null}
                {topAmenities.length > 10 ? (
                    <a onClick={showAmenitiesModal} className="sp-link mb-big">
                        Show all {topAmenities.length} amenities
                    </a>
                ) : null}
                <PropertyDetailsAmenitiesModal
                    amenitiesByCategories={property.amenitiesByCategories}
                    isVisible={visibleModal === 'amenities'}
                    setIsVisible={setVisibleModal}
                />
                {property.propertyBedrooms && property.propertyBedrooms.length > 0 ? (
                    <>
                        <h3 className="h5-style">Bedrooms</h3>
                        <div className="pdd-bedrooms-listing items-listing three-cols mb-big">
                            <div className="inner-wrap">
                                {property.propertyBedrooms.map((bedroom, idx) => (
                                    <div key={bedroom.id} className="item">
                                        <div>
                                            <strong>Bedroom {idx + 1}</strong>
                                        </div>
                                        <div>
                                            {bedroom.value} {bedroom.dictionaryValue?.fullName}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : null}
                <h3 className="h5-style">House rules</h3>
                <div className="pdd-rules-listing items-listing three-cols mb-big">
                    <div className="inner-wrap">
                        {property.petsAllowed ? (
                            <div className="item">Pets allowed</div>
                        ) : (
                            <div className="item">No pets</div>
                        )}
                        {property.smokingAllowed ? (
                            <div className="item">Smoking allowed</div>
                        ) : (
                            <div className="item">No smoking</div>
                        )}
                        {property.eventsAllowed ? (
                            <div className="item">Parties or events allowed</div>
                        ) : (
                            <div className="item">No parties or events</div>
                        )}
                        {property.maxGuests ? <div className="item">Max Guests: {property.maxGuests}</div> : null}
                        {property.checkIn ? (
                            <div className="item">Check-in after: {getTime(property.checkIn)}</div>
                        ) : null}
                        {property.checkOut ? (
                            <div className="item">Check-out before: {getTime(property.checkOut)}</div>
                        ) : null}
                    </div>
                </div>
                {property.additionalRules ? (
                    <>
                        <h3 className="h5-style">Additional rules</h3>
                        <div className="textbox">{property.additionalRules}</div>
                    </>
                ) : null}
                {reviews.count > 0 ? (
                    <PropertyReviews
                        propertyId={property.id}
                        averageRating={property.overallRating}
                        initialReviews={reviews.rows}
                        initialCount={reviews.count}
                    />
                ) : null}
            </div>
        </div>
    );
});

export default PropertyDetails;
