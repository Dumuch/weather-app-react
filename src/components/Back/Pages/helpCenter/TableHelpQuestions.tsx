import { Column, ColumnProps } from 'primereact/column';
import React, { FC } from 'react';
import { useStores } from '../../../../store';
import { BackRoutesList } from '../BackRoutesList';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { observer } from 'mobx-react-lite';
import { DashBoardLazyTable } from '../../dashboard/lazyTable';
import { confirmDialog } from 'primereact/confirmdialog';
import { dialog } from '../../../../utils/confirmDialogConstants';
import { HelpQuestion } from '../../../../models/api/helpCenter';
import { getFormatData } from '../../../../utils/dateTime';
import { dateConfig } from '../../../../config/date';

export const TableHelpQuestions: FC = observer(() => {
    const { helpQuestionsStore } = useStores();

    const tableFields: { [index: string]: ColumnProps } = {
        order: { field: 'order', header: 'Order' },
        question: { field: 'question', header: 'Question' },
        questionType: { field: 'questionType.fullName', header: 'Type' },
        active: { field: 'active', header: 'Active?' },
        createdAt: { field: 'createdAt', header: 'Created' },
        updatedAt: { field: 'updatedAt', header: 'Last Modified' },
    };

    const onDelete = (id: string) => {
        confirmDialog({ ...dialog.danger, accept: () => helpQuestionsStore.deleteQuestion(id) });
    };

    const actionBodyTemplate = (rowData: HelpQuestion) => {
        return (
            <>
                <Link href={`${BackRoutesList.HelpFAQs}/${rowData.id}`} passHref>
                    <Button icon="pi pi-pencil" className="p-button-success p-button-text table_action-button" />
                </Link>
                <Button
                    icon="pi pi-trash"
                    className="p-button-danger p-button-text table_action-button"
                    onClick={() => onDelete(rowData.id)}
                />
            </>
        );
    };

    const isActiveBodyTemplate = (rowData: HelpQuestion) => {
        return rowData.active ? <b>Yes</b> : 'No';
    };

    const createdDateBodyTemplate = (rowData: HelpQuestion) => {
        return getFormatData(rowData.createdAt, dateConfig.formats.date);
    };

    const updatedDateBodyTemplate = (rowData: HelpQuestion) => {
        return getFormatData(rowData.updatedAt, dateConfig.formats.date);
    };

    return (
        <>
            <DashBoardLazyTable store={helpQuestionsStore} tableFields={tableFields} fetchList={'fetchList'}>
                <Column
                    className="white-space-nowrap"
                    field={tableFields.order.field}
                    header={tableFields.order.header}
                    sortable
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.question.field}
                    header={tableFields.question.header}
                    sortable
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.questionType.field}
                    header={tableFields.questionType.header}
                    sortable
                />
                <Column
                    className="w-full"
                    field={tableFields.active.field}
                    header={tableFields.active.header}
                    sortable
                    body={isActiveBodyTemplate}
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.createdAt.field}
                    header={tableFields.createdAt.header}
                    sortable
                    body={createdDateBodyTemplate}
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.updatedAt.field}
                    header={tableFields.updatedAt.header}
                    sortable
                    body={updatedDateBodyTemplate}
                />
                <Column
                    className="white-space-nowrap"
                    header="Actions"
                    alignHeader="center"
                    align={'center'}
                    body={actionBodyTemplate}
                    exportable={false}
                    bodyStyle={{ width: '80px' }}
                />
            </DashBoardLazyTable>
        </>
    );
});
