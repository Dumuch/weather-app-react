import { UserType } from '../../../../models/api';
import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { useStores } from '../../../../store';
import { FetchUser, SetExpiredSession, SignOut } from '../../../../utils/amplifyHelpers';
import { Auth } from '@aws-amplify/auth';
import { FrontRoutesList } from '../FrontRoutesList';
import { Form, Formik } from 'formik';
import Link from 'next/link';
import { FrontButton } from '../../Global/button';
import FrontInput, { InputType } from '../../Global/input';

interface initialValuesInterface {
    email: string;
    password: string;
    userType: UserType | null;
}

const LoginSection: FunctionComponent = observer(() => {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { userStore } = useStores();

    const onSubmit = async (props: initialValuesInterface) => {
        setError(null);

        if (!props.email || !props.password) {
            setError('Wrong Email or Password');
            return;
        }
        try {
            await SignOut(userStore).then(async () => {
                SetExpiredSession();
                userStore.countErrors = 0;
                userStore.isFetched = false;
                const amplifyUser = await Auth.signIn(props.email.trim(), props.password);
                await FetchUser(userStore);
                userStore.setUserType(props.userType);

                if (userStore.user && !userStore.user.isAdmin && amplifyUser) {
                    router.replace(FrontRoutesList.Dashboard);
                } else {
                    setError('Wrong Email or Password');
                    await SignOut(userStore);
                }
            });
        } catch (e: any) {
            setError('Wrong Email or Password');
        }
    };

    const initialValues: initialValuesInterface = {
        email: '',
        password: '',
        userType: UserType.guest,
    };
    return (
        <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize={true}>
            {(props) => {
                return (
                    <section className="content-section">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6 col-lg-offset-3 col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2 indent-left indent-right">
                                    <h1 className="h2-style">Welcome</h1>
                                    <div className="textbox mb">
                                        <p>
                                            Sign in to your account. Don&apos;t have an account?{' '}
                                            <Link href={FrontRoutesList.SignUp}>
                                                <a>Sign Up here</a>
                                            </Link>
                                        </p>
                                    </div>
                                    {error && (
                                        <div className="alert alert-danger mb" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <div className="sep bg-color-light-grey mb"></div>
                                    <div className="form-wrap mb">
                                        <Form>
                                            <div className="form-group mb inline-label">
                                                <label>
                                                    <strong>Log in as:</strong>
                                                </label>
                                                <fieldset>
                                                    <span className="button-switch">
                                                        <label>
                                                            <input
                                                                checked={props.values.userType === UserType.guest}
                                                                type="radio"
                                                                name="userType"
                                                                value={UserType.guest}
                                                                onChange={props.handleChange}
                                                            />
                                                            <span className="title">Guest</span>
                                                        </label>
                                                        <label>
                                                            <input
                                                                type="radio"
                                                                name="userType"
                                                                value={UserType.host}
                                                                onChange={props.handleChange}
                                                            />
                                                            <span className="title">Host</span>
                                                        </label>
                                                    </span>
                                                </fieldset>
                                            </div>
                                            <div className="form-group mb">
                                                <FrontInput
                                                    label={'Email'}
                                                    value={props.values.email}
                                                    name={'email'}
                                                    onChange={props.handleChange}
                                                    autocomplete={true}
                                                />
                                            </div>
                                            <div className="form-group mb">
                                                <FrontInput
                                                    label={'Password'}
                                                    value={props.values.password}
                                                    type={InputType.password}
                                                    name={'password'}
                                                    onChange={props.handleChange}
                                                    autocomplete={true}
                                                />
                                            </div>
                                            <div className="form-group form-footer justified">
                                                <div>
                                                    <FrontButton
                                                        className={'btn btn-primary'}
                                                        type={'submit'}
                                                        loading={props.isSubmitting}
                                                    >
                                                        LOG IN
                                                    </FrontButton>
                                                </div>
                                                <div>
                                                    <Link href={FrontRoutesList.ForgotPwd}>
                                                        <a href={FrontRoutesList.ForgotPwd}>Forgot Password?</a>
                                                    </Link>
                                                </div>
                                            </div>
                                        </Form>
                                    </div>
                                    <div className="textbox">
                                        <p>
                                            By signing in to your account, you agree to our{' '}
                                            <Link href={FrontRoutesList.TermsAndConditions}>
                                                <a>Terms &amp; Conditions</a>
                                            </Link>{' '}
                                            &{' '}
                                            <Link href={FrontRoutesList.PrivacyPolicy}>
                                                <a>Privacy Policy.</a>
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            }}
        </Formik>
    );
});
export default LoginSection;
