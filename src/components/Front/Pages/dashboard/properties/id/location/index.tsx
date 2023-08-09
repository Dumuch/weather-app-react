import React, { FunctionComponent, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Property } from '../../../../../../../models/api/property';
import { FrontButton } from '../../../../../Global/button';
import PropertySectionLocationForm from './changeLocationForm';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMaps } from '../../../../../../../utils/useGoogleMaps';

interface Props {
    property: Property;
}

const PropertySectionLocation: FunctionComponent<Props> = observer(({ property }) => {
    const { isLoaded } = useGoogleMaps();
    const [onlyRead, setOnlyRead] = useState(true);

    const onLoad = useCallback(
        function callback(obMap: google.maps.Map) {
            new google.maps.Marker({ position: { ...location }, map: obMap });
        },
        [onlyRead]
    );

    const activeForm = () => setOnlyRead(false);

    const closeEditLocationForm = () => setOnlyRead(true);

    const location = {
        lat: property.lat,
        lng: property.lng,
    };

    return (
        <>
            {onlyRead ? (
                <>
                    <address className="location-address mb">
                        {property.address1}
                        <br />
                        {property.address2 && (
                            <>
                                {property.address2}
                                <br />
                            </>
                        )}
                        {property.city}, {property.state} {property.zip}
                    </address>
                    {location.lat && location.lng ? (
                        <div className="mb-big">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', minHeight: '320px', height: '100%' }}
                                    mapContainerClassName={'location-address-google-map'}
                                    zoom={18}
                                    onLoad={onLoad}
                                    options={{
                                        center: location,
                                        zoomControl: true,
                                        zoomControlOptions: {
                                            position: google.maps.ControlPosition.LEFT_CENTER,
                                        },
                                    }}
                                />
                            ) : (
                                <p className={'mb-big'}>Loading Google Maps</p>
                            )}
                        </div>
                    ) : (
                        <p className={'mb-big'}>The address is not found.</p>
                    )}
                    <div className="form-footer mb-big">
                        <FrontButton className={'btn-primary'} type={'button'} onClick={activeForm}>
                            Edit information
                        </FrontButton>
                    </div>
                </>
            ) : (
                <PropertySectionLocationForm property={property} cancel={closeEditLocationForm} />
            )}
        </>
    );
});

export default PropertySectionLocation;
