import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { DictionaryCode, ReservationRefundForm } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import FrontInput, { InputType } from '../../../../Global/input';
import { FrontModal } from '../../../../Global/modal';
import { ModalsState } from '../host';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { FrontDropdown } from '../../../../Global/dropdown';
import { FrontFloatLabel } from '../../../../Global/floatLabel';
import { Element } from 'react-scroll';
import ModalFooter from '../../../../Global/modalFooter';

interface Props {
    reservationId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<ModalsState>>;
}

const RequestRefundModal: FC<Props> = ({ reservationId, isVisible, setIsVisible }) => {
    const { reservationsStore, dictionaryStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');
    const initialValues: ReservationRefundForm = {
        reason: '',
        refundAmount: null,
        details: '',
    };
    const refundReasons = dictionaryStore
        .getDictionary(DictionaryCode.refundReasons)
        ?.sort((a, b) => a.order - b.order);

    const validationSchema = Yup.object().shape({
        reason: Yup.string().required(UseLangMessage('Reason', ValidationMessage.requiredFront)),
        refundAmount: Yup.number().typeError(UseLangMessage('Refund Amount', ValidationMessage.requiredFront)),
        details: Yup.string().required(UseLangMessage('Details', ValidationMessage.requiredFront)),
    });

    const sendRefundRequest = async (
        values: ReservationRefundForm,
        formikHelpers: FormikHelpers<ReservationRefundForm>
    ) => {
        setErrors(null);
        try {
            await reservationsStore.requestRefund(reservationId, values);
            formikHelpers.resetForm();
            setSuccess('The refund request has been submitted successfully');
        } catch (e) {
        } finally {
            formikHelpers.setSubmitting(false);
        }
    };

    const hideModal = (props?: FormikProps<ReservationRefundForm>) => {
        setIsVisible((prevState) => ({ ...prevState, requestRefund: false }));
        props?.resetForm();
    };

    const onHide = (props?: FormikProps<ReservationRefundForm>) => () => {
        if (!props?.isSubmitting) {
            setErrors(null);
            setSuccess(null);
            hideModal(props);
        }
    };

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    useEffect(() => {
        if (errors?.length || success?.length) {
            scrollToElement('notificationScrollToElement', -100, 1000, 'refundModal_content');
        }
    }, [errors, success]);
    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={sendRefundRequest}
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setErrors);
                return (
                    <FrontModal
                        visible={isVisible}
                        header="Request Refund"
                        className="request-refund-modal"
                        position="center"
                        dismissableMask
                        onHide={onHide(props)}
                        id="refundModal"
                        footer={
                            <ModalFooter<ReservationRefundForm>
                                formId="refundForm"
                                closeModalHandler={onHide(props)}
                                isSubmitting={props.isSubmitting}
                                resetForm={props.resetForm}
                                primaryButtonText="SEND"
                            />
                        }
                    >
                        <Element name="notificationScrollToElement" />
                        <FrontNotificationField alertType={AlertType.danger} message={errors} />
                        {!errors ? <FrontNotificationField alertType={AlertType.success} message={success} /> : null}
                        <Form className="form-wrap" id="refundForm">
                            <div className="row mb">
                                <div className="col-sm-6 mb-xs">
                                    <div className="form-group">
                                        <FrontDropdown
                                            id="reason"
                                            name="reason"
                                            value={props.values.reason}
                                            options={refundReasons}
                                            optionValue="fullName"
                                            optionLabel="fullName"
                                            label="Reason"
                                            handlerDropdown={props.handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-sm-6 mb-xs">
                                    <div className="form-group">
                                        <FrontInput
                                            label={'Refund Amount'}
                                            value={props.values.refundAmount ?? ''}
                                            name={'refundAmount'}
                                            onChange={props.handleChange}
                                            type={InputType.currency}
                                            required={true}
                                            min={0}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row mb">
                                <div className="col-sm-12 mb-xs">
                                    <div className="form-group">
                                        <FrontInput
                                            id="details"
                                            name="details"
                                            type={InputType.textarea}
                                            required
                                            label="Details"
                                            value={props.values.details}
                                            onChange={props.handleChange}
                                            classWrapper="opaque-label"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </FrontModal>
                );
            }}
        </Formik>
    );
};

export default RequestRefundModal;
