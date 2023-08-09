import React, { Dispatch, FunctionComponent, SetStateAction, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FrontModal } from '../../../../Global/modal';
import axios from 'axios';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import ModalFooter from '../../../../Global/modalFooter';
import { PropertyDetailsModalsState } from '../PropertyDetails';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMaps } from '../../../../../../utils/useGoogleMaps';

interface Props {
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<PropertyDetailsModalsState>>;
    location: { lat: number; lng: number };
    addressString: string | null;
    showExactLocation: boolean | null;
    propertyName: string;
}

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_REACT_APP_GOOGLE_MAPS_KEY ?? '';

const PropertyDetailsLocationModal: FunctionComponent<Props> = observer(
    ({ isVisible, setIsVisible, addressString, propertyName, location, showExactLocation }) => {
        const [error, setError] = useState<string | null>(null);
        const { isLoaded } = useGoogleMaps();
        const onLoad = useCallback(
            function callback(map: google.maps.Map) {
                new google.maps.Marker({ position: { ...location }, map });
                if (!showExactLocation) {
                    new google.maps.Circle({
                        center: {
                            lat: location.lat,
                            lng: location.lng,
                        },
                        fillColor: '#1976D2',
                        fillOpacity: 0.35,
                        strokeWeight: 1,
                        radius: 200,
                        map,
                    });
                }
            },
            [location]
        );

        useEffect(() => {
            if (isVisible) {
                setError(null);
                const address = addressString?.replaceAll(', ', '+');
                axios
                    .get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_KEY}`)
                    .then(({ data }) => {
                        if (data.status !== 'OK') {
                            setError('The property`s location not found, please try again');
                        }
                    })
                    .catch((err) => {
                        setError('The property`s location not found, please try again');
                    });
            }
        }, [isVisible]);

        const hideModal = () => setIsVisible('');
        return (
            <FrontModal
                header={propertyName}
                visible={isVisible}
                onHide={hideModal}
                footer={<ModalFooter success={'true'} closeModalHandler={hideModal} />}
                dismissableMask={true}
                position={'top'}
                className={'modal-lg p-dialog-content_scroll'}
            >
                <div className="textbox mb">{addressString}</div>
                <FrontNotificationField alertType={AlertType.danger} message={error} />
                <div className="modal-map-wrap">
                    {location && !error ? (
                        <>
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', minHeight: '320px', height: '100%' }}
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
                        </>
                    ) : null}
                </div>
            </FrontModal>
        );
    }
);
export default PropertyDetailsLocationModal;
