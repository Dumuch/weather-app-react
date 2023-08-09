import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { FrontRoutesList } from '../../FrontRoutesList';
import FrontInput from '../../../Global/input';
import { getFormatData } from '../../../../../utils/dateTime';
import { dateConfig } from '../../../../../config/date';
import { FrontButton } from '../../../Global/button';
import React, { useEffect, useState } from 'react';
import { geocodeByPlaceId, getLatLng } from 'react-places-autocomplete';
import { FrontFloatLabel } from '../../../Global/floatLabel';
import { InputNumber } from 'primereact/inputnumber';
import { useStores } from '../../../../../store';
import dynamic from 'next/dynamic';
import { useGoogleMaps } from '../../../../../utils/useGoogleMaps';

interface initialValuesInterface {
    destination: string;
    checkIn: string;
    checkOut: string;
    checkInOut: Date[] | null;
    guests: number | null;
}

const DynamicCalendarInput = dynamic(() => import('./CalendarInput'));
const DynamicPlacesAutocomplete = dynamic(() => import('react-places-autocomplete'));

const Masthead = () => {
    const router = useRouter();
    const { propertiesStore } = useStores();
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>();
    const [viewport, setViewport] = useState<{
        southwest: { lat: number; lng: number };
        northeast: { lat: number; lng: number };
    }>();
    const [countryState, setCountryState] = useState('');
    const [viewDate, setViewDate] = useState(() => new Date());
    const [placeTypes, setPlaceTypes] = useState<string[]>([]);
    const { isLoaded } = useGoogleMaps();

    const initialValues: initialValuesInterface = {
        destination: '',
        checkIn: '',
        checkOut: '',
        checkInOut: null,
        guests: null,
    };

    const onSubmit = (values: initialValuesInterface) => {
        const queryObject = Object.assign(
            {},
            values.destination ? { destination: values.destination } : '',
            values.checkInOut
                ? {
                      checkIn: getFormatData(values.checkInOut[0], dateConfig.formats.dateOnlyDay),
                      checkOut: getFormatData(values.checkInOut[1], dateConfig.formats.dateOnlyDay),
                  }
                : '',
            values.guests ? { guests: values.guests } : '',
            location?.lat ? { lat: location.lat } : '',
            location?.lng ? { lng: location.lng } : '',
            viewport?.southwest
                ? { southwest: JSON.stringify({ lat: viewport.southwest.lat, lng: viewport.southwest.lng }) }
                : '',
            viewport?.northeast
                ? { northeast: JSON.stringify({ lat: viewport.northeast.lat, lng: viewport.northeast.lng }) }
                : '',
            countryState ? { state: countryState } : '',
            placeTypes.length > 0 ? { placeTypes: JSON.stringify(placeTypes) } : ''
        );

        propertiesStore.setSearchComponent({
            ...propertiesStore.searchComponent,
            viewport,
            state: countryState,
            filters: {
                checkIn: values.checkInOut ? getFormatData(values.checkInOut[0], dateConfig.formats.dateOnlyDay) : '',
                checkOut: values.checkInOut ? getFormatData(values.checkInOut[1], dateConfig.formats.dateOnlyDay) : '',
                guests: values.guests ? Number(values.guests) : undefined,
                lat: location?.lat ? Number(location.lat) : undefined,
                lng: location?.lng ? Number(location.lng) : undefined,
                placeTypes: placeTypes ? placeTypes : undefined,
            },
        });
        router.push({ pathname: FrontRoutesList.Properties, query: queryObject });
    };

    const handleChange = (address: string) => {
        setAddress(address);
    };
    const handleSelect = (address: string, placeId: string) => {
        geocodeByPlaceId(placeId)
            .then(async (results) => {
                const state = results[0].address_components.filter((address) =>
                    address.types.includes('administrative_area_level_1')
                )[0]?.short_name;
                setAddress(results[0].formatted_address);
                setViewport({
                    southwest: {
                        lat: results[0].geometry.viewport.getSouthWest().lat(),
                        lng: results[0].geometry.viewport.getSouthWest().lng(),
                    },
                    northeast: {
                        lat: results[0].geometry.viewport.getNorthEast().lat(),
                        lng: results[0].geometry.viewport.getNorthEast().lng(),
                    },
                });
                setCountryState(state);
                setLocation(await getLatLng(results[0]));
                setPlaceTypes(results[0].types as []);
            })
            .catch((error) => console.error('Error', error));
    };

    return (
        <section className="masthead-section bg-image-cover bg-image-masthead-home">
            <div className="container">
                <h1 className="text-center color-white">
                    Bid your way to a better <span className="housetop">Stay</span>
                </h1>
                <div className="form-wrap main-search-form">
                    <Formik initialValues={initialValues} onSubmit={onSubmit}>
                        {(props) => {
                            return (
                                <Form>
                                    <div className="inner-wrap">
                                        <div className="form-group bbs-custom-dropdown">
                                            {isLoaded ? (
                                                <DynamicPlacesAutocomplete
                                                    value={address}
                                                    onChange={handleChange}
                                                    onSelect={handleSelect}
                                                >
                                                    {({
                                                        getInputProps,
                                                        suggestions,
                                                        getSuggestionItemProps,
                                                        loading,
                                                    }) => (
                                                        <>
                                                            {/* @ts-ignore */}
                                                            <FrontInput
                                                                {...getInputProps({
                                                                    name: 'destination',
                                                                    label: 'Find your destination',
                                                                    classInput: 'hide-box-shadow',
                                                                })}
                                                            />
                                                            <div
                                                                className="dropdown-menu"
                                                                style={{
                                                                    display: suggestions?.length ? 'block' : 'none',
                                                                }}
                                                                aria-labelledby="dropdownMenuSorting"
                                                            >
                                                                {!loading && (
                                                                    <div className="wrapper-dropdown-menu">
                                                                        <ul className="dropdown-menu__list">
                                                                            {suggestions.map((suggestion, idx) => {
                                                                                return (
                                                                                    <li key={idx}>
                                                                                        <button
                                                                                            type={'button'}
                                                                                            {...getSuggestionItemProps(
                                                                                                suggestion
                                                                                            )}
                                                                                        >
                                                                                            {suggestion.description}
                                                                                        </button>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </DynamicPlacesAutocomplete>
                                            ) : (
                                                <FrontInput
                                                    value={''}
                                                    name={'destination'}
                                                    label={'Find your destination'}
                                                    classWrapper={'hide-box-shadow'}
                                                />
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <DynamicCalendarInput
                                                label="Check-in Check-out"
                                                className="check-in-calendar"
                                                viewDate={viewDate}
                                                setViewDate={setViewDate}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <FrontFloatLabel label="Guests" id="guests">
                                                <InputNumber
                                                    name="guests"
                                                    value={props.values.guests}
                                                    onValueChange={props.handleChange}
                                                    className="hide-box-shadow"
                                                    min={1}
                                                    max={50}
                                                />
                                            </FrontFloatLabel>
                                        </div>
                                        <div className="form-group">
                                            <FrontButton label="Search" icon="pi pi-search" iconPos="left" />
                                        </div>
                                    </div>
                                </Form>
                            );
                        }}
                    </Formik>
                </div>
            </div>
        </section>
    );
};

export default Masthead;
