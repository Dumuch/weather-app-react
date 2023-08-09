import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { GoogleMap } from '@react-google-maps/api';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../store';
import markerIcon from '../../../../../../public/assets/img/i-marker.svg';
import markerIconHover from '../../../../../../public/assets/img/i-marker-hover.svg';
import markerIconOrange from '../../../../../../public/assets/img/i-marker-orange.svg';
import { useGoogleMaps } from '../../../../../utils/useGoogleMaps';
import MapCard from './mapCard';
import ReactDOMServer from 'react-dom/server';
import { Property } from '../../../../../models/api/property';

interface Props {
    mapTop: number;
    mapBottom: number;
}

const containerStyle = {
    width: '100%',
    height: '100%',
};

interface Bounds {
    northeast: { lat: number; lng: any };
    southwest: { lat: number; lng: number };
}

const PropertyListMapSection: FunctionComponent<Props> = observer(({ mapTop, mapBottom }) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerClusterer, setMarkerClusterer] = useState<MarkerClusterer | null>(null);
    const { propertiesStore, globalStore } = useStores();
    const { isLoaded } = useGoogleMaps();
    const [currentBounds, setCurrentBounds] = useState<Bounds>();
    const [isManualChangeBounds, setIsManualChangeBounds] = useState(true);
    let infoWindow: google.maps.InfoWindow | null = null;
    useEffect(() => {
        if (map && !propertiesStore.searchComponent.allowManualChangeBounds) {
            if (
                propertiesStore.searchComponent.viewport?.southwest &&
                propertiesStore.searchComponent.viewport?.northeast
            ) {
                const bounds = new google.maps.LatLngBounds(
                    propertiesStore.searchComponent.viewport.southwest,
                    propertiesStore.searchComponent.viewport.northeast
                );
                map.fitBounds(bounds);
            }
        }
    }, [propertiesStore.searchComponent.centerLocation, map]);

    const closeInfoWindow = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const parent = target.parentNode as HTMLElement | null;
        if (parent && parent.getAttribute('role') !== 'button') {
            infoWindow?.close();
        }
        document.removeEventListener('click', closeInfoWindow);
    };

    const getContent = async (property: Property) => {
        return (
            <div className="map-info-window">
                <MapCard
                    propertiesStore={propertiesStore}
                    property={property}
                    photo={property.previewPhoto ?? ''}
                    globalStore={globalStore}
                />
            </div>
        );
    };

    useEffect(() => {
        if (isLoaded) {
            const hoverMarkerPosition: { lat: number | undefined; lng: number | undefined } = {
                lat: undefined,
                lng: undefined,
            };
            infoWindow = new google.maps.InfoWindow({
                content: '',
                disableAutoPan: true,
            });
            const bounds = new google.maps.LatLngBounds();

            const markers = propertiesStore.searchComponent.properties.map((property, i) => {
                const marker = new google.maps.Marker({
                    position: {
                        lat: property.lat ? property.lat : 39.0481301,
                        lng: property.lng ? property.lng : -102.4626842,
                    },
                    icon: markerIcon.src,
                });

                marker.addListener('click', async () => {
                    if (
                        hoverMarkerPosition?.lng !== marker.getPosition()?.lng() ||
                        hoverMarkerPosition?.lat !== marker.getPosition()?.lat()
                    ) {
                        hoverMarkerPosition.lat = marker.getPosition()?.lat();
                        hoverMarkerPosition.lng = marker.getPosition()?.lng();

                        infoWindow?.setContent(ReactDOMServer.renderToStaticMarkup(await getContent(property)));
                        infoWindow?.open(map, marker);
                        marker.setIcon(markerIconHover.src);
                        setTimeout(() => {
                            infoWindow && document.addEventListener('click', closeInfoWindow);
                        }, 100);
                    }
                });

                marker.addListener('mouseover', async () => {
                    if (
                        hoverMarkerPosition?.lng !== marker.getPosition()?.lng() ||
                        hoverMarkerPosition?.lat !== marker.getPosition()?.lat()
                    ) {
                        hoverMarkerPosition.lat = marker.getPosition()?.lat();
                        hoverMarkerPosition.lng = marker.getPosition()?.lng();

                        infoWindow?.setContent(ReactDOMServer.renderToStaticMarkup(await getContent(property)));
                        infoWindow?.open(map, marker);
                        marker.setIcon(markerIconHover.src);
                        infoWindow && document.addEventListener('click', closeInfoWindow);
                    }
                });

                if (marker.getPosition()?.lat() && marker.getPosition()?.lng() && bounds) {
                    const loc = new google.maps.LatLng(
                        marker.getPosition()?.lat() as number,
                        marker.getPosition()?.lng()
                    );
                    bounds.extend(loc);
                }

                return marker;
            });

            markerClusterer?.clearMarkers();
            markerClusterer?.addMarkers(markers);

            if (map && markers.length > 0 && !propertiesStore.searchComponent.allowManualChangeBounds) {
                map.fitBounds(bounds);
                map.panToBounds(bounds);
            }
        }
    }, [propertiesStore.searchComponent.properties, map, isLoaded]);

    const [hoverMarker, setHoverMarker] = useState<google.maps.Marker>();

    useEffect(() => {
        if (isLoaded && propertiesStore.searchComponent.hoverProperty) {
            const property = propertiesStore.searchComponent.hoverProperty;
            setHoverMarker(
                new google.maps.Marker({
                    map: map,
                    position: {
                        lat: property.lat ? property.lat : 39.0481301,
                        lng: property.lng ? property.lng : -102.4626842,
                    },
                    icon: markerIconOrange.src,
                    zIndex: 99999999,
                })
            );
        }
        hoverMarker && hoverMarker.setMap(null);
    }, [propertiesStore.searchComponent.hoverProperty, map, isLoaded]);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMarkerClusterer(new MarkerClusterer({ map }));
        setMap(map);

        setTimeout(() => {
            document.querySelector('.gmnoprint')?.removeEventListener('click', onStartChangeManualBounds);
            document.querySelector('.gmnoprint')?.addEventListener('click', onStartChangeManualBounds);
        }, 1500);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    const onChangePosition = () => {
        if (map && isManualChangeBounds && propertiesStore.searchComponent.allowManualChangeBounds) {
            propertiesStore.searchComponent.viewport = currentBounds;
        }
    };

    const onBoundsChanged = () => {
        if (propertiesStore.searchComponent.allowManualChangeBounds) {
            const bounds = map?.getBounds();
            setCurrentBounds({
                northeast: {
                    lat: bounds?.getNorthEast().lat() ?? 0,
                    lng: bounds?.getNorthEast().lng() ?? 0,
                },
                southwest: {
                    lat: bounds?.getSouthWest().lat() ?? 0,
                    lng: bounds?.getSouthWest().lng() ?? 0,
                },
            });
        }
    };

    const handlerChangeManualBounds = (e: React.FormEvent<HTMLInputElement>) => {
        setIsManualChangeBounds((prevState) => !prevState);
    };

    const onStartChangeManualBounds = () => {
        propertiesStore.setAllowManualChangeBounds(true);
    };

    return (
        <div id={'map'} className="property-catalog-map affix-top" style={{ top: mapTop, bottom: mapBottom }}>
            {isLoaded ? (
                <GoogleMap
                    onIdle={onChangePosition}
                    onDragStart={onStartChangeManualBounds}
                    onBoundsChanged={onBoundsChanged}
                    mapContainerStyle={containerStyle}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                        mapTypeControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.LEFT_CENTER,
                        },
                    }}
                >
                    <div className="property-catalog-map__manual-change-bounds checkbox">
                        <label>
                            <input
                                type={'checkbox'}
                                onInput={handlerChangeManualBounds}
                                checked={isManualChangeBounds}
                                value={isManualChangeBounds ? 'on' : 'off'}
                            />
                            <span className="radio-check-control"></span>
                            <span className="radio-check-label">Search when I move map</span>
                        </label>
                    </div>
                </GoogleMap>
            ) : (
                <>
                    <p className={'mb-big'}>Loading Google Maps</p>
                </>
            )}
        </div>
    );
});

export default PropertyListMapSection;
