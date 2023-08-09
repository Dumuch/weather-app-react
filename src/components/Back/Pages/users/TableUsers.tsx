import { Column, ColumnProps } from 'primereact/column';
import React, { FunctionComponent } from 'react';
import { User } from '../../../../models/api';
import { useStores } from '../../../../store';
import { BackRoutesList } from '../BackRoutesList';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { observer } from 'mobx-react-lite';
import { DashBoardLazyTable } from '../../dashboard/lazyTable';
import { getFormatData } from '../../../../utils/dateTime';
import { dateConfig } from '../../../../config/date';

export const TableUsers: FunctionComponent = observer(() => {
    const { usersStore } = useStores();

    const isActiveBodyTemplate = (rowData: User) => {
        return rowData.active ? <b>Yes</b> : 'No';
    };
    const isAdminBodyTemplate = (rowData: User) => {
        return rowData.isAdmin ? <b>Yes</b> : 'No';
    };

    const actionBodyTemplate = (rowData: User) => {
        return (
            <Link href={`${BackRoutesList.UserList}/${rowData.id}`} passHref>
                <Button icon="pi pi-pencil" className="p-button-success p-button-text table_action-button" />
            </Link>
        );
    };

    const createdDateBodyTemplate = (rowData: User) => {
        return getFormatData(rowData.createdAt, dateConfig.formats.date);
    };

    const updatedDateBodyTemplate = (rowData: User) => {
        return getFormatData(rowData.updatedAt, dateConfig.formats.date);
    };

    const tableFields: { [index: string]: ColumnProps } = {
        firstName: { field: 'firstName', header: 'First Name' },
        lastName: { field: 'lastName', header: 'Last Name' },
        email: { field: 'email', header: 'Email' },
        isAdmin: { field: 'isAdmin', header: 'Admin?' },
        active: { field: 'active', header: 'Active?' },
        createdAt: { field: 'createdAt', header: 'Created' },
        updatedAt: { field: 'updatedAt', header: 'Last Modified' },
    };

    return (
        <>
            <DashBoardLazyTable store={usersStore} tableFields={tableFields} fetchList={'fetchList'}>
                <Column
                    className="white-space-nowrap"
                    field={tableFields.firstName.field}
                    header={tableFields.firstName.header}
                    sortable
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.lastName.field}
                    header={tableFields.lastName.header}
                    sortable
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.email.field}
                    header={tableFields.email.header}
                    sortable
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.isAdmin.field}
                    header={tableFields.isAdmin.header}
                    sortable
                    body={isAdminBodyTemplate}
                />
                <Column
                    className="w-full"
                    style={{ width: '50px' }}
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
