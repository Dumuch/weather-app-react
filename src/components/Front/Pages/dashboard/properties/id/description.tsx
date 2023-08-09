import React, { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../store';
import { FrontButton } from '../../../../Global/button';
import { Property, PropertyDescription } from '../../../../../../models/api/property';
import FrontInput, { InputType } from '../../../../Global/input';
import * as Yup from 'yup';
import { setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';

interface initialValuesInterface {
    id: string;
    name: string;
    description: string;
}

interface Props {
    property: Property;
}

const PropertySectionDescriptionForm: FunctionComponent<Props> = observer(({ property }) => {
    const [onlyRead, setOnlyRead] = useState(true);
    const { propertiesStore, userStore, globalStore } = useStores();

    let error: string | null = '';
    const setError = (err: string | null) => (error = err);

    const activeForm = () => setOnlyRead(false);
    const resetForm = (props: FormikProps<initialValuesInterface>) =>
        function () {
            setOnlyRead(true);
            props.resetForm();
            setError(null);
        };

    const onSubmit = async (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        try {
            await propertiesStore.updateItem(props, false);
            userStore.properties.isFetched = false;
            userStore.isFetched = false;
            setOnlyRead(true);
            globalStore.showToast({
                severity: 'success',
                detail: `The property description has been updated`,
            });
        } catch (e) {}

        formikHelpers.setSubmitting(false);
    };

    const initialValues: initialValuesInterface = {
        id: property.id ?? '',
        name: property.name ?? '',
        description: property.description ?? '',
    };
    const validationSchema = Yup.object().shape({
        name: Yup.string().required(UseLangMessage('Property Name/Title', ValidationMessage.requiredFront)),
        description: Yup.string().required(UseLangMessage('Rental Description', ValidationMessage.requiredFront)),
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
                setErrorsMessageFormik(props.errors, setError);
                return (
                    <>
                        <FrontNotificationField alertType={AlertType.danger} message={error} />

                        <Form method="post">
                            <div className="form-wrap">
                                <div className="form-group mb">
                                    <FrontInput
                                        label={'Property Name/Title'}
                                        required={true}
                                        value={props.values.name}
                                        name={'name'}
                                        onChange={props.handleChange}
                                        readOnly={onlyRead}
                                    />
                                </div>
                                <div className="form-group mb">
                                    <FrontInput
                                        label={'Rental Description'}
                                        required={true}
                                        value={props.values.description}
                                        name={'description'}
                                        type={InputType.textarea}
                                        onChange={props.handleChange}
                                        readOnly={onlyRead}
                                    />
                                </div>
                            </div>
                            <div className="form-footer has-border-top">
                                {onlyRead ? (
                                    <FrontButton className={'btn-primary'} type={'button'} onClick={activeForm}>
                                        Edit information
                                    </FrontButton>
                                ) : (
                                    <>
                                        <div>
                                            <FrontButton
                                                className={'btn-primary'}
                                                type={'submit'}
                                                loading={props.isSubmitting}
                                            >
                                                SAVE CHANGES
                                            </FrontButton>
                                        </div>
                                        <div>
                                            <FrontButton
                                                className={'btn-border'}
                                                type={'button'}
                                                onClick={resetForm(props)}
                                            >
                                                CANCEL
                                            </FrontButton>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Form>
                    </>
                );
            }}
        </Formik>
    );
});
export default PropertySectionDescriptionForm;
