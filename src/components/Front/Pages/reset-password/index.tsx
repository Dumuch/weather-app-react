import React, { FunctionComponent, useState } from 'react';
import { useStores } from '../../../../store';
import { useRouter } from 'next/router';
import { getLastErrorMessage, setErrorsMessageFormik, UseLangMessage } from '../../../../utils/helpers';
import * as Yup from 'yup';
import { Password } from '../../../../config/validate';
import { Form, Formik } from 'formik';
import Link from 'next/link';
import { FrontRoutesList } from '../FrontRoutesList';
import { AlertType, FrontNotificationField } from '../../Global/notificationField';
import FrontInput, { InputType } from '../../Global/input';
import { FrontButton } from '../../Global/button';
import { ValidationMessage } from '../../../../lang/en/validatons';

interface initialValuesInterface {
    password: string;
    confirmPassword: string;
}

export const ResetPwdForm: FunctionComponent = () => {
    const { userStore } = useStores();
    const router = useRouter();
    const [errorEditPassword, setErrorEditPassword] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState(false);

    const onSubmit = async (props: initialValuesInterface) => {
        setSuccessMessage(false);
        setErrorEditPassword(null);
        if (typeof router.query.key === 'string') {
            try {
                await userStore.changePassword(router.query.key, props);
                setSuccessMessage(true);
            } catch (e: any) {
                setErrorEditPassword(getLastErrorMessage(e));
            }
        } else {
            setErrorEditPassword('Token is either invalid or expired.');
        }
    };

    const initialValues: initialValuesInterface = {
        password: '',
        confirmPassword: '',
    };

    const validationSchema = Yup.object().shape({
        password: Yup.string()
            .matches(Password.default, UseLangMessage('New password', ValidationMessage.matchesPasswordDefault))
            .required(UseLangMessage('New password', ValidationMessage.requiredFront)),
        confirmPassword: Yup.string()
            .matches(Password.default, UseLangMessage('Confirm new password', ValidationMessage.matchesPasswordDefault))
            .required(UseLangMessage('Confirm new password', ValidationMessage.requiredFront))
            .oneOf(
                [Yup.ref('password'), null],
                UseLangMessage('Confirm new password', ValidationMessage.matchesPasswordOfConfirmPassword)
            ),
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
                setErrorsMessageFormik(props.errors, setErrorEditPassword);
                return (
                    <section className="content-section">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6 col-lg-offset-3 col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2 indent-left indent-right">
                                    <h1 className="h2-style">Reset your password</h1>
                                    <div className="textbox mb">
                                        <p>
                                            The security of your account is important to us. Your password must be at
                                            least 8 characters and include a number.
                                        </p>
                                    </div>
                                    {successMessage ? (
                                        <FrontNotificationField
                                            alertType={AlertType.success}
                                            message={'Your password has been successfully changed.'}
                                        />
                                    ) : (
                                        <div className="form-wrap mb">
                                            <FrontNotificationField
                                                message={errorEditPassword}
                                                alertType={AlertType.danger}
                                            />
                                            <Form>
                                                <div className="form-group mb">
                                                    <FrontInput
                                                        required={true}
                                                        label={'New password'}
                                                        value={props.values.password}
                                                        name={'password'}
                                                        type={InputType.password}
                                                        onChange={props.handleChange}
                                                    />
                                                </div>
                                                <div className="form-group mb">
                                                    <FrontInput
                                                        required={true}
                                                        label={'Confirm new password'}
                                                        value={props.values.confirmPassword}
                                                        name={'confirmPassword'}
                                                        type={InputType.password}
                                                        onChange={props.handleChange}
                                                    />
                                                </div>
                                                <div className="form-group form-footer justified">
                                                    <div>
                                                        <FrontButton
                                                            className={'btn btn-primary'}
                                                            type={'submit'}
                                                            loading={props.isSubmitting}
                                                        >
                                                            SUBMIT
                                                        </FrontButton>
                                                    </div>
                                                    <div>
                                                        <Link href={FrontRoutesList.SignIn}>
                                                            <a>Back to Login page</a>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </Form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            }}
        </Formik>
    );
};
