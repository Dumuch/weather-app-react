import React, { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../store';
import { FrontButton } from '../../../Global/button';
import { setErrorsMessageFormik, UseLangMessage } from '../../../../../utils/helpers';
import { FrontModal } from '../../../Global/modal';
import * as Yup from 'yup';
import FrontInput, { InputType } from '../../../Global/input';
import { ChangePassword } from '../../../../../utils/amplifyHelpers';
import { Password } from '../../../../../config/validate';
import { ValidationMessage } from '../../../../../lang/en/validatons';

interface initialValuesInterface {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

interface Props {
    isOpenModal: boolean;
    closeModalChangePassword: () => void;
}

const ProfileChangePasswordForm: FunctionComponent<Props> = observer(({ isOpenModal, closeModalChangePassword }) => {
    const [error, setError] = useState<string | null>(null);
    const { globalStore } = useStores();

    const closeModal = (props: FormikHelpers<initialValuesInterface>) =>
        function () {
            setError(null);
            props.resetForm();
            closeModalChangePassword();
        };

    const saveNewPassword = async (props: initialValuesInterface, actions: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        try {
            const data = await ChangePassword(props.currentPassword, props.newPassword);
            if (data) {
                globalStore.showToast({
                    severity: 'success',
                    detail: 'Your password has been changed successfully',
                });
                closeModal(actions)();
            }
        } catch (error: any) {
            if (error.name === 'NotAuthorizedException') {
                setError("Please fill in 'Current Password' field correctly.");
            }

            if (error.name === 'LimitExceededException') {
                setError(error.message);
            }
        }
    };

    const validationSchema = Yup.object().shape({
        currentPassword: Yup.string().required(UseLangMessage('Current password', ValidationMessage.requiredFront)),
        newPassword: Yup.string()
            .matches(Password.default, UseLangMessage('New password', ValidationMessage.matchesPasswordDefault))
            .required(UseLangMessage('New password', ValidationMessage.requiredFront)),
        confirmNewPassword: Yup.string()
            .required(UseLangMessage('Confirm password', ValidationMessage.requiredFront))
            .oneOf(
                [Yup.ref('newPassword'), null],
                UseLangMessage('New password', ValidationMessage.matchesPasswordOfConfirmPassword)
            ),
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
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    };

    return (
        <>
            <Formik
                initialValues={initialValues}
                onSubmit={saveNewPassword}
                validateOnChange={false}
                enableReinitialize={true}
                validationSchema={validationSchema}
            >
                {(props) => {
                    setErrorsMessageFormik(props.errors, setError);
                    return (
                        <FrontModal
                            header={'Change password'}
                            visible={isOpenModal}
                            onHide={closeModal(props)}
                            footer={renderFooter(props)}
                            dismissableMask={true}
                            position={'top'}
                        >
                            <Form id={'changePasswordForm'}>
                                {error && (
                                    <div className="alert alert-danger mb" role="alert">
                                        {error}
                                    </div>
                                )}
                                <div className="textbox mb">
                                    <p>Your password must be at least 8 characters and include a number.</p>
                                </div>
                                <div className="form_status"></div>
                                <div className="form-group">
                                    <FrontInput
                                        required={true}
                                        label={'Current password'}
                                        value={props.values.currentPassword}
                                        name={'currentPassword'}
                                        onChange={props.handleChange}
                                        type={InputType.password}
                                    />
                                </div>
                                <div className="form-group">
                                    <FrontInput
                                        required={true}
                                        label={'New password'}
                                        value={props.values.newPassword}
                                        name={'newPassword'}
                                        onChange={props.handleChange}
                                        type={InputType.password}
                                    />
                                </div>
                                <div className="form-group">
                                    <FrontInput
                                        required={true}
                                        label={'Confirm new password'}
                                        value={props.values.confirmNewPassword}
                                        name={'confirmNewPassword'}
                                        onChange={props.handleChange}
                                        type={InputType.password}
                                    />
                                </div>
                            </Form>
                        </FrontModal>
                    );
                }}
            </Formik>
        </>
    );
});
export default ProfileChangePasswordForm;
