import React, { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import Link from 'next/link';

import { Button } from 'primereact/button';
import { ForgotPwdFormData } from '../../../../../models/login/forgot-pwd';
import { FormField } from '../../../Form/form-field';
import { BackRoutesList } from '../../BackRoutesList';
import { Auth } from '@aws-amplify/auth';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { PwdFormField } from '../../../Form/pwd-form-field';
import { DashboardNotificationField } from '../../../dashboard/notificationField';
import Head from 'next/head';
import { useStores } from '../../../../../store';

interface Props {
    showCode: boolean;
    messageError: string | null;
}

type FormProps = Props & FormikProps<ForgotPwdFormData>;

const InternalForgotPwdForm: FunctionComponent<FormProps> = (props) => {
    const { showCode } = { ...props };

    const formName = 'sign-in-form';
    const isLoading = !props.isValidating && props.isSubmitting;

    return (
        <>
            <Form noValidate className="login-form-wrap">
                <div className="login-form-header">
                    <h1 className="color-white">Forgot your password?</h1>
                </div>
                <div className="login-form-body">
                    <div className="form-group mb-3">
                        <p className="form-control-static color-blue-grey-light">
                            Enter your email and we&apos;ll send you a code to reset your password
                        </p>
                    </div>

                    <DashboardNotificationField
                        className={'form-group'}
                        message={props.messageError}
                    ></DashboardNotificationField>
                    <FormField
                        className="form-group"
                        classIcon={'pi-user'}
                        type={'email'}
                        formName={formName}
                        field={'email'}
                        placeholder={'Email address'}
                        isFirst
                    />

                    {showCode && (
                        <>
                            <PwdFormField type={'password'} formName={formName} field={'pwd'} placeholder="Password" />
                            <FormField
                                className="form-group"
                                type={'text'}
                                formName={formName}
                                field={'code'}
                                placeholder={'Code'}
                                classIcon={'pi-info-circle'}
                            />
                        </>
                    )}
                    <div className="form-group mb-7 mt-7">
                        <Button
                            loading={isLoading}
                            label={'Send'}
                            className={'button button-green'}
                            formAction={'submit'}
                        />
                    </div>
                </div>
                <div className="login-form-footer">
                    <Link href={BackRoutesList.SignIn} passHref>
                        <a href={BackRoutesList.SignIn}>
                            <span className="pi pi-arrow-left"></span>
                            <span className="ml-3">Back to login</span>
                        </a>
                    </Link>
                </div>
            </Form>
        </>
    );
};

export const ForgotPwdForm: FunctionComponent = () => {
    const router = useRouter();
    const [showCode, setShowCode] = useState<boolean>(false);
    const [messageError, setMessageError] = useState<string | null>(null);
    const { userStore } = useStores();

    const initialValues: ForgotPwdFormData = {
        email: '',
        pwd: '',
        code: '',
    };

    const handleSubmit = async (values: ForgotPwdFormData, formikHelpers: FormikHelpers<ForgotPwdFormData>) => {
        setMessageError('');
        try {
            if (showCode) {
                await Auth.forgotPasswordSubmit(values.email, values.code!, values.pwd!);
                const amplifyUser = await Auth.signIn(values.email, values.pwd);
                if (amplifyUser) {
                    router.reload();
                } else {
                    throw new Error();
                }
            } else {
                const { data } = await userStore.isAdminUser(values.email);
                if (data) {
                    await Auth.forgotPassword(values.email);
                    setShowCode(true);
                } else {
                    throw new Error();
                }
            }
        } catch (error: any) {
            setMessageError('We could not find an account for that  email address. Please try again.');
        }

        formikHelpers.setSubmitting(false);
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().required('required').email('invalid email format'),
    });

    return (
        <>
            <Head>
                <title>Welcome to Admin Panel</title>
                <link href="/assets/css/prime-core.min.css" rel="stylesheet" />
                <link href="/assets/css/manager.min.css" rel="stylesheet" />
            </Head>
            <Formik<ForgotPwdFormData>
                validationSchema={validationSchema}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validateOnChange={false}
            >
                {(props) => {
                    const data = { messageError, showCode, ...props };
                    return <InternalForgotPwdForm {...data} />;
                }}
            </Formik>
        </>
    );
};
