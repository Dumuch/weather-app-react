import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { isImageFile, scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { Element } from 'react-scroll';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { useStores } from '../../../../../../store';
import { DictionaryCode } from '../../../../../../models/api';
import { observer } from 'mobx-react-lite';
import FrontInput, { InputType } from '../../../../Global/input';
import { FrontButton } from '../../../../Global/button';
import { FileUpload } from 'primereact/fileupload';
import FrontUploadFiles from '../../../../Global/uploadFiles';
import FrontTreeSelect, { TreeSelectSelectionMode } from '../../../../Global/treeSelect';
import { FrontDropdown } from '../../../../Global/dropdown';
import FrontSwitchWithLabel from '../../../../Global/switchWithLabel';
import bytes from 'bytes';
import { File as FileValidation } from '../../../../../../config/validate';
import { Calendar } from 'primereact/calendar';
import format from 'date-fns/format';
import { dateConfig } from '../../../../../../config/date';
import { zonedTimeToUtc } from 'date-fns-tz';
import CancellationPolicyModal from '../../../../Global/modals/cancellationPolicyModal';

interface initialValuesInterface {
    numberOfGuests: string;
    bathrooms: string;
    maxGuests: string;
    smokingAllowed: string;
    eventsAllowed: string;
    petsAllowed: string;
    checkIn: Date | null;
    checkOut: Date | null;
    additionalRules: string;
    minimumNightStay: string;
    maximumNightStay: string;
    propertyTypeId: string;
    neighborhoodTypeId: string;
    securityDeposit: string;
    cleaningFee: string;
    additionalFees: string;
    taxRate: string;
    reservationApprovalRequired: string;
    rentalNoticeDays: string;
    cancellationPolicyId: string;
    propertyAmenities: any[];
    propertyBedrooms: {
        quantity: number;
        items: { bedType: string; quantity: number }[];
    };
    propertyPhotos: File[];
}

interface Props {
    style: object;
    setObProperty: (values: object) => void;
    previousStep: () => void;
}

const DashboardPropertiesCreateSectionStep2: FunctionComponent<Props> = observer(
    ({ style, setObProperty, previousStep }) => {
        let error: string | null = '';
        const setError = (err: string | null) => (error = err);
        const [errorFileUpload, setErrorFileUpload] = useState<string | null>(null);
        const [cancellationPolicyModal, setCancellationPolicyModal] = useState(false);

        const frontUploadFilesRef = useRef<FileUpload>(null);
        const minNightStayRef = useRef<HTMLInputElement>(null);
        const maxNightStayRef = useRef<HTMLInputElement>(null);

        const calendarCheckInRef = useRef<Calendar>(null);
        const calendarCheckOutRef = useRef<Calendar>(null);

        const { dictionaryStore } = useStores();

        useEffect(() => {
            dictionaryStore.fetchList();
        }, [dictionaryStore, dictionaryStore.isLoading]);

        const propertyTypes = dictionaryStore.getDictionary(DictionaryCode.propertyTypes);
        const neighborhoodTypes = dictionaryStore.getDictionary(DictionaryCode.neighborhoodTypes);
        const cancellationPolicies = dictionaryStore.getDictionary(DictionaryCode.cancellationPolicies, true, 'order');
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

        const uploadFiles = (files: File[], props: FormikProps<initialValuesInterface>) => {
            let _totalSize = 0;
            Object.values(files as File[]).forEach((file) => {
                _totalSize += file.size;
            });
            if (_totalSize > bytes(`${FileValidation.maxUploadFileKB}KB`)) {
                setErrorFileUpload('Exceeding the maximum size of uploaded files');
            }
            props.values.propertyPhotos = files;
        };

        const handlerErrorFileUpload = (file: File | null) => {
            if (file && file.size > bytes(`${FileValidation.maxUploadFileKB}KB`)) {
                setErrorFileUpload(
                    `"${file.name}" cannot be uploaded. Max file size ${bytes(
                        bytes(FileValidation.maxUploadFileKB + 'KB')
                    )}`
                );
            } else if (file && !isImageFile(file)) {
                setError('Only images can be uploaded');
            } else {
                setErrorFileUpload(null);
            }
        };

        const onSubmit = async (
            props: initialValuesInterface,
            formikHelpers: FormikHelpers<initialValuesInterface>
        ) => {
            setError(null);
            setErrorFileUpload(null);
            props.checkIn = props.checkIn ? zonedTimeToUtc(props.checkIn, dateConfig.defaultTimeZone) : null;
            props.checkOut = props.checkOut ? zonedTimeToUtc(props.checkOut, dateConfig.defaultTimeZone) : null;

            frontUploadFilesRef.current?.upload();
            if (!error) {
                let amenitiesApply = Object.keys(props.propertyAmenities);
                amenitiesApply = amenitiesApply.filter(
                    (amenityId) => amenities.find((item) => item.id === Number(amenityId))?.relatedTo !== null
                );
                setObProperty({ ...props, propertyAmenities: amenitiesApply });
            }
            formikHelpers.setSubmitting(false);
        };

        const initialValues: initialValuesInterface = {
            numberOfGuests: '',
            bathrooms: '',
            maxGuests: '',
            smokingAllowed: 'false',
            eventsAllowed: 'false',
            petsAllowed: 'false',
            checkIn: null,
            checkOut: null,
            additionalRules: '',
            minimumNightStay: '',
            maximumNightStay: '',
            propertyTypeId: '',
            neighborhoodTypeId: '',
            securityDeposit: '',
            cleaningFee: '',
            additionalFees: '',
            taxRate: '',
            reservationApprovalRequired: 'true',
            rentalNoticeDays: '',
            cancellationPolicyId: '',
            propertyAmenities: [],
            propertyBedrooms: {
                quantity: 1,
                items: [],
            },
            propertyPhotos: [],
        };
        const validationSchema = Yup.object().shape({
            propertyTypeId: Yup.mixed().test(
                'empty',
                UseLangMessage('Property Type', ValidationMessage.requiredFront),
                (value) => {
                    return !!value;
                }
            ),
            numberOfGuests: Yup.string()
                .test(
                    'max',
                    UseLangMessage('Number of Guests', ValidationMessage.noMore).replace(
                        '{%replaceNumber%}',
                        '50 guests'
                    ),
                    (value) => {
                        if (!value) return true;
                        return Number(value) <= 50;
                    }
                )
                .test(
                    'max',
                    UseLangMessage('Number of Guests', ValidationMessage.noLess).replace(
                        '{%replaceNumber%}',
                        '1 guest'
                    ),
                    (value) => {
                        if (!value) return true;
                        return Number(value) >= 1;
                    }
                )
                .matches(/^(?:\s|^)\d+(?=\s|$)/, 'Number of Guests" - Only whole numbers!')
                .required(UseLangMessage('Number of Guests', ValidationMessage.requiredFront)),
            bathrooms: Yup.string()
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
                .matches(/^(?:\s|^)\d+(?=\s|$)/, 'Bathrooms" - Only whole numbers!')
                .required(UseLangMessage('Bathrooms', ValidationMessage.requiredFront)),
            minimumNightStay: Yup.number()
                .test(
                    'min',
                    UseLangMessage('Minimum Night Stay', ValidationMessage.noLess).replace(
                        '{%replaceNumber%}',
                        '1 night'
                    ),
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
            maximumNightStay: Yup.number()
                .test(
                    'min',
                    UseLangMessage('Maximum Night Stay', ValidationMessage.noLess).replace(
                        '{%replaceNumber%}',
                        '1 night'
                    ),
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
            propertyBedrooms: Yup.mixed()
                .test(
                    'emptyness',
                    UseLangMessage('Bed Type', ValidationMessage.requiredFront),
                    (value: typeof initialValues.propertyBedrooms) => {
                        const emptyForm = value.items.find((item) => !item.bedType);

                        return value.quantity >= value.items.length ? emptyForm === undefined : true;
                    }
                )
                .test(
                    'emptyness',
                    UseLangMessage('Quantity', ValidationMessage.requiredFront),
                    (value: typeof initialValues.propertyBedrooms) => {
                        const emptyForm = value.items.find((item) => !item.quantity);
                        return value.quantity >= value.items.length ? emptyForm === undefined : true;
                    }
                )
                .test(
                    'emptyness',
                    UseLangMessage('Bedrooms', ValidationMessage.invalid),
                    (value: typeof initialValues.propertyBedrooms) => {
                        return value.quantity <= value.items.length;
                    }
                ),
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
            cancellationPolicyId: Yup.mixed().test(
                'empty',
                UseLangMessage('Cancellation policy', ValidationMessage.requiredFront),
                (value) => {
                    return !!value;
                }
            ),

            rentalNoticeDays: Yup.mixed()
                .required(
                    UseLangMessage(
                        'How many days in advance do you need for a booking?',
                        ValidationMessage.requiredFront
                    )
                )
                .test(
                    'min',
                    UseLangMessage(
                        'How many days in advance do you need for a booking? If you want to allow same day bookings, please enter 0',
                        ValidationMessage.noLess
                    ).replace('{%replaceNumber%}', '0 day'),
                    (value) => {
                        if (!value?.toString()) return true;
                        return Number(value) >= 0;
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
                                value={props.values.propertyBedrooms.items[index]?.bedType}
                                options={bedTypes}
                                handlerDropdown={props.handleChange}
                                name={`propertyBedrooms[items[${index}].bedType]`}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <FrontDropdown
                                label={'Quantity'}
                                id={`bedQuantity_${index}`}
                                value={props.values.propertyBedrooms.items[index]?.quantity}
                                options={bedQuantity}
                                handlerDropdown={props.handleChange}
                                name={`propertyBedrooms[items[${index}].quantity]`}
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
            return () => ref.current?.show();
        };
        const onBlurTimePicker = (ref: RefObject<Calendar>) => {
            return () => ref.current?.hide();
        };

        const toggleCancellationPolicyModal = () => setCancellationPolicyModal((prevState) => !prevState);

        return (
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                enableReinitialize={true}
                validationSchema={validationSchema}
                validateOnChange={false}
            >
                {(props) => {
                    setErrorsMessageFormik(props.errors, setError);
                    return (
                        <>
                            <Form style={style}>
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
                                                        value={props.values.propertyTypeId}
                                                        options={propertyTypes}
                                                        handlerDropdown={props.handleChange}
                                                        name={'propertyTypeId'}
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
                                                        value={props.values.neighborhoodTypeId}
                                                        options={neighborhoodTypes}
                                                        handlerDropdown={props.handleChange}
                                                        name={'neighborhoodTypeId'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-4 mb-xs">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Number of Guests'}
                                                        value={props.values.numberOfGuests}
                                                        type={InputType.number}
                                                        name={'numberOfGuests'}
                                                        onChange={props.handleChange}
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
                                                        value={props.values.bathrooms}
                                                        type={InputType.number}
                                                        name={'bathrooms'}
                                                        onChange={props.handleChange}
                                                        min={1}
                                                        required={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-4 mb-xs">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Minimum Night Stay'}
                                                        value={props.values.minimumNightStay}
                                                        type={InputType.number}
                                                        name={'minimumNightStay'}
                                                        onChange={props.handleChange}
                                                        inputRef={minNightStayRef}
                                                        min={1}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-4 mb-xs">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Maximum Night Stay'}
                                                        value={props.values.maximumNightStay}
                                                        type={InputType.number}
                                                        name={'maximumNightStay'}
                                                        onChange={props.handleChange}
                                                        inputRef={maxNightStayRef}
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
                                                    value={props.values.propertyBedrooms.quantity}
                                                    options={bedroomsType}
                                                    handlerDropdown={props.handleChange}
                                                    name={'propertyBedrooms[quantity]'}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-10 col-md-9 col-sm-9">
                                            <div className="bedrooms-listing">
                                                {bedroomsListing(props.values.propertyBedrooms.quantity, props)}
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
                                                    value={props.values.maxGuests}
                                                    type={InputType.number}
                                                    name={'maxGuests'}
                                                    onChange={props.handleChange}
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
                                                            required={true}
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
                                                            onFocus={onFocusTimePicker(calendarCheckInRef)}
                                                            onBlur={onBlurTimePicker(calendarCheckInRef)}
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
                                                            required={true}
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
                                                            onFocus={onFocusTimePicker(calendarCheckOutRef)}
                                                            onBlur={onBlurTimePicker(calendarCheckOutRef)}
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
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-sm-12 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Additional House Rules'}
                                                    value={props.values.additionalRules}
                                                    name={'additionalRules'}
                                                    onChange={props.handleChange}
                                                    type={InputType.textarea}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-wrap">
                                    <h3 className="h5-style">Photos</h3>
                                    <div className="textbox mb">
                                        <p>
                                            Upload photos of your property here. Your listing needs at least one picture
                                            to get started. The first photo you upload will be the main property image
                                            that guests see.
                                        </p>
                                    </div>
                                    <FrontNotificationField alertType={AlertType.danger} message={errorFileUpload} />
                                    <div className="images-control">
                                        <FrontUploadFiles
                                            name={'files[]'}
                                            frontUploadFilesRef={frontUploadFilesRef}
                                            setValue={(e) => uploadFiles(e, props)}
                                            setErrorFile={handlerErrorFileUpload}
                                            maxFileSizeKB={FileValidation.maxUploadFileKB}
                                            maxUploadFilesKB={FileValidation.maxUploadFilesKB}
                                        />
                                    </div>
                                </div>

                                <div className="form-wrap">
                                    <h3 className="h5-style">Rates &amp; Fees</h3>
                                    <div className="row">
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Cleaning Fee ($)'}
                                                    value={props.values.cleaningFee}
                                                    name={'cleaningFee'}
                                                    onChange={props.handleChange}
                                                    type={InputType.currency}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Additional Fees ($)'}
                                                    value={props.values.additionalFees}
                                                    name={'additionalFees'}
                                                    onChange={props.handleChange}
                                                    type={InputType.currency}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Tax Rate (%)'}
                                                    value={props.values.taxRate}
                                                    name={'taxRate'}
                                                    onChange={props.handleChange}
                                                    type={InputType.number}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-wrap">
                                    <h3 className="h5-style">
                                        Policies{' '}
                                        <button
                                            type={'button'}
                                            className={'button-to-link text-sm'}
                                            onClick={toggleCancellationPolicyModal}
                                        >
                                            (Cancellation Policy Descriptions)
                                        </button>
                                    </h3>
                                    <div className="row mb">
                                        <div className="col-sm-12 mb-xs">
                                            <div className="form-group">
                                                <FrontDropdown
                                                    optionValue={'id'}
                                                    optionLabel={'fullName'}
                                                    label={'Cancellation policy'}
                                                    id={'cancellationPolicyId'}
                                                    value={props.values.cancellationPolicyId}
                                                    options={cancellationPolicies}
                                                    handlerDropdown={props.handleChange}
                                                    name={'cancellationPolicyId'}
                                                    required={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-sm-12 mb-xs">
                                            <div className="form-group">
                                                <label className="required">
                                                    How many days in advance do you need for a booking? If you want to
                                                    allow same day bookings, please enter 0
                                                </label>
                                                <FrontInput
                                                    classInput="pt-2"
                                                    required={true}
                                                    value={props.values.rentalNoticeDays}
                                                    name={'rentalNoticeDays'}
                                                    onChange={props.handleChange}
                                                    type={InputType.number}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-sm-12 mb-xs">
                                            <FrontSwitchWithLabel
                                                mainLabel={'Reservation Approval'}
                                                required={true}
                                                onChange={props.handleChange}
                                                value1={'true'}
                                                value2={'false'}
                                                name={'reservationApprovalRequired'}
                                                checked1={props.values.reservationApprovalRequired === 'true'}
                                                checked2={props.values.reservationApprovalRequired === 'false'}
                                                label1={'Required'}
                                                label2={'Not Required'}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-footer has-border-top">
                                    <div>
                                        <FrontButton
                                            className={'btn btn-primary'}
                                            type={'submit'}
                                            loading={props.isSubmitting}
                                            onClick={handlerButton}
                                        >
                                            Next: Post Property &amp; Add Availability
                                        </FrontButton>
                                    </div>
                                    <div>
                                        <FrontButton className={'btn-border'} type={'button'} onClick={previousStep}>
                                            <span className="fas fa-chevron-left mr-2"></span>
                                            Previous Step
                                        </FrontButton>
                                    </div>
                                </div>
                            </Form>
                            <CancellationPolicyModal
                                isOpenModal={cancellationPolicyModal}
                                closeCancellationPolicyModal={toggleCancellationPolicyModal}
                            />
                        </>
                    );
                }}
            </Formik>
        );
    }
);

export default DashboardPropertiesCreateSectionStep2;
