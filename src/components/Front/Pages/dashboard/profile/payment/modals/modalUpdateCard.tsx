import React, { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { observer } from 'mobx-react-lite';
import * as Yup from 'yup';
import { useStores } from '../../../../../../../store';
import { ValidationMessage } from '../../../../../../../lang/en/validatons';
import {
    getLastErrorMessage,
    isTouchDevice,
    setErrorsMessageFormik,
    UseLangMessage,
} from '../../../../../../../utils/helpers';
import { FrontButton } from '../../../../../Global/button';
import FrontInput, { InputType } from '../../../../../Global/input';
import { FrontModal } from '../../../../../Global/modal';
import FrontTooltip from '../../../../../Global/tooltip/index';

interface initialValuesInterface {
    expiration: string;
    number: string;
}

interface Props {
    isOpenModal: boolean;
    closeModalHandler: () => void;
    tooltip: JSX.Element;
}

const ProfileSectionPaymentUpdateCardModal: FunctionComponent<Props> = observer(
    ({ isOpenModal, closeModalHandler, tooltip }) => {
        const [error, setError] = useState<string | null>(null);
        const { globalStore, userStore } = useStores();

        const card = userStore.stripeCard.data;

        const closeModal = (props: FormikProps<initialValuesInterface>) =>
            function () {
                if (!props.isSubmitting) {
                    setError(null);
                    props.resetForm();
                    closeModalHandler();
                }
            };

        const submit = async (props: initialValuesInterface, actions: FormikHelpers<initialValuesInterface>) => {
            setError(null);
            let month = props.expiration.split('/')[0];
            let year = props.expiration.split('/')[1];

            if (!month || !year) {
                month = props.expiration.split(' ')[0];
                year = props.expiration.split(' ')[1];
            }
            const { data, success } = await userStore.updateCard({
                exp_month: Number(month),
                exp_year: Number(year),
            });
            if (success) {
                closeModal(actions as FormikProps<initialValuesInterface>)();
            } else {
                setError(getLastErrorMessage(data));
            }
            actions.setSubmitting(false);
        };

        const validationSchema = Yup.object().shape({
            expiration: Yup.string().required(UseLangMessage('Expiration', ValidationMessage.requiredFront)),
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
                    <FrontButton
                        className={'btn-border'}
                        type={'submit'}
                        disabled={props.isSubmitting}
                        onClick={closeModal(props)}
                    >
                        CANCEL
                    </FrontButton>
                </>
            );
        };

        const initialValues: initialValuesInterface = {
            expiration: card
                ? `${card.exp_month > 9 ? card.exp_month : `0${card.exp_month}`} ${card.exp_year
                      .toString()
                      .slice(card.exp_year.toString().length - 2)}`
                : '',
            number: card ? `****-****-****-${card.last4}` : '',
        };

        const headerModal = () => {
            return (
                <div className="p-dialog-title">
                    Update Credit Card
                    <span className="ml-1 fas fa-question-circle lead mb-0 _modal-update-card-title"></span>
                </div>
            );
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
                                header={headerModal}
                                visible={isOpenModal}
                                onHide={closeModal(props)}
                                footer={renderFooter(props)}
                                dismissableMask={true}
                                position={'top'}
                            >
                                <FrontTooltip
                                    className={isTouchDevice() ? 'p-tooltip_disabled-arrow' : undefined}
                                    mouseTrack={isTouchDevice()}
                                    target={'._modal-update-card-title'}
                                    position={'top'}
                                >
                                    {tooltip}
                                </FrontTooltip>
                                <Form id={'changePasswordForm'}>
                                    <div className="form_status"></div>
                                    {error && (
                                        <div className="alert alert-danger mb" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <div className="form-wrap">
                                        <div className="row mb">
                                            <div className="col-sm-6 mb-xs">
                                                <div className="form-group">
                                                    <FrontInput
                                                        label={'Card Number'}
                                                        value={props.values.number}
                                                        readOnly={true}
                                                        name={'number'}
                                                    />
                                                </div>
                                            </div>
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
                                                <div className="form-group"></div>
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
    }
);
export default ProfileSectionPaymentUpdateCardModal;
