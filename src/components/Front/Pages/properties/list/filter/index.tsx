import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useScroll } from '../../../../../../utils/useScroll';
import classnames from 'classnames';
import { Field, Form, Formik } from 'formik';
import { getFormatData } from '../../../../../../utils/dateTime';
import { dateConfig } from '../../../../../../config/date';
import FrontInput, { InputType } from '../../../../Global/input';
import CalendarInput from './CalendarInput';
import PlacesAutocomplete, { getLatLng, geocodeByPlaceId } from 'react-places-autocomplete';
import axios from 'axios';
import { DictionaryCode, HouseRules } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { FrontRangeSlider } from '../../../../Global/rangeSlider';

import { AllCheckerCheckbox, Checkbox, CheckboxGroup } from '@createnl/grouped-checkboxes';
import AllFiltersModal from './AllFiltersModal';
import OutsideClickHandler from 'react-outside-click-handler';
import { observer } from 'mobx-react-lite';
import { SliderChangeParams } from 'primereact/slider';
import { FrontButton } from '../../../../Global/button';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { formatIntoPriceValue, initialCheckInOut, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { useGoogleMaps } from '../../../../../../utils/useGoogleMaps';
import { appConfig, HOUSE_RULES_DROPDOWN } from '../../../../../../config/app';
import parse from 'date-fns/parse';

interface initialValuesInterface {
    checkIn: Date | null;
    checkOut: Date | null;
    checkInOut: Date[] | null;
    guests: number | null;
    acceptingBids: boolean;
    bedRooms: number | null;
    bathRooms: number | null;
    amenities: any[];
    propertyTypes: any[];
    cancellationPolicy: any[];
    price: [number, number];
    sliderPrice: [number, number];
    houseRules: any[];
}

interface Props {
    submitFilter: () => void;
}
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_REACT_APP_GOOGLE_MAPS_KEY ?? '';

const PropertyListFilterSection: FunctionComponent<Props> = observer(({ submitFilter }) => {
    const { dictionaryStore, globalStore, propertiesStore, userStore } = useStores();

    const defaultCalendarView =
        propertiesStore.searchComponent.filters.checkIn || propertiesStore.searchComponent.filters.checkOut;

    const { hasScrolled } = useScroll();
    const [address, setAddress] = useState('');
    const [loadingSaveSearch, setLoadingSaveSearch] = useState(false);
    const [errorRangePrice, setErrorRangePrice] = useState('');
    const [viewDate, setViewDate] = useState(() => (defaultCalendarView ? new Date(defaultCalendarView) : new Date()));
    const { isLoaded } = useGoogleMaps();

    let formikSetValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
    let formikValues: initialValuesInterface;
    const [openModalName, setOpenModalName] = useState('');

    const handlerButtonOpenModal = (modalName: string) => () => {
        setErrorRangePrice('');
        if (modalName !== openModalName) {
            setTimeout(() => {
                setOpenModalName(modalName);
            }, 0);
        }
    };

    const onOutsideClick = async () => {
        handlerButtonOpenModal('')();
        await onSubmit(formikValues);
    };

    const handleChange = (address: string) => {
        if (!address) {
            propertiesStore.setSearchComponent({
                ...propertiesStore.searchComponent,
                filters: {
                    ...propertiesStore.searchComponent.filters,
                    locationStr: '',
                    placeTypes: [],
                },
            });
        }
        setAddress(address);
    };

    useEffect(() => {
        propertiesStore.searchComponent.allowManualChangeBounds && onSubmit(formikValues);
    }, [propertiesStore.searchComponent.viewport]);

    const saveSearch = async () => {
        try {
            await onSubmit(formikValues);
            setLoadingSaveSearch(true);
            await userStore.createUserSearch({
                ...propertiesStore.searchComponent.filters,
                ...propertiesStore.searchComponent.viewport,
                state: propertiesStore.searchComponent.state,
            });

            globalStore.showToast({
                severity: 'success',
                detail: 'The filters have been saved',
            });
        } catch (e) {
            globalStore.showToast({
                severity: 'error',
                detail: 'The filters have not saved',
            });
        } finally {
            setLoadingSaveSearch(false);
        }
    };

    const clearFilter = () => {
        formikSetValue('guests', null);
        formikSetValue('checkOut', null);
        formikSetValue('checkIn', null);
        formikSetValue('checkInOut', null);
        formikSetValue('amenities', []);
        formikSetValue('bedRooms', null);
        formikSetValue('bathRooms', null);
        formikSetValue('propertyTypes', []);
        formikSetValue('acceptingBids', false);
        formikSetValue('houseRules', []);

        formikSetValue('cancellationPolicy', []);
        formikSetValue('price', [
            propertiesStore.searchComponent.rangePrice[0],
            propertiesStore.searchComponent.rangePrice[1],
        ]);
        formikSetValue('sliderPrice', [
            propertiesStore.searchComponent.rangePrice[0],
            propertiesStore.searchComponent.rangePrice[1],
        ]);
        setAddress('');
        propertiesStore.clearSearchFilter();
        submitFilter();
    };

    const handleSelect = (address: string, placeId: string) => {
        geocodeByPlaceId(placeId)
            .then(async (results) => {
                setAddress(results[0].formatted_address);
                const location = await getLatLng(results[0]);
                const state = results[0].address_components.filter((address) =>
                    address.types.includes('administrative_area_level_1')
                )[0]?.short_name;
                propertiesStore.setSearchComponent({
                    ...propertiesStore.searchComponent,
                    centerLocation: {
                        ...location,
                    },
                    viewport: {
                        southwest: {
                            lat: results[0].geometry.viewport.getSouthWest().lat(),
                            lng: results[0].geometry.viewport.getSouthWest().lng(),
                        },
                        northeast: {
                            lat: results[0].geometry.viewport.getNorthEast().lat(),
                            lng: results[0].geometry.viewport.getNorthEast().lng(),
                        },
                    },
                    state,
                    filters: {
                        ...propertiesStore.searchComponent.filters,
                        ...location,
                        locationStr: results[0].formatted_address,
                        placeTypes: results[0].types,
                    },
                });
                await onSubmit(formikValues);
            })
            .catch((error) => console.error('Error', error));
    };

    useEffect(() => {
        setTimeout(() => {
            if (propertiesStore.searchComponent.filters?.lat && propertiesStore.searchComponent.filters?.lng) {
                axios
                    .get(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${propertiesStore.searchComponent.filters.lat}, ${propertiesStore.searchComponent.filters.lng}&key=${GOOGLE_MAPS_KEY}`
                    )
                    .then(({ data }) => {
                        if (data.status === 'OK') {
                            propertiesStore.setSearchComponent({
                                ...propertiesStore.searchComponent,
                                filters: {
                                    ...propertiesStore.searchComponent.filters,
                                    locationStr: data.results[0].formatted_address,
                                },
                            });
                            if (
                                propertiesStore.searchComponent.filters.placeTypes &&
                                propertiesStore.searchComponent.filters.placeTypes?.length > 0
                            ) {
                                const findResult = data.results.find((item: { types: any }) => {
                                    return (
                                        JSON.stringify(item.types) ===
                                        JSON.stringify(propertiesStore.searchComponent.filters.placeTypes)
                                    );
                                });

                                if (findResult) {
                                    setAddress(findResult.formatted_address);
                                } else {
                                    setAddress(data.results[0].formatted_address);
                                }
                            } else {
                                setAddress(data.results[0].formatted_address);
                            }
                        }
                    })
                    .catch((err) => {});
            }

            formikSetValue('guests', propertiesStore.searchComponent.filters.guests ?? null);
            formikSetValue(
                'checkOut',
                propertiesStore.searchComponent.filters.checkOut
                    ? parse(
                          propertiesStore.searchComponent.filters.checkOut,
                          dateConfig.formats.dateOnlyDay,
                          new Date()
                      )
                    : null
            );
            formikSetValue(
                'checkIn',
                propertiesStore.searchComponent.filters.checkIn
                    ? parse(propertiesStore.searchComponent.filters.checkIn, dateConfig.formats.dateOnlyDay, new Date())
                    : null
            );
            formikSetValue(
                'checkInOut',
                initialCheckInOut(
                    propertiesStore.searchComponent.filters.checkIn,
                    propertiesStore.searchComponent.filters.checkOut
                )
            );
            formikSetValue('acceptingBids', !!propertiesStore.searchComponent.filters.acceptingBids);
            formikSetValue('bedRooms', propertiesStore.searchComponent.filters.bedRooms ?? null);
            formikSetValue('bathRooms', propertiesStore.searchComponent.filters.bathRooms ?? null);

            formikSetValue('price', [
                propertiesStore.searchComponent.filters?.priceMin
                    ? Number(propertiesStore.searchComponent.filters.priceMin)
                    : Number(propertiesStore.searchComponent.rangePrice[0]),
                propertiesStore.searchComponent.filters?.priceMax
                    ? Number(propertiesStore.searchComponent.filters.priceMax)
                    : Number(propertiesStore.searchComponent.rangePrice[1]),
            ]);
            formikSetValue('sliderPrice', [
                propertiesStore.searchComponent.filters?.priceMin
                    ? Number(propertiesStore.searchComponent.filters.priceMin)
                    : Number(propertiesStore.searchComponent.rangePrice[0]),
                propertiesStore.searchComponent.filters?.priceMax
                    ? Number(propertiesStore.searchComponent.filters.priceMax)
                    : Number(propertiesStore.searchComponent.rangePrice[1]),
            ]);
        }, 0);
    }, []);

    const propertyTypes = dictionaryStore.getDictionary(DictionaryCode.propertyTypes);
    const cancellationPolicies = dictionaryStore.getDictionary(DictionaryCode.cancellationPolicies, true, 'order');
    let amenities = dictionaryStore.getDictionary(DictionaryCode.amenities);

    useEffect(() => {
        dictionaryStore.fetchList().then(() => {
            formikSetValue('price', [
                propertiesStore.searchComponent.filters?.priceMin
                    ? Number(propertiesStore.searchComponent.filters.priceMin)
                    : Number(propertiesStore.searchComponent.rangePrice[0]),
                propertiesStore.searchComponent.filters?.priceMax
                    ? Number(propertiesStore.searchComponent.filters.priceMax)
                    : Number(propertiesStore.searchComponent.rangePrice[1]),
            ]);
            formikSetValue('sliderPrice', [
                propertiesStore.searchComponent.filters?.priceMin
                    ? Number(propertiesStore.searchComponent.filters.priceMin)
                    : Number(propertiesStore.searchComponent.rangePrice[0]),
                propertiesStore.searchComponent.filters?.priceMax
                    ? Number(propertiesStore.searchComponent.filters.priceMax)
                    : Number(propertiesStore.searchComponent.rangePrice[1]),
            ]);

            if (propertiesStore.searchComponent.filters.propertyTypes?.length) {
                const activePropertyTypes = propertiesStore.searchComponent.filters.propertyTypes.reduce(
                    (acc: any[], id: number) => {
                        const find = propertyTypes.find((item) => item.id === id);
                        if (find) {
                            acc.push(find);
                        }
                        return acc;
                    },
                    []
                );
                formikSetValue('propertyTypes', activePropertyTypes);
            }

            if (propertiesStore.searchComponent.filters.cancellationPolicy?.length) {
                const activeCancellationPolicy = propertiesStore.searchComponent.filters.cancellationPolicy.reduce(
                    (acc: any[], id: number) => {
                        const find = cancellationPolicies.find((item) => item.id === id);
                        if (find) {
                            acc.push(find);
                        }
                        return acc;
                    },
                    []
                );
                formikSetValue('cancellationPolicy', activeCancellationPolicy);
            }

            if (propertiesStore.searchComponent.filters.amenities?.length) {
                const activeAmenities = propertiesStore.searchComponent.filters.amenities.reduce(
                    (acc: any[], listIds: number[]) => {
                        listIds.forEach((id) => {
                            const find = amenities.find((item) => item.id === id);
                            if (find) {
                                if (acc[find.relatedTo]) {
                                    acc[find.relatedTo] = [
                                        ...acc[find.relatedTo],
                                        { ...find, key: find.id, children: [], label: find.fullName },
                                    ];
                                } else {
                                    acc[find.relatedTo] = [
                                        { ...find, key: find.id, children: [], label: find.fullName },
                                    ];
                                }
                            }
                        });
                        return acc;
                    },
                    Array.from(Array(amenities.length), () => undefined)
                );
                formikSetValue('amenities', activeAmenities);
            }

            const houseRules = [];
            if (propertiesStore.searchComponent.filters.petsAllowed) {
                const find = HOUSE_RULES_DROPDOWN.find((item) => item.shortName === HouseRules.petsAllowed);
                if (find) {
                    houseRules.push(find);
                }
                formikSetValue('houseRules', houseRules);
            }
            if (propertiesStore.searchComponent.filters.eventsAllowed) {
                const find = HOUSE_RULES_DROPDOWN.find((item) => item.shortName === HouseRules.eventsAllowed);
                if (find) {
                    houseRules.push(find);
                }
                formikSetValue('houseRules', houseRules);
            }

            if (propertiesStore.searchComponent.filters.smokingAllowed) {
                const find = HOUSE_RULES_DROPDOWN.find((item) => item.shortName === HouseRules.smokingAllowed);
                if (find) {
                    houseRules.push(find);
                }
                formikSetValue('houseRules', houseRules);
            }
        });
    }, [dictionaryStore, dictionaryStore.isLoading]);

    const arrGroupAmenities: any[] = [];
    amenities.forEach((item) => {
        if (item.relatedTo === null) {
            arrGroupAmenities.push({
                ...item,
                key: item.id,
                label: item.fullName,
                children: [],
            });
        }
    });

    amenities.forEach((item) => {
        if (item.relatedTo) {
            const index = arrGroupAmenities.findIndex((parent) => parent.key === item.relatedTo);
            arrGroupAmenities[index].children.push({
                ...item,
                key: item.id,
                label: item.fullName,
                children: [],
            });
        }
    });

    const onSubmit = async (values: initialValuesInterface) => {
        if (propertiesStore.isLoading) {
            return;
        }
        let amenitiesApply = [];
        for (const amenitiesApplyKey in values.amenities) {
            if (typeof values.amenities[amenitiesApplyKey] === 'object') {
                const amenityIds = values.amenities[amenitiesApplyKey].map((item: { key: number }) => item.key);
                amenitiesApply.push(amenityIds);
            }
        }
        propertiesStore.setSearchComponent({
            ...propertiesStore.searchComponent,
            page: 1,
            centerLocation: {
                lat: propertiesStore.searchComponent.filters?.lat ?? 0,
                lng: propertiesStore.searchComponent.filters?.lng ?? 0,
            },
            viewport: propertiesStore.searchComponent.viewport,
            filters: {
                checkIn: values.checkInOut ? getFormatData(values.checkInOut[0], dateConfig.formats.dateOnlyDay) : '',
                checkOut: values.checkInOut ? getFormatData(values.checkInOut[1], dateConfig.formats.dateOnlyDay) : '',
                guests: values.guests ?? undefined,
                acceptingBids:
                    values.checkInOut && values.checkInOut[0] && values.checkInOut[1]
                        ? values.acceptingBids
                            ? 1
                            : 0
                        : 0,
                propertyTypes: values.propertyTypes.map((item) => item.id),
                cancellationPolicy: values.cancellationPolicy.map((item) => item.id),
                bedRooms: values.bedRooms ?? undefined,
                bathRooms: values.bathRooms ?? undefined,
                amenities: amenitiesApply,
                locationStr: propertiesStore.searchComponent.filters.locationStr ?? '',
                lat: propertiesStore.searchComponent.filters?.lat ?? 0,
                lng: propertiesStore.searchComponent.filters?.lng ?? 0,
                priceMin: propertiesStore.searchComponent.filters.priceMin,
                priceMax:
                    propertiesStore.searchComponent.filters.priceMax &&
                    propertiesStore.searchComponent.filters.priceMax >= appConfig.maxValueForSliderFilter
                        ? undefined
                        : propertiesStore.searchComponent.filters.priceMax,
                placeTypes: propertiesStore.searchComponent.filters.placeTypes ?? [],
                smokingAllowed:
                    values.houseRules.findIndex((value) => value.shortName === HouseRules.smokingAllowed) >= 0 ? 1 : 0,
                petsAllowed:
                    values.houseRules.findIndex((value) => value.shortName === HouseRules.petsAllowed) >= 0 ? 1 : 0,
                eventsAllowed:
                    values.houseRules.findIndex((value) => value.shortName === HouseRules.eventsAllowed) >= 0 ? 1 : 0,
            },
        });
        await submitFilter();
    };

    const countAmenities = (amenities: any[]) => {
        let count = 0;
        amenities.forEach((item) => {
            if (item) {
                count = count + item.length;
            }
        });
        return count;
    };

    const handlerMinPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
        const priceMin = e.target.value ? Number(e.target.value.replace(/\D/g, '')) : 0;
        if (priceMin < formikValues.price[1]) {
            propertiesStore.setSearchComponent({
                ...propertiesStore.searchComponent,
                filters: {
                    ...propertiesStore.searchComponent.filters,
                    priceMin: priceMin,
                    priceMax: formikValues.price[1],
                },
            });
            formikSetValue('price', [priceMin, formikValues.price[1]]);
            formikSetValue('sliderPrice', [priceMin, formikValues.price[1]]);
        } else {
            e.target.value = formatIntoPriceValue(formikValues.sliderPrice[0], true, false, 0, 0);
            formikSetValue('price', formikValues.sliderPrice);
            setErrorRangePrice(
                UseLangMessage('Min Price', ValidationMessage.noMore).replace(
                    '{%replaceNumber%}',
                    formikValues.price[1].toString()
                )
            );
        }
    };

    const handlerMaxPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
        const priceMax = e.target.value
            ? Number(e.target.value.replace(/\D/g, ''))
            : propertiesStore.searchComponent.rangePrice[1];

        if (priceMax > formikValues.price[0] && priceMax <= propertiesStore.searchComponent.rangePrice[1]) {
            propertiesStore.setSearchComponent({
                ...propertiesStore.searchComponent,
                filters: {
                    ...propertiesStore.searchComponent.filters,
                    priceMin: formikValues.price[0],
                    priceMax: priceMax,
                },
            });
            formikSetValue('price', [formikValues.price[0], priceMax]);
            formikSetValue('sliderPrice', [formikValues.price[0], priceMax]);
        } else {
            e.target.value = formatIntoPriceValue(formikValues.sliderPrice[1], true, false, 0, 0);
            formikSetValue('price', formikValues.sliderPrice);
            if (priceMax < formikValues.price[0]) {
                setErrorRangePrice(
                    UseLangMessage('Max Price', ValidationMessage.noLess).replace(
                        '{%replaceNumber%}',
                        formikValues.price[0].toString()
                    )
                );
            } else if (priceMax > propertiesStore.searchComponent.rangePrice[1]) {
                setErrorRangePrice(
                    UseLangMessage('Max Price', ValidationMessage.noMore).replace(
                        '{%replaceNumber%}',
                        propertiesStore.searchComponent.rangePrice[1].toString()
                    )
                );
            }
        }
    };

    const handlerChangeMinPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorRangePrice('');
        const priceMin = e.target.value ? Number(e.target.value) : 0;
        formikSetValue('price', [priceMin, formikValues.price[1]]);
    };

    const handlerChangeMaxPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorRangePrice('');
        const priceMax = e.target.value ? Number(e.target.value) : propertiesStore.searchComponent.rangePrice[1];
        formikSetValue('price', [formikValues.price[0], priceMax]);
    };

    const handlerSliderPrice = (e: SliderChangeParams) => {
        const range = e.value as [number, number];
        setErrorRangePrice('');
        propertiesStore.setSearchComponent({
            ...propertiesStore.searchComponent,
            filters: {
                ...propertiesStore.searchComponent.filters,
                priceMin: range[0],
                priceMax: range[1],
            },
        });
        formikSetValue('price', range);
        formikSetValue('sliderPrice', range);
    };

    const onAcceptingBids = () => {
        setTimeout(() => {
            onSubmit(formikValues);
        });
    };

    const initialValues: initialValuesInterface = {
        checkIn: propertiesStore.searchComponent.filters.checkIn
            ? parse(propertiesStore.searchComponent.filters.checkIn, dateConfig.formats.dateOnlyDay, new Date())
            : null,
        checkOut: propertiesStore.searchComponent.filters.checkOut
            ? parse(propertiesStore.searchComponent.filters.checkOut, dateConfig.formats.dateOnlyDay, new Date())
            : null,
        checkInOut: initialCheckInOut(
            propertiesStore.searchComponent.filters.checkIn,
            propertiesStore.searchComponent.filters.checkOut
        ),
        guests: propertiesStore.searchComponent.filters.guests ?? null,
        acceptingBids: !!propertiesStore.searchComponent.filters.acceptingBids,
        bedRooms: propertiesStore.searchComponent.filters.bedRooms ?? null,
        bathRooms: propertiesStore.searchComponent.filters.bathRooms ?? null,
        amenities: [],
        propertyTypes: [],
        cancellationPolicy: [],
        houseRules: [],
        price: [
            propertiesStore.searchComponent.filters?.priceMin
                ? Number(propertiesStore.searchComponent.filters.priceMin)
                : Number(propertiesStore.searchComponent.rangePrice[0]),
            propertiesStore.searchComponent.filters?.priceMax
                ? Number(propertiesStore.searchComponent.filters.priceMax)
                : Number(propertiesStore.searchComponent.rangePrice[1]),
        ],
        sliderPrice: [
            propertiesStore.searchComponent.filters?.priceMin
                ? Number(propertiesStore.searchComponent.filters.priceMin)
                : Number(propertiesStore.searchComponent.rangePrice[0]),
            propertiesStore.searchComponent.filters?.priceMax
                ? Number(propertiesStore.searchComponent.filters.priceMax)
                : Number(propertiesStore.searchComponent.rangePrice[1]),
        ],
    };

    return (
        <>
            <div id="catalog-filter-section" className={classnames('affix-top', { affix: hasScrolled })}>
                <div className="container">
                    <div className="catalog-listing-filter">
                        <Formik initialValues={initialValues} onSubmit={onSubmit}>
                            {(props) => {
                                formikSetValue = props.setFieldValue;
                                formikValues = props.values;
                                return (
                                    <Form>
                                        <div className="fields mb">
                                            <div className="form-group width100 bbs-custom-dropdown">
                                                {isLoaded ? (
                                                    <PlacesAutocomplete
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
                                                                        label: 'Location',
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
                                                                                {suggestions.map((suggestion) => {
                                                                                    return (
                                                                                        <li key={suggestion.id}>
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
                                                    </PlacesAutocomplete>
                                                ) : (
                                                    <FrontInput value={''} name={'destination'} label={'Location'} />
                                                )}
                                            </div>
                                            <div className="form-group width4">
                                                <CalendarInput
                                                    label="Check-in Check-out"
                                                    className="check-in-calendar"
                                                    viewDate={viewDate}
                                                    setViewDate={setViewDate}
                                                />
                                            </div>
                                            <div className="form-group width3">
                                                <FrontInput
                                                    name="guests"
                                                    label="Guests"
                                                    value={props.values.guests ?? ''}
                                                    onChange={props.handleChange}
                                                    type={InputType.number}
                                                    min={1}
                                                    max={50}
                                                />
                                            </div>
                                            <div className="form-group buttons-group width0">
                                                <FrontButton
                                                    className={'btn-primary btn-primary_no-loading-icon'}
                                                    type={'submit'}
                                                    loading={propertiesStore.isLoading}
                                                >
                                                    <span className="icon-first fas fa-search"></span>
                                                    Search
                                                </FrontButton>
                                                {userStore.user && !userStore.isColdStart && (
                                                    <button
                                                        onClick={saveSearch}
                                                        className={'button-to-link btn btn-link save-search-button'}
                                                        type={'button'}
                                                        disabled={loadingSaveSearch || propertiesStore.isLoading}
                                                    >
                                                        <span className="icon-first far fa-save"></span>Save Search
                                                    </button>
                                                )}
                                                <button
                                                    onClick={clearFilter}
                                                    className={'button-to-link btn btn-link'}
                                                    type={'button'}
                                                    disabled={loadingSaveSearch || propertiesStore.isLoading}
                                                >
                                                    <span className="icon-first fas fa-times"></span>Clear
                                                </button>
                                            </div>
                                        </div>

                                        <div className="filters mb">
                                            <div
                                                className={`dropdown slim-dropdown bbs-custom-dropdown ${
                                                    openModalName === 'propertyType' ? 'open' : ''
                                                }`}
                                            >
                                                <button
                                                    className="dropdown-toggle"
                                                    type="button"
                                                    onClick={handlerButtonOpenModal('propertyType')}
                                                >
                                                    Property Type
                                                    {props.values.propertyTypes.length > 0 && (
                                                        <> ({props.values.propertyTypes.length})</>
                                                    )}
                                                    <span className="icon fas fa-chevron-down"></span>
                                                </button>
                                                <div className="dropdown-menu">
                                                    <OutsideClickHandler
                                                        onOutsideClick={onOutsideClick}
                                                        disabled={openModalName !== 'propertyType'}
                                                    >
                                                        <CheckboxGroup
                                                            onChange={(values) => {
                                                                const arr = values
                                                                    .filter((item) => item.checked)
                                                                    .map((item) => {
                                                                        return JSON.parse(item.name as string);
                                                                    });
                                                                props.setFieldValue('propertyTypes', arr);
                                                            }}
                                                        >
                                                            <div className="dropdown-menu__header mb-2">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <AllCheckerCheckbox />
                                                                        <span className="radio-check-control"></span>
                                                                        <span className="radio-check-label">
                                                                            Select All
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {propertyTypes.map((item) => {
                                                                return (
                                                                    <div key={item.id} className="checkbox mb">
                                                                        <label>
                                                                            <Checkbox
                                                                                name={JSON.stringify(item)}
                                                                                checked={
                                                                                    props.values.propertyTypes.findIndex(
                                                                                        (type) => type?.id === item.id
                                                                                    ) >= 0
                                                                                }
                                                                            />
                                                                            <span className="radio-check-control"></span>
                                                                            <span className="radio-check-label">
                                                                                {item.fullName}
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })}
                                                        </CheckboxGroup>
                                                    </OutsideClickHandler>
                                                </div>
                                            </div>
                                            <div
                                                id={'filter-dropdown-price'}
                                                className={`dropdown slim-dropdown bbs-custom-dropdown  ${
                                                    openModalName === 'price' ? 'open' : ''
                                                }`}
                                            >
                                                <button
                                                    className="dropdown-toggle"
                                                    type="button"
                                                    onClick={handlerButtonOpenModal('price')}
                                                >
                                                    {propertiesStore.searchComponent.filters.priceMin ||
                                                    propertiesStore.searchComponent.filters.priceMax ? (
                                                        <>
                                                            $
                                                            {propertiesStore.searchComponent.filters.priceMin ||
                                                                propertiesStore.searchComponent.rangePrice[0]}{' '}
                                                            - $
                                                            {propertiesStore.searchComponent.filters.priceMax ||
                                                                propertiesStore.searchComponent.rangePrice[1]}
                                                            {(propertiesStore.searchComponent.filters.priceMax ||
                                                                propertiesStore.searchComponent.rangePrice[1]) >=
                                                            appConfig.maxValueForSliderFilter
                                                                ? '+'
                                                                : ''}
                                                        </>
                                                    ) : (
                                                        <>Price</>
                                                    )}

                                                    <span className="icon fas fa-chevron-down"></span>
                                                </button>
                                                <div className="dropdown-menu">
                                                    <OutsideClickHandler
                                                        onOutsideClick={onOutsideClick}
                                                        disabled={openModalName !== 'price'}
                                                    >
                                                        <h2 className="h6-style">Price per night ($)</h2>
                                                        <FrontNotificationField
                                                            alertType={AlertType.danger}
                                                            message={errorRangePrice}
                                                        />
                                                        <div className="flex align-items-center flex-nowrap mb w-full">
                                                            <FrontInput
                                                                label={'Min price'}
                                                                value={props.values.price[0]}
                                                                name={'price'}
                                                                type={InputType.currency}
                                                                onBlur={handlerMinPrice}
                                                                onChange={handlerChangeMinPrice}
                                                                classWrapper={'w-full'}
                                                                min={0}
                                                                max={appConfig.maxValueForSliderFilter}
                                                                minFractionDigits={0}
                                                            />
                                                            <span className={'ml-3 mr-3'}>-</span>
                                                            <FrontInput
                                                                label={'Max price'}
                                                                value={props.values.price[1]}
                                                                name={'price'}
                                                                type={InputType.currency}
                                                                classWrapper={'w-full'}
                                                                onBlur={handlerMaxPrice}
                                                                onChange={handlerChangeMaxPrice}
                                                                max={3000}
                                                                minFractionDigits={0}
                                                                suffix={
                                                                    props.values.price[1] >=
                                                                    appConfig.maxValueForSliderFilter
                                                                        ? '+'
                                                                        : ''
                                                                }
                                                            />
                                                        </div>
                                                        <FrontRangeSlider
                                                            name={'sliderPrice'}
                                                            value={props.values.sliderPrice}
                                                            min={
                                                                props.values.sliderPrice[0] >
                                                                propertiesStore.searchComponent.rangePrice[0]
                                                                    ? propertiesStore.searchComponent.rangePrice[0]
                                                                    : props.values.sliderPrice[0]
                                                            }
                                                            max={
                                                                props.values.sliderPrice[1] >
                                                                propertiesStore.searchComponent.rangePrice[1]
                                                                    ? props.values.sliderPrice[1]
                                                                    : propertiesStore.searchComponent.rangePrice[1]
                                                            }
                                                            onChange={handlerSliderPrice}
                                                        />
                                                    </OutsideClickHandler>
                                                </div>
                                            </div>
                                            <div
                                                id={'filter-dropdown-beds'}
                                                className={`dropdown slim-dropdown bbs-custom-dropdown  ${
                                                    openModalName === 'bedAndBath' ? 'open' : ''
                                                }`}
                                            >
                                                <button
                                                    className="dropdown-toggle"
                                                    type="button"
                                                    onClick={handlerButtonOpenModal('bedAndBath')}
                                                >
                                                    Beds
                                                    {props.values.bedRooms && props.values.bedRooms > 0 ? (
                                                        <> ({props.values.bedRooms})</>
                                                    ) : (
                                                        ''
                                                    )}{' '}
                                                    &amp; Baths
                                                    {props.values.bathRooms && props.values.bathRooms > 0 ? (
                                                        <> ({props.values.bathRooms})</>
                                                    ) : (
                                                        ''
                                                    )}
                                                    <span className="icon fas fa-chevron-down"></span>
                                                </button>
                                                <div className="dropdown-menu">
                                                    <OutsideClickHandler
                                                        onOutsideClick={onOutsideClick}
                                                        disabled={openModalName !== 'bedAndBath'}
                                                    >
                                                        <h2 className="h6-style">Beds &amp; Baths</h2>
                                                        <div className="row" style={{ marginTop: '-0.5rem' }}>
                                                            <div className="flex align-items-center flex-nowrap col-12">
                                                                <FrontInput
                                                                    name={'bedRooms'}
                                                                    value={props.values.bedRooms ?? ''}
                                                                    onChange={props.handleChange}
                                                                    type={InputType.number}
                                                                    usePrimereact={true}
                                                                    label={'Bedrooms'}
                                                                    classWrapper={'mr-2 w-full'}
                                                                    min={0}
                                                                    max={50}
                                                                />
                                                                <div className="flex align-items-center flex-nowrap">
                                                                    <button
                                                                        type={'button'}
                                                                        onClick={() => {
                                                                            props.setFieldValue(
                                                                                'bedRooms',
                                                                                Number(props.values.bedRooms) < 50
                                                                                    ? Number(props.values.bedRooms) + 1
                                                                                    : Number(props.values.bedRooms)
                                                                            );
                                                                        }}
                                                                        className={
                                                                            'button-change-quantity button-change-quantity_plus mr-2'
                                                                        }
                                                                    >
                                                                        <span className="icon fas fa-plus"></span>
                                                                        <span className={'display-none'}>+</span>
                                                                    </button>
                                                                    <button
                                                                        type={'button'}
                                                                        onClick={() => {
                                                                            Number(props.values.bedRooms) - 1 >= 0 &&
                                                                                props.setFieldValue(
                                                                                    'bedRooms',
                                                                                    Number(props.values.bedRooms) - 1
                                                                                );
                                                                        }}
                                                                        className={
                                                                            'button-change-quantity button-change-quantity_minus'
                                                                        }
                                                                    >
                                                                        <span className="icon fas fa-minus"></span>
                                                                        <span className={'display-none'}>-</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="flex align-items-center flex-nowrap col-12">
                                                                <FrontInput
                                                                    name={'bathRooms'}
                                                                    value={props.values.bathRooms ?? ''}
                                                                    onChange={props.handleChange}
                                                                    type={InputType.number}
                                                                    usePrimereact={true}
                                                                    label={'Bathrooms'}
                                                                    classWrapper={'mr-2 w-full'}
                                                                    min={0}
                                                                    max={50}
                                                                />

                                                                <div className="flex align-items-center flex-nowrap">
                                                                    <button
                                                                        type={'button'}
                                                                        onClick={() => {
                                                                            props.setFieldValue(
                                                                                'bathRooms',
                                                                                Number(props.values.bathRooms) < 50
                                                                                    ? Number(props.values.bathRooms) + 1
                                                                                    : Number(props.values.bathRooms)
                                                                            );
                                                                        }}
                                                                        className={
                                                                            'button-change-quantity button-change-quantity_plus mr-2'
                                                                        }
                                                                    >
                                                                        <span className="icon fas fa-plus"></span>
                                                                        <span className={'display-none'}>+</span>
                                                                    </button>
                                                                    <button
                                                                        type={'button'}
                                                                        onClick={() => {
                                                                            Number(props.values.bathRooms) - 1 >= 0 &&
                                                                                props.setFieldValue(
                                                                                    'bathRooms',
                                                                                    Number(props.values.bathRooms) - 1
                                                                                );
                                                                        }}
                                                                        className={
                                                                            'button-change-quantity button-change-quantity_minus'
                                                                        }
                                                                    >
                                                                        <span className="icon fas fa-minus"></span>
                                                                        <span className={'display-none'}>-</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </OutsideClickHandler>
                                                </div>
                                            </div>

                                            <div
                                                className={`dropdown slim-dropdown  bbs-custom-dropdown ${
                                                    openModalName === 'cancellationPolicy' ? 'open' : ''
                                                }`}
                                            >
                                                <button
                                                    className="dropdown-toggle"
                                                    type="button"
                                                    onClick={handlerButtonOpenModal('cancellationPolicy')}
                                                >
                                                    Cancellation Policy
                                                    {props.values.cancellationPolicy.length > 0 && (
                                                        <> ({props.values.cancellationPolicy.length})</>
                                                    )}
                                                    <span className="icon fas fa-chevron-down"></span>
                                                </button>
                                                <div className="dropdown-menu">
                                                    <OutsideClickHandler
                                                        onOutsideClick={onOutsideClick}
                                                        disabled={openModalName !== 'cancellationPolicy'}
                                                    >
                                                        <CheckboxGroup
                                                            onChange={(values) => {
                                                                const arr = values
                                                                    .filter((item) => item.checked)
                                                                    .map((item) => {
                                                                        return JSON.parse(item.name as string);
                                                                    });
                                                                props.setFieldValue('cancellationPolicy', arr);
                                                            }}
                                                        >
                                                            <div className="dropdown-menu__header mb-2">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <AllCheckerCheckbox />
                                                                        <span className="radio-check-control"></span>
                                                                        <span className="radio-check-label">
                                                                            Select All
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {cancellationPolicies.map((item) => {
                                                                return (
                                                                    <div key={item.id} className="checkbox mb">
                                                                        <label>
                                                                            <Checkbox
                                                                                name={JSON.stringify(item)}
                                                                                checked={
                                                                                    props.values.cancellationPolicy.findIndex(
                                                                                        (type) => type?.id === item.id
                                                                                    ) >= 0
                                                                                }
                                                                            />
                                                                            <span className="radio-check-control"></span>
                                                                            <span className="radio-check-label">
                                                                                {item.fullName}
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })}
                                                        </CheckboxGroup>
                                                    </OutsideClickHandler>
                                                </div>
                                            </div>

                                            <button
                                                type={'button'}
                                                className="button-to-link more-filters-link"
                                                onClick={handlerButtonOpenModal('allFilters')}
                                            >
                                                More Filters
                                                {countAmenities(props.values.amenities) > 0 && (
                                                    <> ({countAmenities(props.values.amenities)})</>
                                                )}
                                            </button>
                                        </div>

                                        {props.values.checkInOut &&
                                        props.values.checkInOut[0] &&
                                        props.values.checkInOut[1] ? (
                                            <div className="checkbox mb">
                                                <label onClick={onAcceptingBids}>
                                                    <Field type="checkbox" name="acceptingBids" />
                                                    <span className="radio-check-control"></span>
                                                    <span className="radio-check-label">Accepting bids</span>
                                                </label>
                                            </div>
                                        ) : null}

                                        <AllFiltersModal
                                            isOpenModal={openModalName === 'allFilters'}
                                            closeModal={onOutsideClick}
                                            props={props}
                                            arrGroupAmenities={arrGroupAmenities}
                                            propertyTypes={propertyTypes}
                                            cancellationPolicies={cancellationPolicies}
                                            onSubmit={onSubmit}
                                        />
                                    </Form>
                                );
                            }}
                        </Formik>
                    </div>
                </div>
            </div>
        </>
    );
});

export default PropertyListFilterSection;
