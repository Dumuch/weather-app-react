import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Property } from '../../../../../../../models/api/property';
import { FrontButton } from '../../../../../Global/button';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../../utils/helpers';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { ValidationMessage } from '../../../../../../../lang/en/validatons';
import FrontInput, { InputType } from '../../../../../Global/input';
import { FrontDropdown } from '../../../../../Global/dropdown';
import { DictionaryCode } from '../../../../../../../models/api';
import { useStores } from '../../../../../../../store';
import PropertySectionLocationModal from './locationModal';
import { Element } from 'react-scroll';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMaps } from '../../../../../../../utils/useGoogleMaps';

interface Props {
    property: Property;
    cancel: () => void;
}

interface initialValuesInterface {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
}

const PropertySectionLocationForm: FunctionComponent<Props> = observer(({ property, cancel }) => {
    const { dictionaryStore, propertiesStore, userStore, globalStore } = useStores();
    const [confirmLocation, setConfirmLocation] = useState(false);
    const [isOpenLocationModal, setIsOpenLocationModal] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>({
        lat: property.lat,
        lng: property.lng,
    });

    const { isLoaded } = useGoogleMaps();
    const onLoad = useCallback(
        function callback(obMap: google.maps.Map) {
            if (location?.lat && location?.lng) {
                new google.maps.Marker({ position: { ...location }, map: obMap });
            }
        },
        [location]
    );

    let error: string | null = '';
    const setError = (err: string | null) => (error = err);

    const openModal = () => {
        setTimeout(() => {
            if (error?.length) {
                scrollToElement('scrollToForm1');
            }
        }, 100);
    };

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    const states = dictionaryStore.getDictionary(DictionaryCode.states);

    const closeLocationModal = () => setIsOpenLocationModal(false);
    const handlerConfirmLocation = () => setConfirmLocation(true);

    const changeAddress = () => setConfirmLocation(false);

    const resetForm = (props: FormikProps<initialValuesInterface>) =>
        function () {
            cancel();
            props.resetForm();
            setError(null);
        };

    const onSubmit = async (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        if (confirmLocation) {
            if (!location?.lat || !location?.lng) {
                setError('The property`s location not found, please try again');
                return;
            }
            try {
                await propertiesStore.updateItem({ id: property.id, ...props, ...location }, false);
                userStore.properties.isFetched = false;
                userStore.isFetched = false;
                scrollToElement('scrollToForm1');
                globalStore.showToast({
                    severity: 'success',
                    detail: 'The property`s location has been updated',
                });
                cancel();
            } catch (e) {}
        } else {
            setIsOpenLocationModal(true);
        }
        formikHelpers.setSubmitting(false);
    };

    const initialValues: initialValuesInterface = {
        address1: property.address1 ?? '',
        address2: property.address2 ?? '',
        city: property.city ?? '',
        state: property.state ?? '',
        zip: property.zip ?? '',
    };

    const validationSchema = Yup.object().shape({
        address1: Yup.string().required(UseLangMessage('Address 1', ValidationMessage.requiredFront)),
        city: Yup.string().required(UseLangMessage('City', ValidationMessage.requiredFront)),
        state: Yup.string().required(UseLangMessage('State', ValidationMessage.requiredFront)),
        zip: Yup.string()
            .required(UseLangMessage('Zip', ValidationMessage.requiredFront))
            .max(5, UseLangMessage('Zip', ValidationMessage.noMore).replace('{%replaceNumber%}', '5 characters')),
    });
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
                        <FrontNotificationField alertType={AlertType.danger} message={error} />
                        <Element name="scrollToForm1"></Element>

                        <Form method="post">
                            {!confirmLocation ? (
                                <>
                                    <div className="row mb">
                                        <div className="col-sm-6 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Address 1'}
                                                    required={true}
                                                    value={props.values.address1}
                                                    name={'address1'}
                                                    onChange={props.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Address 2'}
                                                    value={props.values.address2}
                                                    name={'address2'}
                                                    onChange={props.handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    required={true}
                                                    label={'City'}
                                                    value={props.values.city}
                                                    name={'city'}
                                                    onChange={props.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontDropdown
                                                    optionValue={'shortName'}
                                                    optionLabel="fullName"
                                                    label={'State'}
                                                    id={'state'}
                                                    value={props.values.state}
                                                    options={states}
                                                    handlerDropdown={props.handleChange}
                                                    name={'state'}
                                                    required={true}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    required={true}
                                                    label={'Zip'}
                                                    value={props.values.zip}
                                                    name={'zip'}
                                                    onChange={props.handleChange}
                                                    type={InputType.number}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <address className="location-address mb-half">
                                        {props.values.address1}
                                        <br />
                                        {props.values.address2 && (
                                            <>
                                                {props.values.address2}
                                                <br />
                                            </>
                                        )}
                                        {props.values.city}, {props.values.state} {props.values.zip}
                                    </address>
                                    <div className="edit-link mb">
                                        <a onClick={changeAddress}>
                                            Edit Address<span className="fas fa-chevron-right"></span>
                                        </a>
                                    </div>
                                    {location ? (
                                        <div className="mb-big">
                                            {isLoaded ? (
                                                <GoogleMap
                                                    mapContainerStyle={{
                                                        width: '100%',
                                                        minHeight: '320px',
                                                        height: '100%',
                                                    }}
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
                                        <p>The address is not found.</p>
                                    )}
                                </>
                            )}

                            <div className="form-footer mb-big">
                                {!confirmLocation ? (
                                    <>
                                        <div>
                                            <FrontButton className={'btn-primary'} type={'submit'} onClick={openModal}>
                                                Confirm location on map
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
                                ) : (
                                    <>
                                        <div>
                                            <FrontButton
                                                className={'btn-primary'}
                                                type={'submit'}
                                                loading={props.isSubmitting}
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
                                                Discard changes
                                            </FrontButton>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Form>
                        <PropertySectionLocationModal
                            isOpenModal={isOpenLocationModal}
                            closeLocationModal={closeLocationModal}
                            zip={props.values.zip}
                            address1={props.values.address1}
                            address2={props.values.address2}
                            state={props.values.state}
                            city={props.values.city}
                            confirmLocation={handlerConfirmLocation}
                            location={location}
                            setLocation={setLocation}
                        />
                    </>
                );
            }}
        </Formik>
    );
});

export default PropertySectionLocationForm;
