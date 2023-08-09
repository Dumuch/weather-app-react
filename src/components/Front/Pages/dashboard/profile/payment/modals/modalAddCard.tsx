import React, { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { observer } from 'mobx-react-lite';
import * as Yup from 'yup';
import { getLastErrorMessage, setErrorsMessageFormik, UseLangMessage } from '../../../../../../../utils/helpers';
import { FrontModal } from '../../../../../Global/modal';
import { FrontButton } from '../../../../../Global/button';
import { useStores } from '../../../../../../../store';
import FrontInput, { InputType } from '../../../../../Global/input';
import { ValidationMessage } from '../../../../../../../lang/en/validatons';

interface initialValuesInterface {
    number: string;
    expiration: string;
    cvc: string;
}

interface Props {
    isOpenModal: boolean;
    closeModalHandler: () => void;
}

const ProfileSectionPaymentAddCardModal: FunctionComponent<Props> = observer(({ isOpenModal, closeModalHandler }) => {
    const [error, setError] = useState<string | null>(null);
    const { userStore } = useStores();

    const closeModal = (props: FormikHelpers<initialValuesInterface>) =>
        function () {
            setError(null);
            props.resetForm();
            closeModalHandler();
        };

    const submit = async (props: initialValuesInterface, actions: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        const month = props.expiration.split('/')[0];
        const year = props.expiration.split('/')[1];

        const { data, success } = await userStore.addCard({
            number: Number(props.number.replace(/[^0-9]/g, '')),
            exp_month: Number(month),
            exp_year: Number(year),
            cvc: props.cvc,
        });
        if (success) {
            closeModal(actions)();
        } else {
            setError(data);
        }
        actions.setSubmitting(false);
    };

    const validationSchema = Yup.object().shape({
        number: Yup.string()
            .required(UseLangMessage('Card Number', ValidationMessage.requiredFront))
            .test('length', UseLangMessage('Card Number', ValidationMessage.invalid), (value) => {
                if (!value) {
                    return true;
                }
                return value.replace(/[^0-9]/g, '').length === 16;
            }),
        expiration: Yup.string()
            .required(UseLangMessage('Expiration', ValidationMessage.requiredFront))
            .test('length', UseLangMessage('Expiration', ValidationMessage.invalid), (value) => {
                if (!value) {
                    return true;
                }
                return value.replace(/[^0-9]/g, '').length === 4;
            }),
        cvc: Yup.string().required(UseLangMessage('CVV', ValidationMessage.requiredFront)),
    });

    const renderFooter = (props: FormikProps<initialValuesInterface>) => {
        return (
            <>
                <FrontButton
                    className={'btn-primary'}
                    type={'submit'}
                    form={'changePasswordForm'}
                    loading={props.isSubmitting}
                >
                    SAVE
                </FrontButton>
                <FrontButton className={'btn-border'} type={'submit'} onClick={closeModal(props)}>
                    CANCEL
                </FrontButton>
            </>
        );
    };

    const initialValues: initialValuesInterface = {
        number: '',
        expiration: '',
        cvc: '',
    };

    return (
        <>
            <Formik
                initialValues={initialValues}
                onSubmit={submit}
                validateOnChange={false}
                enableReinitialize={true}
                validationSchema={validationSchema}
            >
                {(props) => {
                    setErrorsMessageFormik(props.errors, setError);
                    return (
                        <FrontModal
                            header={'Add New Credit Card'}
                            visible={isOpenModal}
                            onHide={closeModal(props)}
                            footer={renderFooter(props)}
                            dismissableMask={true}
                            position={'top'}
                            className={'p-dialog-content_scroll'}
                        >
                            <Form id={'changePasswordForm'}>
                                <div className="form_status"></div>
                                {error && (
                                    <div className="alert alert-danger mb" role="alert">
                                        {error}
                                    </div>
                                )}
                                <div className="form-wrap">
                                    <div className="row mb">
                                        <div className="col-sm-12 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Card Number'}
                                                    value={props.values.number ?? ''}
                                                    type={InputType.mask}
                                                    mask={'9999-9999-9999-9999'}
                                                    name={'number'}
                                                    required={true}
                                                    onChange={props.handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-sm-6 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Expiration'}
                                                    value={props.values.expiration}
                                                    name={'expiration'}
                                                    type={InputType.mask}
                                                    mask={'99/99'}
                                                    required={true}
                                                    onChange={props.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'CVV'}
                                                    value={props.values.cvc ?? ''}
                                                    name={'cvc'}
                                                    required={true}
                                                    onChange={props.handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Form>
                        </FrontModal>
                    );
                }}
            </Formik>
        </>
    );
});
export default ProfileSectionPaymentAddCardModal;
