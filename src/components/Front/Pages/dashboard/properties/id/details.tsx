import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../store';
import { FrontButton } from '../../../../Global/button';
import { Property } from '../../../../../../models/api/property';
import { DictionaryCode } from '../../../../../../models/api';
import * as Yup from 'yup';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import FrontInput, { InputType } from '../../../../Global/input';
import { Element } from 'react-scroll';
import { FrontDropdown } from '../../../../Global/dropdown';
import FrontTreeSelect, { TreeSelectSelectionMode } from '../../../../Global/treeSelect';
import { TreeSelectSelectionKeys } from 'primereact/treeselect';
import FrontSwitchWithLabel from '../../../../Global/switchWithLabel';
import { Calendar } from 'primereact/calendar';
import format from 'date-fns/format';
import { dateConfig } from '../../../../../../config/date';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import { zonedTimeToUtc } from 'date-fns-tz';

interface initialValuesInterface {
    numberOfGuests: number | null;
    bathrooms: number | null;
    maxGuests: number | null;
    smokingAllowed: string;
    eventsAllowed: string;
    petsAllowed: string;
    checkIn: Date | null;
    checkOut: Date | null;
    additionalRules: string;
    minimumNightStay: number | null;
    maximumNightStay: number | null;
    propertyTypeId: number | null;
    neighborhoodTypeId: number | null;
    propertyAmenities: TreeSelectSelectionKeys;
    propertyBedroomsApply: {
        quantity: number;
        items: { bedType: number; quantity: number }[];
    };
}

interface Props {
    property: Property;
}

