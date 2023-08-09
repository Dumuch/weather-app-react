import React, { FunctionComponent, useEffect, useState } from 'react';
import { Property } from '../../../../../../models/api/property';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import FrontInput, { InputType } from '../../../../Global/input';
import { FrontButton } from '../../../../Global/button';
import * as Yup from 'yup';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { useStores } from '../../../../../../store';
import { DictionaryCode } from '../../../../../../models/api';
import FrontSwitchWithLabel from '../../../../Global/switchWithLabel';
import { FrontDropdown } from '../../../../Global/dropdown';
import { Element } from 'react-scroll';
import { observer } from 'mobx-react-lite';
import CancellationPolicyModal from '../../../../Global/modals/cancellationPolicyModal';

interface Props {
    property: Property;
}

interface initialValuesInterface {
    id: string;
    cleaningFee: number | null;
    additionalFees: number | null;
    taxRate: number | null;
    cancellationPolicyId: number;
    reservationApprovalRequired: boolean | null;
    rentalNoticeDays: string;
}
const PropertySectionReservationForm: FunctionComponent<Props> = observer(({ property }) => {
    const [onlyRead, setOnlyRead] = useState(true);
    const [cancellationPolicyModal, setCancellationPolicyModal] = useState(false);

    const { propertiesStore, userStore, dictionaryStore, globalStore } = useStores();

    let error: string | null = '';
    const setError = (err: string | null) => (error = err);

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    const cancellationPolicies = dictionaryStore.getDictionary(DictionaryCode.cancellationPolicies, true, 'order');

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
            await propertiesStore.updateItem(props, false);
            userStore.properties.isFetched = false;
            userStore.isFetched = false;
            globalStore.showToast({
                severity: 'success',
                detail: 'The property`s fees and rates have been updated',
            });
            setOnlyRead(true);
        } catch (e) {}

        formikHelpers.setSubmitting(false);
    };

    const handlerButton = () => {
        setTimeout(() => {
            if (error?.length) {
                scrollToElement('scrollToForm');
            }
        }, 100);
    };

    const initialValues: initialValuesInterface = {
        id: property.id ?? '',
        cleaningFee: property.cleaningFee ?? null,
        additionalFees: property.additionalFees ?? null,
        taxRate: property.taxRate ?? null,
        rentalNoticeDays: property.rentalNoticeDays?.toString() ?? '',
        cancellationPolicyId: Number(property.cancellationPolicy?.id) ?? '',
        reservationApprovalRequired: property.reservationApprovalRequired ?? true,
    };
    const validationSchema = Yup.object().shape({
        cancellationPolicyId: Yup.mixed().test(
            'empty',
            UseLangMessage('Cancellation policy', ValidationMessage.requiredFront),
            (value) => {
                return !!value;
            }
        ),
        rentalNoticeDays: Yup.mixed()
            .required(
                UseLangMessage('How many days in advance do you need for a booking?', ValidationMessage.requiredFront)
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

    const toggleCancellationPolicyModal = () => setCancellationPolicyModal((prevState) => !prevState);
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
                        <Element name="scrollToForm"></Element>
                        <Form method="post">
                            <div className="form-wrap">
                                <h3 className="h5-style">Rates &amp; Fees</h3>
                                <div className="row mb">
                                    <div className="col-sm-4 mb-xs">
                                        <div className="form-group">
                                            <FrontInput
                                                label={'Cleaning Fee ($)'}
                                                value={props.values.cleaningFee ?? ''}
                                                name={'cleaningFee'}
                                                onChange={props.handleChange}
                                                readOnly={onlyRead}
                                                type={InputType.currency}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-4 mb-xs">
                                        <div className="form-group">
                                            <FrontInput
                                                label={'Additional Fees ($)'}
                                                value={props.values.additionalFees ?? ''}
                                                name={'additionalFees'}
                                                onChange={props.handleChange}
                                                readOnly={onlyRead}
                                                type={InputType.currency}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-4 mb-xs">
                                        <div className="form-group">
                                            <FrontInput
                                                label={'Tax Rate (%)'}
                                                value={props.values.taxRate ?? ''}
                                                name={'taxRate'}
                                                onChange={props.handleChange}
                                                readOnly={onlyRead}
                                                type={InputType.number}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-wrap">
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
                                                    readOnly={onlyRead}
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
                                                    readOnly={onlyRead}
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
                                                checked1={
                                                    props.values.reservationApprovalRequired?.toString() === 'true'
                                                }
                                                checked2={
                                                    props.values.reservationApprovalRequired?.toString() === 'false'
                                                }
                                                label1={'Required'}
                                                label2={'Not Required'}
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
                        <CancellationPolicyModal
                            isOpenModal={cancellationPolicyModal}
                            closeCancellationPolicyModal={toggleCancellationPolicyModal}
                        />
                    </>
                );
            }}
        </Formik>
    );
});

export default PropertySectionReservationForm;
