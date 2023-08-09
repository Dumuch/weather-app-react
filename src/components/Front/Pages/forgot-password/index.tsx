import React, { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import FrontInput from '../../Global/input';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { FrontButton } from '../../Global/button';
import { FrontRoutesList } from '../FrontRoutesList';
import { useStores } from '../../../../store';
import { SignOut } from '../../../../utils/amplifyHelpers';
import Link from 'next/link';
import { getLastErrorMessage, setErrorsMessageFormik, UseLangMessage } from '../../../../utils/helpers';
import { AlertType, FrontNotificationField } from '../../Global/notificationField';
import { ValidationMessage } from '../../../../lang/en/validatons';

interface Props {
    messageError: string | null;
    successMessage: boolean;
}

interface initialValuesInterface {
    email: string;
}

type FormProps = Props & FormikProps<initialValuesInterface>;

const InternalForgotPwdForm: FunctionComponent<FormProps> = (props) => {
    const { messageError, successMessage } = { ...props };
    return (
        <>
            <section className="content-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-lg-offset-3 col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2 indent-left indent-right">
                            <h1 className="h2-style">Forgot Your Password?</h1>
                            <div className="textbox mb">
                                <p>
                                    No problem! We&apos;ll send you a link to reset it. Enter the email address you use
                                    to sign in to BidBookStay.com below.
                                </p>
                            </div>
                            <div className="form-wrap mb">
                                {successMessage ? (
                                    <div className="alert alert-success mb" role="alert">
                                        The reset password link has been successfully sent.
                                    </div>
                                ) : (
                                    <>
                                        <FrontNotificationField message={messageError} alertType={AlertType.danger} />
                                        <Form noValidate>
                                            <div className="form-group mb">
                                                <FrontInput
                                                    label={'Email'}
                                                    value={props.values.email}
                                                    name={'email'}
                                                    onChange={props.handleChange}
                                                    required={true}
                                                />
                                            </div>
                                            <div className="form-group form-footer justified">
                                                <div>
                                                    <FrontButton
                                                        className={'btn btn-primary'}
                                                        type={'submit'}
                                                        loading={props.isSubmitting}
                                                    >
                                                        SEND
                                                    </FrontButton>
                                                </div>
                                                <div>
                                                    <Link href={FrontRoutesList.SignIn}>
                                                        <a>Back to Login page</a>
                                                    </Link>
                                                </div>
                                            </div>
                                        </Form>
                                    </>
                                )}
                            </div>
                            <div className="textbox">
                                <p>
                                    If you still need help,&nbsp;
                                    <Link href={FrontRoutesList.HelpRequest}>
                                        <a>contact us</a>
                                    </Link>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export const ForgotPwdForm: FunctionComponent = () => {
    const [messageError, setMessageError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState(false);
    const { userStore } = useStores();

    const initialValues: initialValuesInterface = {
        email: '',
    };

    const handleSubmit = async (
        values: initialValuesInterface,
        formikHelpers: FormikHelpers<initialValuesInterface>
    ) => {
        setMessageError(null);
        try {
            await SignOut(userStore).then(async () => {
                await userStore.forgotPassword(values.email);
                setSuccessMessage(true);
            });
            formikHelpers.resetForm();
        } catch (error: any) {
            setMessageError('Please fill in correct "Email" field');
        }

        formikHelpers.setSubmitting(false);
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .required(UseLangMessage('Email', ValidationMessage.requiredFront))
            .email(UseLangMessage('Email', ValidationMessage.invalid)),
    });

    return (
        <>
            <Formik<initialValuesInterface>
                validationSchema={validationSchema}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validateOnChange={false}
            >
                {(props) => {
                    setErrorsMessageFormik(props.errors, setMessageError);
                    const data = { messageError, successMessage, ...props };
                    return <InternalForgotPwdForm {...data} />;
                }}
            </Formik>
        </>
    );
};
