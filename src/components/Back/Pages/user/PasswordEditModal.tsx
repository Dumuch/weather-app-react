import { Dialog } from 'primereact/dialog';
import { Form, Formik, FormikHelpers } from 'formik';
import { DashBoardInput } from '../../dashboard/input';
import React, { FunctionComponent, useState } from 'react';
import { DashboardNotificationField } from '../../dashboard/notificationField';
import { Button } from 'primereact/button';
import { Password } from '../../../../config/validate';
import { ChangePassword } from '../../../../utils/amplifyHelpers';
import { useStores } from '../../../../store';
import * as Yup from 'yup';
import { setErrorsMessageFormik, UseLangMessage } from '../../../../utils/helpers';
import { ValidationMessage } from '../../../../lang/en/validatons';

export interface Props {
    isOpenModal: boolean;
    closeModal: () => void;
}

export interface initialValuesEditPasswordInterface {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

const PasswordEditModal: FunctionComponent<Props> = ({ isOpenModal, closeModal }) => {
    const { globalStore } = useStores();
    const [errorEditPassword, setErrorEditPassword] = useState<string | null>(null);

    const closeModalEditPassword = (actions: FormikHelpers<initialValuesEditPasswordInterface>) => {
        closeModal();
        setErrorEditPassword(null);
        actions.resetForm();
    };

    const saveNewPassword = async (
        props: initialValuesEditPasswordInterface,
        actions: FormikHelpers<initialValuesEditPasswordInterface>
    ) => {
        setErrorEditPassword(null);
        try {
            const data = await ChangePassword(props.currentPassword, props.newPassword);
            if (data) {
                globalStore.showToast({
                    severity: 'success',
                    detail: 'Your password has been changed',
                });
                closeModalEditPassword(actions);
            }
        } catch (error: any) {
            if (error.name === 'NotAuthorizedException') {
                setErrorEditPassword("Please fill in 'Current Password' field correctly.");
            }

            if (error.name === 'LimitExceededException') {
                setErrorEditPassword(error.message);
            }
        }
    };
    const validationSchema = Yup.object().shape({
        currentPassword: Yup.string()
            .matches(Password.default, UseLangMessage('Current Password', ValidationMessage.matchesPasswordDefault))
            .required(UseLangMessage('Current Password', ValidationMessage.requiredBack)),
        newPassword: Yup.string()
            .matches(Password.default, UseLangMessage('New Password', ValidationMessage.matchesPasswordDefault))
            .required(UseLangMessage('New Password', ValidationMessage.requiredBack)),
        confirmNewPassword: Yup.string()
            .matches(Password.default, UseLangMessage('Confirm Password', ValidationMessage.matchesPasswordDefault))
            .required(UseLangMessage('Confirm Password', ValidationMessage.requiredBack))
            .oneOf(
                [Yup.ref('newPassword'), null],
                UseLangMessage('Confirm Password', ValidationMessage.matchesPasswordOfConfirmPassword)
            ),
    });

    const initialValuesEditPassword: initialValuesEditPasswordInterface = {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    };
    const footerModal = (isSubmitting: boolean) => {
        return (
            <div>
                <Button label="Cancel" className={'p-button-default'} onClick={closeModal} />
                <Button
                    label="Save"
                    loading={isSubmitting}
                    form="editPasswordForm"
                    className={'p-button-primary'}
                    icon="pi pi-save pr-3"
                    type={'submit'}
                />
            </div>
        );
    };
    return (
        <Formik
            initialValues={initialValuesEditPassword}
            onSubmit={saveNewPassword}
            enableReinitialize={true}
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setErrorEditPassword);
                return (
                    <Dialog
                        header="Change Password"
                        visible={isOpenModal}
                        style={{ width: '40vw' }}
                        onHide={() => closeModalEditPassword(props)}
                        footer={footerModal(props.isSubmitting)}
                        dismissableMask
                        draggable={false}
                    >
                        <Form id={'editPasswordForm'}>
                            <DashboardNotificationField
                                className="form-group"
                                message={errorEditPassword}
                            ></DashboardNotificationField>
                            <div className="form-horizontal">
                                <div className="form-group">
                                    <label className="sm:col-3 control-label">Current Password:</label>
                                    <div className="sm:col-9">
                                        <DashBoardInput
                                            value={props.values.currentPassword}
                                            setValue={props.handleChange}
                                            className={'form-control'}
                                            type={'password'}
                                            name={'currentPassword'}
                                            required={true}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="sm:col-3 control-label">New Password:</label>
                                    <div className="sm:col-9">
                                        <DashBoardInput
                                            value={props.values.newPassword}
                                            setValue={props.handleChange}
                                            className={'form-control'}
                                            type={'password'}
                                            name={'newPassword'}
                                            required={true}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="sm:col-3 control-label">Confirm New Password:</label>
                                    <div className="sm:col-9">
                                        <DashBoardInput
                                            value={props.values.confirmNewPassword}
                                            setValue={props.handleChange}
                                            className={'form-control'}
                                            type={'password'}
                                            name={'confirmNewPassword'}
                                            required={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </Dialog>
                );
            }}
        </Formik>
    );
};

export default PasswordEditModal;
