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
import { HelpTopic } from '../../../../models/api/helpCenter';
import { getFormatData } from '../../../../utils/dateTime';
import { dateConfig } from '../../../../config/date';

export const TableHelpTopics: FC = observer(() => {
    const { helpTopicsStore } = useStores();

    const tableFields: { [index: string]: ColumnProps } = {
        order: { field: 'order', header: 'Order' },
        name: { field: 'name', header: 'Topic' },
        active: { field: 'active', header: 'Active?' },
        createdAt: { field: 'createdAt', header: 'Created' },
        updatedAt: { field: 'updatedAt', header: 'Last Modified' },
    };

    const onDelete = (id: string) => {
        confirmDialog({ ...dialog.danger, accept: () => helpTopicsStore.deleteTopic(id) });
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Link href={`${BackRoutesList.HelpTopics}/${rowData.id}`} passHref>
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

    const isActiveBodyTemplate = (rowData: HelpTopic) => {
        return rowData.active ? <b>Yes</b> : 'No';
    };

    const createdDateBodyTemplate = (rowData: HelpTopic) => {
        return getFormatData(rowData.createdAt, dateConfig.formats.date);
    };

    const updatedDateBodyTemplate = (rowData: HelpTopic) => {
        return getFormatData(rowData.updatedAt, dateConfig.formats.date);
    };

    return (
        <>
            <DashBoardLazyTable store={helpTopicsStore} tableFields={tableFields} fetchList={'fetchList'}>
                <Column
                    className="white-space-nowrap"
                    field={tableFields.order.field}
                    header={tableFields.order.header}
                    sortable
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.name.field}
                    header={tableFields.name.header}
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
