import React, { FunctionComponent } from 'react';
import { DashBoardInput } from '../../dashboard/input';
import SavePanel from '../../dashboard/SavePanel';
import { Form, Formik, FormikProps } from 'formik';
import { InputSwitch } from 'primereact/inputswitch';
import { useStores } from '../../../../store';
import { HelpTopic } from '../../../../models/api/helpCenter';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { DashBoardPanel } from '../../dashboard/Panel';
import { dialog } from '../../../../utils/confirmDialogConstants';
import { confirmDialog } from 'primereact/confirmdialog';
import { BackRoutesList } from '../BackRoutesList';

export interface Props {
    helpTopic: HelpTopic | undefined;
    isNewTopic: boolean;
}

const validationSchema = Yup.object().shape({
    order: Yup.number().positive(),
    name: Yup.string().required('Required'),
});

export const HelpTopicEdit: FunctionComponent<Props> = ({ helpTopic, isNewTopic }) => {
    const { helpTopicsStore } = useStores();
    const router = useRouter();

    const initialValues: HelpTopic = {
        id: helpTopic?.id ?? '',
        name: helpTopic?.name ?? '',
        order: helpTopic?.order ?? '',
        active: helpTopic?.active ?? true,
        createdAt: helpTopic?.createdAt ?? '',
        updatedAt: helpTopic?.updatedAt ?? '',
    };

    const handleCancel = (formik: FormikProps<HelpTopic>) => {
        confirmDialog({
            ...dialog.warn,
            accept: () => formik.resetForm(),
        });
    };

    const handleDelete = (formik: FormikProps<HelpTopic>) => {
        confirmDialog({
            ...dialog.danger,
            accept: () => {
                helpTopicsStore.deleteTopic(formik.values.id);
                router.back();
            },
        });
    };

    const onSubmit = async (data: HelpTopic) => {
        if (isNewTopic) {
            const topic = await helpTopicsStore.createTopic(data);
            topic && router.replace(`${BackRoutesList.HelpTopics}/${topic?.id}`);
            return;
        }
        helpTopicsStore.updateTopic(data);
    };

    const getFormErrorMessage = (error: string) => {
        return <div className="w-max p-error">{error}</div>;
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
        >
            {(props) => {
                return (
                    <Form>
                        <div className="grid">
                            <div className="col-8">
                                <DashBoardPanel>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label form-control-required">
                                                Topic Name:
                                            </label>
                                            <div className="sm:col-10 p-0">
                                                <>
                                                    <DashBoardInput
                                                        value={props.values.name}
                                                        setValue={props.handleChange}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id={'name'}
                                                    />
                                                    {props.errors.name && getFormErrorMessage(props.errors.name)}
                                                </>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Order:</label>
                                            <div className="sm:col-1 p-0">
                                                <>
                                                    <DashBoardInput
                                                        value={props.values.order.toString()}
                                                        setValue={props.handleChange}
                                                        className={'form-control'}
                                                        type={'number'}
                                                        placeholder={''}
                                                        id={'order'}
                                                    />
                                                    {props.errors.order && getFormErrorMessage(props.errors.order)}
                                                </>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Active?:</label>
                                            <div className="sm:col-10 p-0 pt-3">
                                                <InputSwitch
                                                    id={'active'}
                                                    checked={props.values.active}
                                                    onChange={props.handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </DashBoardPanel>
                            </div>

                            <div className="col-4 pr-5 pl-5">
                                <SavePanel
                                    timestamp={{
                                        createdAt: props.values.createdAt,
                                        updatedAt: isNewTopic ? undefined : props.values.updatedAt,
                                    }}
                                    inputsDisabled
                                    formikProps={props}
                                >
                                    <div className="flex">
                                        {!isNewTopic && (
                                            <div className="controls-group-left">
                                                <SavePanel.DeleteButton
                                                    onClick={() => handleDelete(props)}
                                                    className="p-button-outlined p-button-danger"
                                                >
                                                    <i className="pi pi-trash pr-3"></i>
                                                    Delete
                                                </SavePanel.DeleteButton>
                                            </div>
                                        )}
                                        <div className="controls-group-right">
                                            {!isNewTopic && (
                                                <SavePanel.CancelButton
                                                    onClick={() => handleCancel(props)}
                                                    className="p-button-default"
                                                >
                                                    Cancel
                                                </SavePanel.CancelButton>
                                            )}
                                            <SavePanel.SaveButton className="p-button-primary">
                                                <i className="pi pi-save pr-3"></i>
                                                Save
                                            </SavePanel.SaveButton>
                                        </div>
                                    </div>
                                </SavePanel>
                            </div>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
};