const PropertySectionDetailsForm: FunctionComponent<Props> = observer(({ property }) => {
    let error: string | null = '';
    const setError = (err: string | null) => (error = err);

    const minNightStayRef = useRef<HTMLInputElement>(null);
    const [onlyRead, setOnlyRead] = useState(true);
    const { dictionaryStore, propertiesStore, userStore, globalStore } = useStores();

    const calendarCheckInRef = useRef<Calendar>(null);
    const calendarCheckOutRef = useRef<Calendar>(null);

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    const propertyTypes = dictionaryStore.getDictionary(DictionaryCode.propertyTypes);
    const neighborhoodTypes = dictionaryStore.getDictionary(DictionaryCode.neighborhoodTypes);
    const bedTypes = dictionaryStore.getDictionary(DictionaryCode.bedTypes);
    let amenities = dictionaryStore.getDictionary(DictionaryCode.amenities);

    let i = 0;
    const bedroomsType = Array.from(Array(50), () => {
        i = i + 1;
        return i;
    });

    let b = 0;
    const bedQuantity = Array.from(Array(20), () => {
        b = b + 1;
        return b;
    });

    const arrGroupAmenities: any[] = [];
    amenities.forEach((item) => {
        if (item.relatedTo === null) {
            arrGroupAmenities.push({
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
                key: item.id,
                label: item.fullName,
                children: [],
            });
        }
    });

    const activeForm = () => setOnlyRead(false);
    const resetForm = (props: FormikProps<initialValuesInterface>) =>
        function () {
            setOnlyRead(true);
            props.resetForm();
            setError(null);
        };

    const onSubmit = async (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        for (const key in props) {
            // @ts-ignore
            if (typeof props[key] === 'string' && props[key].length === 0) {
                // @ts-ignore
                props[key] = null;
            }
        }
        let amenitiesApply: string[] = [];
        if (props.propertyAmenities && typeof props.propertyAmenities === 'object') {
            let arrKeys = Object.keys(props.propertyAmenities);
            amenitiesApply = arrKeys.filter(
                (amenityId) => amenities.find((item) => item.id === Number(amenityId))?.relatedTo !== null
            );
        }
        const bedroomsApply = props.propertyBedroomsApply.items.splice(0, props.propertyBedroomsApply.quantity);
        try {
            await propertiesStore.updateItem(
                {
                    id: property.id,
                    ...props,
                    checkIn: props.checkIn ? zonedTimeToUtc(props.checkIn, dateConfig.defaultTimeZone) : null,
                    checkOut: props.checkOut ? zonedTimeToUtc(props.checkOut, dateConfig.defaultTimeZone) : null,
                    propertyAmenitiesApply: amenitiesApply,
                    propertyBedroomsApply: { quantity: props.propertyBedroomsApply.quantity, items: bedroomsApply },
                },
                false,
                true,
                true,
                true
            );
            userStore.properties.isFetched = false;
            userStore.isFetched = false;
            globalStore.showToast({
                severity: 'success',
                detail: 'The property`s details have been updated',
            });
            setOnlyRead(true);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            }
        }

        formikHelpers.setSubmitting(false);
    };

    const obAmenities: TreeSelectSelectionKeys = {};

    property.amenities.forEach((amenity) => {
        obAmenities[amenity.id] = { checked: true, partialChecked: false };
        obAmenities[amenity.relatedTo] = { checked: true, partialChecked: false };
    });

    arrGroupAmenities.forEach((parent) => {
        const childrenQuantity = parent.children.length;
        const childrenQuantityActual = property.amenities.filter(
            (children) => children.relatedTo === parent.key
        ).length;
        if (childrenQuantity > childrenQuantityActual && childrenQuantityActual > 0) {
            obAmenities[parent.key] = { checked: true, partialChecked: true };
        }
    });

    const obBedroomItems: { bedType: number; quantity: number }[] = [];
    property.propertyBedrooms?.forEach((bedroom) => {
        obBedroomItems.push({ bedType: bedroom.dictionaryValueId!, quantity: bedroom.value! });
    });

    const initialValues: initialValuesInterface = {
        numberOfGuests: property.numberOfGuests ?? null,
        bathrooms: property.bathrooms ?? null,
        maxGuests: property.maxGuests,
        smokingAllowed: property.smokingAllowed ? 'true' : 'false',
        eventsAllowed: property.eventsAllowed ? 'true' : 'false',
        petsAllowed: property.petsAllowed ? 'true' : 'false',
        checkIn: property.checkIn ? utcToZonedTime(new Date(property.checkIn), dateConfig.defaultTimeZone) : null,
        checkOut: property.checkOut ? utcToZonedTime(new Date(property.checkOut), dateConfig.defaultTimeZone) : null,
        additionalRules: property.additionalRules ?? '',
        minimumNightStay: property.minimumNightStay ?? null,
        maximumNightStay: property.maximumNightStay ?? null,
        propertyTypeId: property.propertyType?.id ?? null,
        neighborhoodTypeId: property.neighborhoodType?.id ?? null,
        propertyAmenities: obAmenities,
        propertyBedroomsApply: {
            quantity:
                property.propertyBedrooms && property.propertyBedrooms.length > 0
                    ? property.propertyBedrooms.length
                    : 1,
            items: obBedroomItems ?? [],
        },
    };

    const validationSchema = Yup.object().shape({
        propertyTypeId: Yup.mixed().test(
            'empty',
            UseLangMessage('Property Type', ValidationMessage.requiredFront),
            (value) => {
                return !!value;
            }
        ),
        checkIn: Yup.mixed().test(
            'empty',
            UseLangMessage('Check-in Times', ValidationMessage.requiredFront),
            (value) => {
                return !!value;
            }
        ),
        checkOut: Yup.mixed().test(
            'empty',
            UseLangMessage('Check-out Times', ValidationMessage.requiredFront),
            (value) => {
                return !!value;
            }
        ),
        propertyBedroomsApply: Yup.mixed()
            .test(
                'emptyness',
                UseLangMessage('Bed Type', ValidationMessage.requiredFront),
                (value: typeof initialValues.propertyBedroomsApply) => {
                    const emptyForm = value.items.find((item) => !item.bedType);

                    return value.quantity >= value.items.length ? emptyForm === undefined : true;
                }
            )
            .test(
                'emptyness',
                UseLangMessage('Quantity', ValidationMessage.requiredFront),
                (value: typeof initialValues.propertyBedroomsApply) => {
                    const emptyForm = value.items.find((item) => !item.quantity);
                    return value.quantity >= value.items.length ? emptyForm === undefined : true;
                }
            )
            .test(
                'emptyness',
                UseLangMessage('Bedrooms', ValidationMessage.invalid),
                (value: typeof initialValues.propertyBedroomsApply) => {
                    return value.quantity <= value.items.length;
                }
            ),
        minimumNightStay: Yup.mixed()
            .test(
                'min',
                UseLangMessage('Minimum Night Stay', ValidationMessage.noLess).replace('{%replaceNumber%}', '1 night'),
                (value) => {
                    if (!value) return true;
                    return Number(value) >= 1;
                }
            )
            .test(
                'max',
                UseLangMessage('Minimum Night Stay', ValidationMessage.noMore).replace(
                    '{%replaceNumber%}',
                    '999 nights'
                ),
                (value) => {
                    if (!value) return true;
                    return Number(value) <= 999;
                }
            ),
        maximumNightStay: Yup.mixed()
            .test(
                'min',
                UseLangMessage('Maximum Night Stay', ValidationMessage.noLess).replace('{%replaceNumber%}', '1 night'),
                (value) => {
                    if (!value) return true;
                    return Number(value) >= 1;
                }
            )
            .test(
                'max',
                UseLangMessage('Maximum Night Stay', ValidationMessage.noMore).replace(
                    '{%replaceNumber%}',
                    '999 nights'
                ),
                (value) => {
                    if (!value) return true;
                    return Number(value) <= 999;
                }
            )
            .test('more', '"Maximum Night Stay" must be more than "Minimum Night Stay"', (value) => {
                if (!value || !minNightStayRef?.current?.value) return true;
                return value >= Number(minNightStayRef.current.value);
            }),
        bathrooms: Yup.mixed()
            .test(
                'max',
                UseLangMessage('Bathrooms', ValidationMessage.noMore).replace('{%replaceNumber%}', '50 bathrooms'),
                (value) => {
                    if (!value) return true;
                    return Number(value) <= 50;
                }
            )
            .test(
                'max',
                UseLangMessage('Bathrooms', ValidationMessage.noLess).replace('{%replaceNumber%}', '1 bathroom'),
                (value) => {
                    if (!value) return true;
                    return Number(value) >= 1;
                }
            )
            .required(UseLangMessage('Bathrooms', ValidationMessage.requiredFront)),
        numberOfGuests: Yup.mixed()
            .test(
                'max',
                UseLangMessage('Number of Guests', ValidationMessage.noMore).replace('{%replaceNumber%}', '50 guests'),
                (value) => {
                    if (!value) return true;
                    return Number(value) <= 50;
                }
            )
            .test(
                'max',
                UseLangMessage('Number of Guests', ValidationMessage.noLess).replace('{%replaceNumber%}', '1 guest'),
                (value) => {
                    if (!value) return true;
                    return Number(value) >= 1;
                }
            )
            .required(UseLangMessage('Number of Guests', ValidationMessage.requiredFront)),
        maxGuests: Yup.mixed()
            .test(
                'max',
                UseLangMessage('Max-Guests', ValidationMessage.noMore).replace('{%replaceNumber%}', '50 guests'),
                (value) => {
                    if (!value) return true;
                    return Number(value) <= 50;
                }
            )
            .test(
                'max',
                UseLangMessage('Max-Guests', ValidationMessage.noLess).replace('{%replaceNumber%}', '1 guest'),
                (value) => {
                    if (!value) return true;
                    return Number(value) >= 1;
                }
            ),
    });

    const bedroomsListing = (quantity: number, props: any) => {
        return Array.from(Array(quantity)).map((value, index) => {
            return (
                <div className="item" key={index}>
                    <div className="bedroom-number big">#{index + 1}</div>
                    <div className="form-group">
                        <FrontDropdown
                            optionValue={'id'}
                            optionLabel={'fullName'}
                            label={'Type of Bed'}
                            id={`bedType_${index}`}
                            value={props.values.propertyBedroomsApply.items[index]?.bedType}
                            options={bedTypes}
                            handlerDropdown={props.handleChange}
                            name={`propertyBedroomsApply[items[${index}].bedType]`}
                            readOnly={onlyRead}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <FrontDropdown
                            label={'Quantity'}
                            id={`bedQuantity_${index}`}
                            value={props.values.propertyBedroomsApply.items[index]?.quantity}
                            options={bedQuantity}
                            handlerDropdown={props.handleChange}
                            name={`propertyBedroomsApply[items[${index}].quantity]`}
                            readOnly={onlyRead}
                            classNameDropdown={'dropdown-min-width'}
                            required
                        />
                    </div>
                </div>
            );
        });
    };

    const handlerButton = () => {
        setTimeout(() => {
            if (error?.length) {
                scrollToElement('scrollToForm2');
            }
        }, 100);
    };

    const handlerTreeSelect = (e: any, props: FormikProps<initialValuesInterface>) => {
        props.handleChange(e);
    };

    const onFocusTimePicker = (ref: RefObject<Calendar>) => {
        return () => !onlyRead && ref.current?.show();
    };
    const onBlurTimePicker = (ref: RefObject<Calendar>) => {
        return () => ref.current?.hide();
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            enableReinitialize={true}
            validateOnChange={false}
            validationSchema={validationSchema}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setError);
                return (
                    <>
                        <Form method="post">
                            <Element name="scrollToForm2"></Element>
                            <FrontNotificationField alertType={AlertType.danger} message={error} />
                            <div className="form-wrap">
                                <div className="grey-block">
                                    <h3 className="h5-style">Details</h3>
                                    <div className="row mb">
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontDropdown
                                                    optionValue={'id'}
                                                    optionLabel="fullName"
                                                    label={'Type'}
                                                    id={'propertyTypeId'}
                                                    value={props.values.propertyTypeId ?? ''}
                                                    options={propertyTypes}
                                                    handlerDropdown={props.handleChange}
                                                    name={'propertyTypeId'}
                                                    readOnly={onlyRead}
                                                    required={true}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontDropdown
                                                    optionValue={'id'}
                                                    optionLabel="fullName"
                                                    label={'Neighborhood / Area Description'}
                                                    id={'neighborhoodTypeId'}
                                                    value={props.values.neighborhoodTypeId ?? ''}
                                                    options={neighborhoodTypes}
                                                    handlerDropdown={props.handleChange}
                                                    name={'neighborhoodTypeId'}
                                                    readOnly={onlyRead}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Number of Guests'}
                                                    value={props.values.numberOfGuests ?? ''}
                                                    type={InputType.number}
                                                    name={'numberOfGuests'}
                                                    onChange={props.handleChange}
                                                    readOnly={onlyRead}
                                                    min={1}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Bathrooms'}
                                                    value={props.values.bathrooms ?? ''}
                                                    type={InputType.number}
                                                    name={'bathrooms'}
                                                    onChange={props.handleChange}
                                                    readOnly={onlyRead}
                                                    min={1}
                                                    required={true}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Minimum Night Stay'}
                                                    value={props.values.minimumNightStay ?? ''}
                                                    type={InputType.number}
                                                    name={'minimumNightStay'}
                                                    onChange={props.handleChange}
                                                    readOnly={onlyRead}
                                                    inputRef={minNightStayRef}
                                                    min={1}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Maximum Night Stay'}
                                                    value={props.values.maximumNightStay ?? ''}
                                                    type={InputType.number}
                                                    name={'maximumNightStay'}
                                                    onChange={props.handleChange}
                                                    readOnly={onlyRead}
                                                    min={1}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-sm-12 mb-xs">
                                            <div className="form-group">
                                                <FrontTreeSelect
                                                    name={'propertyAmenities'}
                                                    label={'Amenities'}
                                                    id={'propertyAmenities'}
                                                    options={arrGroupAmenities}
                                                    value={props.values.propertyAmenities}
                                                    handlerTreeSelect={(e) => handlerTreeSelect(e, props)}
                                                    selectionMode={TreeSelectSelectionMode.checkbox}
                                                    readOnly={onlyRead}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-wrap">
                                <h3 className="h5-style">Bedrooms</h3>
                                <div className="row">
                                    <div className="col-lg-2 col-md-3 col-sm-3 mb-xs">
                                        <div className="form-group">
                                            <FrontDropdown
                                                label={'Bedrooms'}
                                                id={'propertyTypeId'}
                                                value={props.values.propertyBedroomsApply.quantity ?? ''}
                                                options={bedroomsType}
                                                handlerDropdown={props.handleChange}
                                                name={'propertyBedroomsApply[quantity]'}
                                                readOnly={onlyRead}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-10 col-md-9 col-sm-9">
                                        <div className="bedrooms-listing">
                                            {bedroomsListing(props.values.propertyBedroomsApply.quantity, props)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-wrap">
                                <h3 className="h5-style">House Rules / Policies</h3>
                                <div className="row mb">
                                    <div className="col-sm-6 mb-xs">
                                        <div className="form-group">
                                            <FrontInput
                                                label={'Max-Guests'}
                                                value={props.values.maxGuests ?? ''}
                                                type={InputType.number}
                                                name={'maxGuests'}
                                                onChange={props.handleChange}
                                                readOnly={onlyRead}
                                                min={1}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6 mb">
                                        <div className="row">
                                            <div className="col-sm-6 mb-xs">
                                                <div className="form-group">
                                                    <Calendar
                                                        ref={calendarCheckInRef}
                                                        timeOnly={true}
                                                        name={'checkIn'}
                                                        onChange={props.handleChange}
                                                        className="p-calendar_hidden"
                                                        hourFormat={'12'}
                                                        value={props.values.checkIn ?? undefined}
                                                    />
                                                    <FrontInput
                                                        label={'Check-in Times'}
                                                        value={
                                                            props.values.checkIn
                                                                ? format(
                                                                      props.values.checkIn,
                                                                      dateConfig.formats.onlyTime
                                                                  )
                                                                : ''
                                                        }
                                                        name={'checkIn'}
                                                        readOnly={onlyRead}
                                                        autocomplete={false}
                                                        onFocus={onFocusTimePicker(calendarCheckInRef)}
                                                        onBlur={onBlurTimePicker(calendarCheckInRef)}
                                                        required={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb-xs">
                                                <div className="form-group">
                                                    <Calendar
                                                        ref={calendarCheckOutRef}
                                                        timeOnly={true}
                                                        name={'checkOut'}
                                                        onChange={props.handleChange}
                                                        className="p-calendar_hidden"
                                                        hourFormat={'12'}
                                                        value={props.values.checkOut ?? undefined}
                                                    />
                                                    <FrontInput
                                                        label={'Check-out Times'}
                                                        value={
                                                            props.values.checkOut
                                                                ? format(
                                                                      props.values.checkOut,
                                                                      dateConfig.formats.onlyTime
                                                                  )
                                                                : ''
                                                        }
                                                        name={'checkOut'}
                                                        readOnly={onlyRead}
                                                        autocomplete={false}
                                                        onFocus={onFocusTimePicker(calendarCheckOutRef)}
                                                        onBlur={onBlurTimePicker(calendarCheckOutRef)}
                                                        required={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb">
                                    <div className="col-sm mb-xs mb">
                                        <div className="form-group">
                                            <FrontSwitchWithLabel
                                                mainLabel={'Smoking Allowed'}
                                                onChange={props.handleChange}
                                                value1={'true'}
                                                value2={'false'}
                                                name={'smokingAllowed'}
                                                checked1={props.values.smokingAllowed === 'true'}
                                                checked2={props.values.smokingAllowed === 'false'}
                                                label1={'Yes'}
                                                label2={'No'}
                                                readOnly={onlyRead}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm mb-xs mb">
                                        <div className="form-group">
                                            <FrontSwitchWithLabel
                                                mainLabel={'Events Allowed'}
                                                onChange={props.handleChange}
                                                value1={'true'}
                                                value2={'false'}
                                                name={'eventsAllowed'}
                                                checked1={props.values.eventsAllowed === 'true'}
                                                checked2={props.values.eventsAllowed === 'false'}
                                                label1={'Yes'}
                                                label2={'No'}
                                                readOnly={onlyRead}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm mb-xs mb">
                                        <div className="form-group">
                                            <FrontSwitchWithLabel
                                                mainLabel={'Pets Allowed'}
                                                onChange={props.handleChange}
                                                value1={'true'}
                                                value2={'false'}
                                                name={'petsAllowed'}
                                                checked1={props.values.petsAllowed === 'true'}
                                                checked2={props.values.petsAllowed === 'false'}
                                                label1={'Yes'}
                                                label2={'No'}
                                                readOnly={onlyRead}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb">
                                    <div className="col-sm-12 mb-xs">
                                        <div className="form-group">
                                            <FrontInput
                                                label={'Additional House Rules'}
                                                value={props.values.additionalRules ?? ''}
                                                name={'additionalRules'}
                                                onChange={props.handleChange}
                                                type={InputType.textarea}
                                                readOnly={onlyRead}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-footer has-border-top">
                                {onlyRead ? (
                                    <FrontButton className={'btn-primary'} type={'button'} onClick={activeForm}>
                                        Edit information
                                    </FrontButton>
                                ) : (
                                    <>
                                        <div>
                                            <FrontButton
                                                className={'btn-primary'}
                                                type={'submit'}
                                                loading={props.isSubmitting}
                                                onClick={handlerButton}
                                            >
                                                SAVE CHANGES
                                            </FrontButton>
                                        </div>
                                        <div>
                                            <FrontButton
                                                className={'btn-border'}
                                                type={'button'}
                                                onClick={resetForm(props)}
                                            >
                                                CANCEL
                                            </FrontButton>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Form>
                    </>
                );
            }}
        </Formik>
    );
});
export default PropertySectionDetailsForm;
