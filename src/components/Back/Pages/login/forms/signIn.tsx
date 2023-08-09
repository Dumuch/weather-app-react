import { SignInFormData } from '../../../../../models/login/sign-in';
import React, { FunctionComponent, useState } from 'react';
import Link from 'next/link';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { Button } from 'primereact/button';
import { FormField } from '../../../Form/form-field';
import { PwdFormField } from '../../../Form/pwd-form-field';
import { Auth } from '@aws-amplify/auth';
import { useRouter } from 'next/router';
import { BackRoutesList } from '../../BackRoutesList';
import { FormCheckbox } from '../../../Form/form-checkbox';
import { DashboardNotificationField } from '../../../dashboard/notificationField';
import Head from 'next/head';
import { useStores } from '../../../../../store';
import { FetchUser, SignOut } from '../../../../../utils/amplifyHelpers';
import { AMPLIFY_SESSION_STORAGE } from '../../../../../utils/constants';

interface Props {
    messageError: string | null;
}

type FormProps = Props & FormikProps<SignInFormData>;

const InternalSignInForm: FunctionComponent<FormProps> = (props) => {
    const formName = 'sign-in-form';
    const isLoading = !props.isValidating && props.isSubmitting;

    return (
        <>
            <Form noValidate className="login-form-wrap">
                <div className="login-form-header" />
                <div className="login-form-body">
                    <DashboardNotificationField
                        className="form-group"
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
                    <PwdFormField type={'password'} formName={formName} field={'pwd'} placeholder="Password" />

                    <div className="form-group mt-7">
                        <Button
                            label={'Login'}
                            className={'button button-green'}
                            formAction={'submit'}
                            loading={isLoading}
                        />
                    </div>

                    <FormCheckbox className={'mt-5'} formName={formName} field={'remember'} label={'Remember me'} />
                </div>
                <div className="login-form-footer">
                    <Link href={BackRoutesList.ForgotPwd}>Forgot your password?</Link>
                </div>
            </Form>
        </>
    );
};
export const SignInForm: FunctionComponent = () => {
    const initialValues: SignInFormData = {
        email: '',
        pwd: '',
        remember: false,
    };

    const { userStore } = useStores();

    const router = useRouter();
    const [messageError, setMessageError] = useState<string | null>(null);
    const handleSubmit = async (values: SignInFormData, formikHelpers: FormikHelpers<SignInFormData>) => {
        if (values.email.length === 0 || values.pwd.length === 0) {
            setMessageError('Please enter Username and Password');
        } else {
            Auth.configure({ storage: values.remember ? localStorage : sessionStorage });
            try {
                await SignOut(userStore).then(async () => {
                    sessionStorage.removeItem(AMPLIFY_SESSION_STORAGE);
                    userStore.isFetched = false;
                    const amplifyUser = await Auth.signIn(values.email, values.pwd);
                    if (!values.remember) {
                        sessionStorage.setItem(AMPLIFY_SESSION_STORAGE, '1');
                    }
                    await FetchUser(userStore);
                    if (userStore.user?.isAdmin) {
                        if (amplifyUser) router.replace(BackRoutesList.Dashboard);
                    } else {
                        setMessageError(
                            "Please check your entry and try again. If you still can't log in, contact your system administrator."
                        );
                        await SignOut(userStore);
                    }
                });
            } catch (error: any) {
                setMessageError(
                    "Please check your entry and try again. If you still can't log in, contact your system administrator."
                );
            }
        }

        formikHelpers.setSubmitting(false);
    };

    return (
        <>
            <Head>
                <title>Welcome to Admin Panel</title>
                <link href="/assets/css/prime-core.min.css" rel="stylesheet" />
                <link href="/assets/css/manager.min.css" rel="stylesheet" />
            </Head>
            <Formik<SignInFormData> initialValues={initialValues} onSubmit={handleSubmit}>
                {(props) => <InternalSignInForm {...{ ...props, messageError }} />}
            </Formik>
        </>
    );
};
