import React, { FunctionComponent, useState } from 'react';
import { User } from '../../../../models/api';
import { DashBoardInput } from '../../dashboard/input';
import SavePanel from '../../dashboard/SavePanel';
import { DashBoardPanel } from '../../dashboard/Panel';
import { DashboardSection } from '../../dashboard/Section';
import { Form, Formik, FormikProps } from 'formik';
import { InputSwitch } from 'primereact/inputswitch';
import { confirmDialog } from 'primereact/confirmdialog';
import { dialog } from '../../../../utils/confirmDialogConstants';
import { useStores } from '../../../../store';
import { DashBoardImage } from '../../dashboard/image';
import { Button } from 'primereact/button';
import PasswordEditModal from './PasswordEditModal';

export interface Props {
    user: User;
}

export interface initialValuesInterface {
    id: string;
    active: boolean;
    firstName: string;
    lastName: string;
    email: string;
    displayName: string;
    profilePicture?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    governmentIssuedIDPhoto?: string;
    isAdmin: boolean;
    stripeAccountId: string | null;
}

export const UserEdit: FunctionComponent<Props> = ({ user }) => {
    const [modalEditPassword, setModalEditPassword] = useState(false);
    const { usersStore, userStore } = useStores();

    const onSubmit = (props: initialValuesInterface) => {
        usersStore.updateItem({ ...user, ...props });
    };

    const handleCancel = (formik: FormikProps<initialValuesInterface>) => {
        confirmDialog({
            ...dialog.warn,
            accept: () => formik.resetForm(),
        });
    };

    const isCurrentUser = user.id === userStore.user?.id;
    const closeModal = () => setModalEditPassword(false);

    const initialValues: initialValuesInterface = {
        active: user.active,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture ?? '',
        phone: user.phone ?? '',
        address1: user.address1 ?? '',
        address2: user.address2 ?? '',
        city: user.city ?? '',
        state: user.state ?? '',
        zip: user.zip ?? '',
        governmentIssuedIDPhoto: user.governmentIssuedIDPhoto,
        isAdmin: user.isAdmin,
        id: user.id,
        stripeAccountId: user.stripeAccountId || null,
    };
    return (
        <>
            <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize={true}>
                {(props) => {
                    return (
                        <Form>
                            <div className="grid">
                                <DashboardSection sectionTitle="General">
                                    <DashBoardPanel>
                                        <div className="form-horizontal">
                                            <div className="form-group">
                                                <label className="sm:col-2 control-label">First Name:</label>
                                                <div className="sm:col-10 p-0">
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={props.values.firstName}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="sm:col-2 control-label">Last Name:</label>
                                                <div className="sm:col-10 p-0">
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={props.values.lastName}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="sm:col-2 control-label">Email:</label>
                                                <div className="sm:col-10 p-0">
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={props.values.email}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                    />
                                                </div>
                                            </div>
                                            {isCurrentUser && (
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">Password:</label>
                                                    <div className="sm:col-10 p-0 pt-0">
                                                        <Button
                                                            onClick={() => setModalEditPassword(true)}
                                                            type={'button'}
                                                            label="Edit"
                                                            icon="pi pi-pencil pr-3"
                                                            className={'p-button-primary'}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="form-group">
                                                <label className="sm:col-2 control-label">Admin?:</label>
                                                <div className="sm:col-10 p-0">
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={props.values.isAdmin ? 'Yes' : 'No'}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="sm:col-2 control-label">Stripe Account ID:</label>
                                                <div className="sm:col-10 p-0">
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={props.values.stripeAccountId || 'None'}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="sm:col-2 control-label">Active?:</label>
                                                <div className="sm:col-10 p-0">
                                                    <InputSwitch
                                                        checked={props.values.active}
                                                        name={'active'}
                                                        onChange={props.handleChange}
                                                        disabled={isCurrentUser}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </DashBoardPanel>
                                </DashboardSection>

                                <div className="col-4 pr-5 pl-5">
                                    <h2>&nbsp;</h2>
                                    <SavePanel
                                        timestamp={{
                                            createdAt: user.createdAt,
                                            updatedAt: user.updatedAt,
                                        }}
                                        inputsDisabled
                                        formikProps={props}
                                    >
                                        <div className="controls-group-right">
                                            <SavePanel.CancelButton
                                                onClick={() => handleCancel(props)}
                                                className="p-button-default"
                                            >
                                                Cancel
                                            </SavePanel.CancelButton>
                                            <SavePanel.SaveButton className="p-button-primary">
                                                <i className="pi pi-save pr-3"></i>
                                                Save
                                            </SavePanel.SaveButton>
                                        </div>
                                    </SavePanel>
                                </div>

                                {!user.isAdmin && (
                                    <DashboardSection sectionTitle="Additional Information">
                                        <DashBoardPanel>
                                            <div className="form-horizontal">
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">Display Name:</label>
                                                    <div className="sm:col-10 p-0">
                                                        <DashBoardInput
                                                            readOnly={true}
                                                            value={props.values.displayName}
                                                            setValue={() => {}}
                                                            type={'text'}
                                                            placeholder={''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">Profile Picture:</label>
                                                    <div className="sm:col-10 p-0">
                                                        {props.values.profilePicture ? (
                                                            <DashBoardImage
                                                                src={`${props.values.id}/${props.values.profilePicture}`}
                                                                identityId={'users'}
                                                            />
                                                        ) : (
                                                            <i>No image uploaded</i>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">Phone:</label>
                                                    <div className="sm:col-10 p-0">
                                                        <DashBoardInput
                                                            readOnly={true}
                                                            value={props.values.phone ?? ''}
                                                            setValue={() => {}}
                                                            type={'text'}
                                                            placeholder={''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">Address 1:</label>
                                                    <div className="sm:col-10 p-0">
                                                        <DashBoardInput
                                                            readOnly={true}
                                                            value={props.values.address1}
                                                            setValue={() => {}}
                                                            type={'text'}
                                                            placeholder={''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">Address 2:</label>
                                                    <div className="sm:col-10 p-0">
                                                        <DashBoardInput
                                                            readOnly={true}
                                                            value={props.values.address2}
                                                            setValue={() => {}}
                                                            type={'text'}
                                                            placeholder={''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">City:</label>
                                                    <div className="sm:col-10 p-0">
                                                        <DashBoardInput
                                                            readOnly={true}
                                                            value={props.values.city}
                                                            setValue={() => {}}
                                                            type={'text'}
                                                            placeholder={''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">State:</label>
                                                    <div className="sm:col-10 p-0">
                                                        <DashBoardInput
                                                            readOnly={true}
                                                            value={props.values.state}
                                                            setValue={() => {}}
                                                            type={'text'}
                                                            placeholder={''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">Zip:</label>
                                                    <div className="sm:col-10 p-0">
                                                        <DashBoardInput
                                                            readOnly={true}
                                                            value={props.values.zip}
                                                            setValue={() => {}}
                                                            type={'text'}
                                                            placeholder={''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="sm:col-2 control-label">
                                                        Government Issued ID (Photo):{' '}
                                                    </label>
                                                    <div className="sm:col-10 p-0">
                                                        {props.values.governmentIssuedIDPhoto ? (
                                                            <DashBoardImage
                                                                src={`${props.values.id}/${props.values.governmentIssuedIDPhoto}`}
                                                                identityId={'users'}
                                                            />
                                                        ) : (
                                                            <i>No image uploaded</i>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </DashBoardPanel>
                                    </DashboardSection>
                                )}
                            </div>
                        </Form>
                    );
                }}
            </Formik>
            <PasswordEditModal isOpenModal={modalEditPassword} closeModal={closeModal} />
        </>
    );
};
