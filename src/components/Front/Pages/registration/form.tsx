import React, { FunctionComponent, useState } from 'react';
import FrontInput, { InputType } from '../../Global/input';
import { Form, Formik, FormikHelpers } from 'formik';
import FrontFileInput from '../../Global/fileInput';
import Link from 'next/link';
import { FrontRoutesList } from '../FrontRoutesList';
import { State } from '../../../../models/api';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../store';
import { File, Password, Phone } from '../../../../config/validate';
import { FrontButton } from '../../Global/button';
import { Dropdown } from 'primereact/dropdown';
import { FrontFloatLabel } from '../../Global/floatLabel';
import { bytesToKb, isImageFile, setErrorsMessageFormik, UseLangMessage } from '../../../../utils/helpers';
import { ValidationMessage } from '../../../../lang/en/validatons';
import * as Yup from 'yup';
import { AlertType, FrontNotificationField } from '../../Global/notificationField';
import { Element, scroller } from 'react-scroll';

interface initialValuesInterface {
    firstName: string;
    lastName: string;
    email: string;
    displayName: string;
    profilePicture: File | null;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    governmentPhoto: File | null;
    password: string;
    confirmPassword: string;
}

interface Props {
    states: State[] | [];
    submitted: () => void;
}

const RegistrationSectionForm: FunctionComponent<Props> = observer(({ states, submitted }) => {
    const [termsConditions, setTermsConditions] = useState(false);
    const { userStore } = useStores();

    let error: string | null = '';
    const setError = (err: string | null) => (error = err);

    const handlerButton = () => {
        setTimeout(() => {
            if (error?.length) {
                scroller.scrollTo('notificationScrollToElement', {
                    duration: 1000,
                    smooth: true,
                    offset: -100,
                });
            }
        }, 100);
    };

    const onSubmit = async (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        const data = await userStore.createUser(props);
        if (data.success) {
            submitted();
        } else {
            setError(data.data);
            scroller.scrollTo('notificationScrollToElement', {
                duration: 1000,
                smooth: true,
                offset: -100,
            });
        }
        formikHelpers.setSubmitting(false);
    };

    const initialValues: initialValuesInterface = {
        firstName: '',
        lastName: '',
        displayName: '',
        profilePicture: null,
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        governmentPhoto: null,
        password: '',
        confirmPassword: '',
    };

    const validationSchema = Yup.object().shape({
        password: Yup.string()
            .matches(Password.default, UseLangMessage('Password', ValidationMessage.matchesPasswordDefault))
            .required(UseLangMessage('Password', ValidationMessage.requiredFront)),
        confirmPassword: Yup.string()
            .matches(Password.default, UseLangMessage('Confirm Password', ValidationMessage.matchesPasswordDefault))
            .required(UseLangMessage('Confirm Password', ValidationMessage.requiredFront))
            .oneOf(
                [Yup.ref('password'), null],
                UseLangMessage('Confirm Password', ValidationMessage.matchesPasswordOfConfirmPassword)
            ),
        profilePicture: Yup.mixed()
            .required(UseLangMessage('Profile Picture', ValidationMessage.requiredFront))
            .test('fileType', UseLangMessage('Profile Picture', ValidationMessage.isNotImage), (file?: File) => {
                if (!file) {
                    return true;
                }
                return file && isImageFile(file);
            })
            .test(
                'fileSize',
                `${UseLangMessage('Profile Picture', ValidationMessage.exceed)} ${File.maxUploadUserImageKB} KB`,
                (file?: File) => {
                    if (!file) {
                        return true;
                    }
                    return bytesToKb(file.size) <= File.maxUploadUserImageKB;
                }
            ),
        governmentPhoto: Yup.mixed()
            .required(UseLangMessage('Government issued id (photo)', ValidationMessage.requiredFront))
            .test(
                'fileType',
                UseLangMessage('Government issued id (photo)', ValidationMessage.isNotImage),
                (file?: File) => {
                    if (!file) {
                        return true;
                    }
                    return file && isImageFile(file);
                }
            )
            .test(
                'fileSize',
                `${UseLangMessage('Government issued id (photo)', ValidationMessage.exceed)} ${
                    File.maxUploadUserImageKB
                } KB`,
                (file?: File) => {
                    if (!file) {
                        return true;
                    }
                    return bytesToKb(file.size) <= File.maxUploadUserImageKB;
                }
            ),
        state: Yup.string().required(UseLangMessage('State', ValidationMessage.requiredFront)),
        firstName: Yup.string().required(UseLangMessage('First Name', ValidationMessage.requiredFront)),
        lastName: Yup.string().required(UseLangMessage('Last Name', ValidationMessage.requiredFront)),
        displayName: Yup.string().required(UseLangMessage('Display Name', ValidationMessage.requiredFront)),
        email: Yup.string().required(UseLangMessage('Email', ValidationMessage.requiredFront)),
        phone: Yup.mixed()
            .required(UseLangMessage('Phone', ValidationMessage.requiredFront))
            .test('minLength', UseLangMessage('Phone', ValidationMessage.invalid), (phone?: string) => {
                if (!phone) {
                    return true;
                }
                return phone.replace(/\D/g, '').length === Phone.correctLength;
            }),
        address1: Yup.string().required(UseLangMessage('Address 1', ValidationMessage.requiredFront)),
        city: Yup.string().required(UseLangMessage('City', ValidationMessage.requiredFront)),
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
                    <section className="content-section">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1 indent-left indent-right">
                                    <h1 className="h2-style">Sign up</h1>
                                    <div className="textbox mb">
                                        <p>Please complete this form to create an account.</p>
                                    </div>
                                    <Element name="notificationScrollToElement"></Element>
                                    <FrontNotificationField alertType={AlertType.danger} message={error} />
                                    <div className="form-wrap mb">
                                        <Form encType="multipart/form-data" method="post">
                                            <div className="mb">
                                                <div className="row mb">
                                                    <div className="col-sm-6 mb-xs">
                                                        <div className="form-group">
                                                            <FrontInput
                                                                required={true}
                                                                label={'First Name'}
                                                                value={props.values.firstName}
                                                                name={'firstName'}
                                                                onChange={props.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mb-xs">
                                                        <div className="form-group">
                                                            <FrontInput
                                                                label={'Last Name'}
                                                                required={true}
                                                                value={props.values.lastName}
                                                                name={'lastName'}
                                                                onChange={props.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mb">
                                                    <div className="col-sm-6 mb-xs">
                                                        <div className="form-group">
                                                            <FrontInput
                                                                label={'Display Name'}
                                                                required={true}
                                                                value={props.values.displayName}
                                                                name={'displayName'}
                                                                onChange={props.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mb-xs">
                                                        <div className="form-group mb">
                                                            <FrontFileInput
                                                                label={'Profile Picture'}
                                                                required={true}
                                                                placeholder={'No File Upload'}
                                                                value={props.values.profilePicture}
                                                                name={'profilePicture'}
                                                                setValue={props.setFieldValue}
                                                                multiple={false}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mb">
                                                    <div className="col-sm-6 mb-xs">
                                                        <div className="form-group">
                                                            <FrontInput
                                                                label={'Email Address'}
                                                                required={true}
                                                                value={props.values.email}
                                                                type={InputType.email}
                                                                name={'email'}
                                                                onChange={props.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mb-xs">
                                                        <div className="form-group">
                                                            <FrontInput
                                                                label={'Phone Number'}
                                                                required={true}
                                                                value={props.values.phone}
                                                                type={InputType.tel}
                                                                name={'phone'}
                                                                onChange={props.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
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
                                                            <div className="input-wrap select-wrap has-content">
                                                                <FrontFloatLabel label="State" id="state" required>
                                                                    <Dropdown
                                                                        className="w-full"
                                                                        optionValue="shortName"
                                                                        optionLabel="fullName"
                                                                        value={props.values.state}
                                                                        options={states}
                                                                        onChange={props.handleChange}
                                                                        name="state"
                                                                    />
                                                                </FrontFloatLabel>
                                                            </div>
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
                                                <div className="row mb">
                                                    <div className="col-sm-6 mb-xs">
                                                        <div className="form-group">
                                                            <FrontInput
                                                                required={true}
                                                                label={'Password'}
                                                                value={props.values.password}
                                                                type={InputType.password}
                                                                name={'password'}
                                                                onChange={props.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mb-xs">
                                                        <div className="form-group">
                                                            <FrontInput
                                                                required={true}
                                                                label={'Confirm password'}
                                                                value={props.values.confirmPassword}
                                                                type={InputType.password}
                                                                name={'confirmPassword'}
                                                                onChange={props.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group mb">
                                                    <FrontFileInput
                                                        label={'Government issued id (photo)'}
                                                        required={true}
                                                        placeholder={'No File Upload'}
                                                        value={props.values.governmentPhoto}
                                                        name={'governmentPhoto'}
                                                        setValue={props.setFieldValue}
                                                        buttonName={'Upload file'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="textbox mb">
                                                <p>
                                                    All personal information is for verification purposes only and will
                                                    not be shared with other users of the site.
                                                </p>
                                            </div>
                                            <div className="mb">
                                                <div className="checkbox mb">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={termsConditions}
                                                            onChange={(event) =>
                                                                setTermsConditions(event.target.checked)
                                                            }
                                                            name={'termsConditions'}
                                                        />
                                                        <span className="radio-check-control"></span>
                                                        <span className="radio-check-label required">
                                                            Using this site means that you agree to our{' '}
                                                            <Link href={FrontRoutesList.TermsAndConditions}>
                                                                <a>Terms &amp; Conditions</a>
                                                            </Link>
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="mb">
                                                <div className="form-group form-footer justified">
                                                    <div>
                                                        <FrontButton
                                                            disabled={!termsConditions}
                                                            className={'btn btn-primary'}
                                                            type={'submit'}
                                                            loading={props.isSubmitting}
                                                            onClick={handlerButton}
                                                        >
                                                            SUBMIT
                                                        </FrontButton>
                                                    </div>
                                                    <div>
                                                        <p>
                                                            Already have an account?{' '}
                                                            <Link href={FrontRoutesList.SignIn}>
                                                                <a href={FrontRoutesList.SignIn}>Log in</a>
                                                            </Link>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            }}
        </Formik>
    );
});
export default RegistrationSectionForm;
