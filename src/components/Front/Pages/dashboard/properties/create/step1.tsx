import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { Element } from 'react-scroll';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { useStores } from '../../../../../../store';
import { DictionaryCode } from '../../../../../../models/api';
import { FrontButton } from '../../../../Global/button';
import DashboardPropertiesCreateLocationModal from './locationModal';
import FrontInput, { InputType } from '../../../../Global/input';
import { observer } from 'mobx-react-lite';
import { FrontDropdown } from '../../../../Global/dropdown';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMaps } from '../../../../../../utils/useGoogleMaps';

interface initialValuesInterface {
    name: string;
    description: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
}

interface Props {
    style: object;
    setObProperty: (values: object) => void;
}

const DashboardPropertiesCreateSectionStep1: FunctionComponent<Props> = observer(({ style, setObProperty }) => {
    const [confirmLocation, setConfirmLocation] = useState(false);
    const [isOpenLocationModal, setIsOpenLocationModal] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

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
    const { dictionaryStore } = useStores();

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    const states = dictionaryStore.getDictionary(DictionaryCode.states);

    const closeLocationModal = () => setIsOpenLocationModal(false);
    const handlerConfirmLocation = () => setConfirmLocation(true);
    const changeAddress = () => setConfirmLocation(false);

    const openModal = () => {
        setTimeout(() => {
            if (error?.length) {
                scrollToElement('scrollToForm1');
            }
        }, 100);
    };

    const onSubmit = (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        if (confirmLocation) {
            setObProperty({ ...props, ...location });
            scrollToElement('scrollToForm1');
        } else {
            setIsOpenLocationModal(true);
        }
        formikHelpers.setSubmitting(false);
    };

    const initialValues: initialValuesInterface = {
        name: '',
        description: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(UseLangMessage('Property Name/Title', ValidationMessage.requiredFront)),
        description: Yup.string().required(UseLangMessage('Rental Description', ValidationMessage.requiredFront)),
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
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setError);
                return (
                    <>
                        <Form style={style}>
                            <Element name="scrollToForm1"></Element>
                            <FrontNotificationField alertType={AlertType.danger} message={error} />
                            <div className="form-wrap">
                                <h3 className="h5-style">Summary</h3>
                                <div className="form-group mb">
                                    <FrontInput
                                        label={'Property Name/Title'}
                                        required={true}
                                        value={props.values.name}
                                        name={'name'}
                                        onChange={props.handleChange}
                                    />
                                </div>
                                <div className="form-group mb">
                                    <FrontInput
                                        label={'Rental Description'}
                                        required={true}
                                        value={props.values.description}
                                        name={'description'}
                                        onChange={props.handleChange}
                                        type={InputType.textarea}
                                    />
                                </div>
                            </div>
                            <div className="form-wrap">
                                <h3 className="h5-style">Location</h3>
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
                                                        mapContainerClassName={'location-address-google-map'}
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

                                <div className="form-footer has-border-top">
                                    <div>
                                        <FrontButton
                                            className={'btn-primary'}
                                            type={'submit'}
                                            onClick={!confirmLocation ? openModal : () => {}}
                                        >
                                            {!confirmLocation
                                                ? 'NEXT: Confirm location on map'
                                                : 'Next: add property details'}
                                        </FrontButton>
                                    </div>
                                </div>
                            </div>
                        </Form>
                        <DashboardPropertiesCreateLocationModal
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

export default DashboardPropertiesCreateSectionStep1;
