import * as Yup from 'yup';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { InputSwitch } from 'primereact/inputswitch';
import { useRouter } from 'next/router';
import { confirmDialog } from 'primereact/confirmdialog';
import { Editor } from 'primereact/editor';

import SavePanel from '../../dashboard/SavePanel';
import { DashBoardInput } from '../../dashboard/input';
import { useStores } from '../../../../store';
import { HelpQuestion } from '../../../../models/api/helpCenter';
import { DashBoardPanel } from '../../dashboard/Panel';
import { dialog } from '../../../../utils/confirmDialogConstants';
import { BackRoutesList } from '../BackRoutesList';
import { Dropdown } from 'primereact/dropdown';
import { DictionaryCode, DictionaryValue } from '../../../../models/api';

export interface Props {
    helpQuestion: HelpQuestion | undefined;
    isNewQuestion: boolean;
}

const validationSchema = Yup.object().shape({
    order: Yup.number().positive(),
    question: Yup.string().required('Required'),
    questionTypeId: Yup.number().required('Required').positive('Required'),
});

export const HelpQuestionEdit: FunctionComponent<Props> = ({ helpQuestion, isNewQuestion }) => {
    const { helpQuestionsStore, dictionaryStore } = useStores();
    const [questionTypes, setQuestionTypes] = useState<DictionaryValue[]>([]);
    const router = useRouter();

    const initialValues: HelpQuestion = {
        id: helpQuestion?.id ?? '',
        question: helpQuestion?.question ?? '',
        answer: helpQuestion?.answer ?? '',
        order: helpQuestion?.order ?? '',
        questionTypeId: helpQuestion?.questionTypeId ?? 0,
        active: helpQuestion?.active ?? true,
        createdAt: helpQuestion?.createdAt ?? '',
        updatedAt: helpQuestion?.updatedAt ?? '',
    };

    const handleCancel = (formik: FormikProps<HelpQuestion>) => {
        confirmDialog({
            ...dialog.warn,
            accept: () => formik.resetForm(),
        });
    };

    const handleDelete = (formik: FormikProps<HelpQuestion>) => {
        confirmDialog({
            ...dialog.danger,
            accept: () => {
                helpQuestionsStore.deleteQuestion(formik.values.id);
                router.back();
            },
        });
    };

    const onSubmit = async (data: HelpQuestion) => {
        if (isNewQuestion) {
            const question = await helpQuestionsStore.createQuestion(data);
            question && router.replace(`${BackRoutesList.HelpFAQs}/${question?.id}`);
            return;
        }
        helpQuestionsStore.updateQuestion(data);
    };

    const fetchQuestionTypes = async () => {
        await dictionaryStore.fetchList();
        setQuestionTypes(dictionaryStore.getDictionary(DictionaryCode.helpQuestionTypes));
    };

    const getFormErrorMessage = (error: string) => {
        return <div className="w-max p-error">{error}</div>;
    };

    useEffect(() => {
        fetchQuestionTypes();
    }, [dictionaryStore, dictionaryStore.isLoading]);
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
                                                Question:
                                            </label>
                                            <div className="sm:col-10 p-0">
                                                <>
                                                    <DashBoardInput
                                                        value={props.values.question}
                                                        setValue={props.handleChange}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id={'question'}
                                                    />
                                                    {props.errors.question &&
                                                        getFormErrorMessage(props.errors.question)}
                                                </>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Answer:</label>
                                            <div className="sm:col-10 p-0">
                                                <>
                                                    <Editor
                                                        name="answer"
                                                        style={{ height: '320px' }}
                                                        value={props.values.answer}
                                                        onTextChange={(e) => props.setFieldValue('answer', e.htmlValue)}
                                                    />
                                                    {props.errors.answer && getFormErrorMessage(props.errors.answer)}
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
                                            <label className="sm:col-2 control-label form-control-required">
                                                Type:
                                            </label>
                                            <div className="sm:col-10 p-0">
                                                <>
                                                    <Dropdown
                                                        optionValue="id"
                                                        optionLabel="fullName"
                                                        name="questionTypeId"
                                                        id="questionTypeId"
                                                        options={questionTypes}
                                                        value={props.values.questionTypeId}
                                                        onChange={props.handleChange}
                                                        className="form-control"
                                                    />
                                                    {props.errors.questionTypeId &&
                                                        getFormErrorMessage(props.errors.questionTypeId)}
                                                </>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Active?:</label>
                                            <div className="sm:col-10 pt-3">
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
                                        updatedAt: isNewQuestion ? undefined : props.values.updatedAt,
                                    }}
                                    inputsDisabled
                                    formikProps={props}
                                >
                                    <div className="flex">
                                        {!isNewQuestion && (
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
                                            {!isNewQuestion && (
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
