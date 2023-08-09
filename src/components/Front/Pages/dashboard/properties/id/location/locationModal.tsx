import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FrontButton } from '../../../../../Global/button';
import { FrontModal } from '../../../../../Global/modal';
import axios from 'axios';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMaps } from '../../../../../../../utils/useGoogleMaps';

interface Props {
    isOpenModal: boolean;
    closeLocationModal: () => void;
    confirmLocation: () => void;
    setLocation: (location: { lat: number; lng: number } | null) => void;
    location: { lat: number; lng: number } | null;
    zip: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
}

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_REACT_APP_GOOGLE_MAPS_KEY ?? '';

const PropertySectionLocationModal: FunctionComponent<Props> = observer(
    ({
        isOpenModal,
        closeLocationModal,
        zip,
        address1,
        address2,
        city,
        state,
        confirmLocation,
        setLocation,
        location,
    }) => {
        const [error, setError] = useState<string | null>(null);

        const { isLoaded } = useGoogleMaps();

        const onLoad = useCallback(
            function callback(obMap: google.maps.Map) {
                if (location?.lat && location?.lng) {
                    new google.maps.Marker({ position: { ...location }, map: obMap });
                }
            },
            [location]
        );

        useEffect(() => {
            if (isOpenModal) {
                setLocation(null);
                setError(null);
                const address = `${zip} ${address1} ${address2} ${city} ${state}`.replaceAll(' ', '+');
                axios
                    .get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_KEY}`)
                    .then(({ data }) => {
                        if (data.status === 'OK') {
                            setLocation(data.results[0].geometry.location);
                        } else {
                            setError('The property`s location not found, please try again');
                        }
                    })
                    .catch((err) => {
                        setError('The property`s location not found, please try again');
                    });
            }
        }, [isOpenModal]);

        const handlerConfirmLocation = () => {
            if (!location?.lat || !location?.lng) {
                setError('The property`s location not found, please try again');
                return;
            }
            confirmLocation();
            closeModal()();
        };

        const closeModal = () =>
            function () {
                closeLocationModal();
            };

        const renderFooter = () => {
            return (
                <>
                    <FrontButton
                        onClick={handlerConfirmLocation}
                        className={'btn-primary'}
                        type={'button'}
                        disabled={!!error}
                    >
                        Confirm
                    </FrontButton>
                    <FrontButton className={'btn-border'} type={'button'} onClick={closeModal()}>
                        Cancel
                    </FrontButton>
                </>
            );
        };

        return (
            <FrontModal
                header={'Confirm Location'}
                visible={isOpenModal}
                onHide={closeModal()}
                footer={renderFooter}
                dismissableMask={true}
                position={'top'}
                className={'modal-lg'}
            >
                <FrontNotificationField alertType={AlertType.danger} message={error} />
                <address className="location-address mb">
                    {address1}
                    <br />
                    {address2 && (
                        <>
                            {address2}
                            <br />
                        </>
                    )}
                    {city}, {state} {zip}
                </address>
                <div className="mb">
                    {location ? (
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
                                <p>Loading Google Maps</p>
                            )}
                        </>
                    ) : (
                        <p>Address not found.</p>
                    )}
                </div>
            </FrontModal>
        );
    }
);
export default PropertySectionLocationModal;
