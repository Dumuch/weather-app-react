import { Form, Formik, FormikHelpers } from 'formik';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useState } from 'react';
import { Element, scroller } from 'react-scroll';
import * as Yup from 'yup';
import { ValidationMessage } from '../../../../lang/en/validatons';
import { UserInfo } from '../../../../models/api';
import { HelpRequest, HelpTopic } from '../../../../models/api/helpCenter';
import { useStores } from '../../../../store';
import { setErrorsMessageFormik, UseLangMessage } from '../../../../utils/helpers';
import { FrontButton } from '../../Global/button';
import { FrontDropdown } from '../../Global/dropdown';
import FrontInput, { InputType } from '../../Global/input';
import { AlertType, FrontNotificationField } from '../../Global/notificationField';

interface Props {
    topicsList: HelpTopic[];
}

const RequestForm: FC<Props> = observer(({ topicsList }) => {
    const { userStore, helpRequestStore } = useStores();
    const [user, setUser] = useState<UserInfo | null>(null);
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');

    const initialValues: HelpRequest = {
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        topic: '',
        body: '',
    };

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required(UseLangMessage('First Name', ValidationMessage.requiredFront)),
        lastName: Yup.string().required(UseLangMessage('Last Name', ValidationMessage.requiredFront)),
        email: Yup.string()
            .required(UseLangMessage('Email', ValidationMessage.requiredFront))
            .email(UseLangMessage('Email', UseLangMessage('Email', ValidationMessage.invalid))),
        body: Yup.string().required(UseLangMessage('What do you need help with?', ValidationMessage.requiredFront)),
    });

    useEffect(() => {
        if (errors?.length) {
            scroller.scrollTo('notificationScrollToElement', {
                duration: 1000,
                smooth: true,
                offset: -100,
            });
        }
    }, [errors]);

    const onSubmit = async (values: HelpRequest, forikHelpers: FormikHelpers<HelpRequest>) => {
        setErrors(null);
        setSuccess(null);
        await helpRequestStore.createHelpRequest(values);
        setSuccess('Your request has been submitted successfully.');
        forikHelpers.resetForm();
    };

    useEffect(() => {
        userStore.user && setUser(userStore.user);
    }, [userStore, userStore.isLoading]);

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            enableReinitialize={true}
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setErrors);
                return (
                    <div className="col-sm-6 indent-left help-request-block">
                        <div className="content-section">
                            <h2 className="h4-style mb-big">Help Request</h2>
                            <Element name="notificationScrollToElement" />
                            <Form>
                                <div className="form-wrap mb">
                                    <div className="textbox mb">
                                        <p>
                                            Use the form below to describe the issue you&apos;re having. Our support
                                            team will respond to you as quickly as possible, in most cases within 24
                                            hours. If your request is regarding a specific reservation, please include
                                            the confirmation number in the message box below.
                                        </p>
                                    </div>
                                    <FrontNotificationField alertType={AlertType.danger} message={errors} />
                                    <FrontNotificationField alertType={AlertType.success} message={success} />
                                    <div className="row mb">
                                        <div className="col-md-6 col-sm-12 mb-sm">
                                            <div className="form-group mb">
                                                <div className="input-wrap">
                                                    <FrontInput
                                                        label="First Name"
                                                        value={props.values.firstName}
                                                        name="firstName"
                                                        onChange={props.handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-sm-12 mb-sm">
                                            <div className="form-group mb">
                                                <div className="input-wrap">
                                                    <FrontInput
                                                        label="Last Name"
                                                        value={props.values.lastName}
                                                        name="lastName"
                                                        onChange={props.handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-md-6 col-sm-12 mb-sm">
                                            <div className="form-group mb">
                                                <div className="input-wrap">
                                                    <FrontInput
                                                        label="Email"
                                                        value={props.values.email}
                                                        name="email"
                                                        onChange={props.handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-sm-12 mb-sm">
                                            <div className="form-group mb">
                                                <FrontDropdown
                                                    optionValue="name"
                                                    optionLabel="name"
                                                    label="Topic"
                                                    id="topic"
                                                    value={props.values.topic}
                                                    options={topicsList}
                                                    handlerDropdown={props.handleChange}
                                                    name="topic"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-md-12 col-sm-12 mb-sm">
                                            <div className="input-wrap">
                                                <FrontInput
                                                    type={InputType.textarea}
                                                    classWrapper="opaque-label"
                                                    id="body"
                                                    name="body"
                                                    value={props.values.body}
                                                    onChange={props.handleChange}
                                                    label="What do you need help with?"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-footer">
                                    <FrontButton
                                        className={'btn btn-primary'}
                                        type={'submit'}
                                        loading={props.isSubmitting}
                                    >
                                        Submit
                                    </FrontButton>
                                </div>
                            </Form>
                        </div>
                    </div>
                );
            }}
        </Formik>
    );
});

export default RequestForm;
