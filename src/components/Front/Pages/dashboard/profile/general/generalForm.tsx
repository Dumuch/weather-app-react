import React, { FunctionComponent, useEffect, useState } from 'react';
import FrontInput, { InputType } from '../../../../Global/input';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../store';
import { FrontButton } from '../../../../Global/button';
import { Dropdown } from 'primereact/dropdown';
import { FrontFloatLabel } from '../../../../Global/floatLabel';
import { FrontImage } from '../../../../Global/image';
import * as Yup from 'yup';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { DictionaryCode } from '../../../../../../models/api';
import { Element } from 'react-scroll';
import { Phone } from '../../../../../../config/validate';

interface initialValuesInterface {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    displayName: string;
    profilePicture: string;
    profilePictureFile: File | null;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    governmentIssuedIDPhoto: string;
    governmentIssuedIDPhotoFile: File | null;
}

interface Props {
    openChangePhoto: () => void;
}

const ProfileSectionGeneralForm: FunctionComponent<Props> = observer(({ openChangePhoto }) => {
    const [error, setError] = useState<string | null>(null);
    const { userStore, dictionaryStore } = useStores();
    const [onlyRead, setOnlyRead] = useState(true);

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    const states = dictionaryStore.getDictionary(DictionaryCode.states);

    const activeForm = () => setOnlyRead(false);
    const resetForm = (props: FormikProps<initialValuesInterface>) =>
        function () {
            setOnlyRead(true);
            props.resetForm();
            setError(null);
        };

    const onSubmit = async (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        try {
            await userStore.updateUser(props);
            setOnlyRead(true);
        } catch {}
        formikHelpers.setSubmitting(false);
    };

    const initialValues: initialValuesInterface = {
        id: userStore.user?.id ?? '',
        firstName: userStore.user?.firstName ?? '',
        lastName: userStore.user?.lastName ?? '',
        displayName: userStore.user?.displayName ?? '',
        profilePicture: userStore.user?.profilePicture ?? '',
        profilePictureFile: null,
        email: userStore.user?.email ?? '',
        phone: userStore.user?.phone ?? '',
        address1: userStore.user?.address1 ?? '',
        address2: userStore.user?.address2 ?? '',
        city: userStore.user?.city ?? '',
        state: userStore.user?.state ?? '',
        zip: userStore.user?.zip ?? '',
        governmentIssuedIDPhoto: userStore.user?.governmentIssuedIDPhoto ?? '',
        governmentIssuedIDPhotoFile: null,
    };

    const validationSchema = Yup.object().shape({
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

    const handlerButton = () => {
        setTimeout(() => {
            if (error?.length) {
                scrollToElement('notificationField');
            }
        }, 100);
    };

    return (
        <>
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
                        <div role="tabpanel" className="tab-pane fade in active" id="tab-panel1" aria-labelledby="tab1">
                            <div className="profile-general-fields mb-big">
                                <div className="form-wrap">
                                    <Element name="notificationField"></Element>
                                    <FrontNotificationField alertType={AlertType.danger} message={error} />
                                    <Form id={'generalForm'}>
                                        <div className="row">
                                            <div className="col-sm-4 mb">
                                                <div className="form-group">
                                                    <FrontInput
                                                        required={true}
                                                        label={'First Name'}
                                                        value={props.values.firstName}
                                                        name={'firstName'}
                                                        onChange={props.handleChange}
                                                        readOnly={onlyRead}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-4 mb">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Last Name'}
                                                        required={true}
                                                        value={props.values.lastName}
                                                        name={'lastName'}
                                                        onChange={props.handleChange}
                                                        readOnly={onlyRead}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-4 mb">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Display Name'}
                                                        required={true}
                                                        value={props.values.displayName}
                                                        name={'displayName'}
                                                        onChange={props.handleChange}
                                                        readOnly={onlyRead}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Email Address'}
                                                        required={true}
                                                        value={props.values.email}
                                                        type={InputType.email}
                                                        name={'email'}
                                                        onChange={props.handleChange}
                                                        readOnly={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Phone Number'}
                                                        required={true}
                                                        value={props.values.phone}
                                                        type={InputType.tel}
                                                        name={'phone'}
                                                        onChange={props.handleChange}
                                                        readOnly={onlyRead}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Address 1'}
                                                        required={true}
                                                        value={props.values.address1}
                                                        name={'address1'}
                                                        onChange={props.handleChange}
                                                        readOnly={onlyRead}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Address 2'}
                                                        value={props.values.address2}
                                                        name={'address2'}
                                                        onChange={props.handleChange}
                                                        readOnly={onlyRead}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-4 mb-xs">
                                                <div className="form-group">
                                                    <FrontInput
                                                        required={true}
                                                        label={'City'}
                                                        value={props.values.city}
                                                        name={'city'}
                                                        onChange={props.handleChange}
                                                        readOnly={onlyRead}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-4 mb-xs">
                                                <div className="form-group">
                                                    <div className="input-wrap has-content select-wrap">
                                                        <FrontFloatLabel label="State" id="state" required>
                                                            <Dropdown
                                                                className="w-full"
                                                                optionValue="shortName"
                                                                optionLabel="fullName"
                                                                value={props.values.state}
                                                                options={states}
                                                                onChange={props.handleChange}
                                                                name="state"
                                                                disabled={onlyRead}
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
                                                        readOnly={onlyRead}
                                                        type={InputType.number}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                                <div className="image-wrap">
                                    <div className="image mb">
                                        <FrontImage
                                            src={`${props.values.id}/${props.values.profilePicture}`}
                                            identityId={'users'}
                                            width={'200px'}
                                            height={'216px'}
                                        />
                                    </div>
                                    <FrontButton
                                        className={'btn-border btn-sm'}
                                        type={'button'}
                                        onClick={openChangePhoto}
                                    >
                                        Change image...
                                    </FrontButton>
                                </div>
                            </div>
                            <div className="sep bg-color-light-grey mb-big"></div>
                            <div className="form-footer">
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
                                                form="generalForm"
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
                        </div>
                    );
                }}
            </Formik>
        </>
    );
});
export default ProfileSectionGeneralForm;
