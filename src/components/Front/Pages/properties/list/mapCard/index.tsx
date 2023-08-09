import Link from 'next/link';
import React, { FunctionComponent } from 'react';
import { getObHref } from '../../../../../../utils/helpers';
import { observer } from 'mobx-react-lite';
import { Property, PropertyPhoto } from '../../../../../../models/api/property';
import { PropertiesStore } from '../../../../../../store/stores/propertiesStore';
import { Image as StaticImage } from '../../../../Global/react-image';
import FrontSkeleton from '../../../../Global/skeleton';
import { GlobalStore } from '../../../../../../store/stores/globalStore';

interface Props {
    property: Property;
    propertiesStore: PropertiesStore;
    globalStore: GlobalStore;
    photo: string;
}

const MapCard: FunctionComponent<Props> = observer(({ property, propertiesStore, photo, globalStore }) => {
    let currentPhoto: string = '';
    (async () => {
        const mainPhoto = property?.propertyPhotos?.find((photo) => photo.mainPhoto === true)?.name;
        if (mainPhoto) {
            currentPhoto = mainPhoto;
        } else {
            currentPhoto =
                property?.propertyPhotos?.slice().sort((a, b) => (a.order < b.order ? -1 : 1))[0]?.name ?? '';
        }
        if (currentPhoto) {
            await globalStore
                .getFileFromS3(`${property.id}/thumbnails/thumbnail-500_${currentPhoto}`, 'properties')
                .then((photo) => {
                    const img = document.querySelector(`#photo-${property.id} img`);
                    img?.setAttribute('src', photo);

                    document.querySelector(`#photo-${property.id} img`)?.addEventListener('load', function () {
                        const lazyImage = document.querySelector(`#photo-${property.id} .lazy-image`) as HTMLElement;
                        if (lazyImage) {
                            lazyImage.style.opacity = '1';
                        }
                        document.querySelector(`#photo-${property.id} .p-skeleton`)?.remove();
                    });

                    document.querySelector(`#photo-${property.id} img`)?.addEventListener('error', function () {
                        document.querySelector(`#photo-${property.id}`)?.remove();
                        document.querySelector(`#photo-${property.id} .p-skeleton`)?.remove();
                    });
                });
        }
    })();

    return (
        <div className="property-card-map">
            {currentPhoto ? (
                <div className="image" id={`photo-${property.id}`}>
                    {photo ? (
                        <>
                            <FrontSkeleton width={'150px'} height={'109px'} />

                            <StaticImage
                                src={''}
                                alt={property.name}
                                width={`150`}
                                height={`109`}
                                className={`lazy-image`}
                                style={{ opacity: 0 }}
                            />
                        </>
                    ) : null}
                </div>
            ) : null}
            <div className="content">
                <div className="config-wrap">
                    <>
                        {property.propertyBedrooms && property.propertyBedrooms?.length > 0 && (
                            <span>{property.propertyBedrooms.length} BR</span>
                        )}
                        {property.bathrooms && <span>{property.bathrooms} BA</span>}
                        {property.numberOfGuests && <span>Sleeps {property.numberOfGuests}</span>}
                    </>
                </div>
                <div className="pricing-wrap">
                    {property.nightlyPrice ? (
                        <div className="night">Night: ${property.nightlyPrice.toFixed(2)}</div>
                    ) : null}
                </div>
            </div>
            <Link href={getObHref(propertiesStore, property)}>
                <a target={'_blank'} className="area-link" rel="noreferrer"></a>
            </Link>
        </div>
    );
});

export default MapCard;
