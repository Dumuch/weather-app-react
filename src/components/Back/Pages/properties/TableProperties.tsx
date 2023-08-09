import { Column, ColumnProps } from 'primereact/column';
import React, { FunctionComponent } from 'react';
import { Property, PropertyStatusUI } from '../../../../models/api/property';
import { getFormatData } from '../../../../utils/dateTime';
import { dateConfig } from '../../../../config/date';
import { useStores } from '../../../../store';
import { observer } from 'mobx-react-lite';
import { DashBoardLazyTable } from '../../dashboard/lazyTable';
import Link from 'next/link';
import { BackRoutesList } from '../BackRoutesList';
import { Button } from 'primereact/button';
import { concatString } from '../../../../utils/helpers';

export const TableProperties: FunctionComponent = observer(() => {
    const { propertiesStore } = useStores();

    const statusBodyTemplate = (rowData: Property) => {
        return PropertyStatusUI[propertiesStore.getPropertyStatus(rowData)];
    };

    const locationBodyTemplate = (rowData: Property) => {
        return concatString([
            rowData.address1 ? `${rowData.address1},` : '',
            rowData.address2 ? `${rowData.address2},` : '',
            rowData.city ? `${rowData.city},` : '',
            rowData.state ?? '',
            rowData.zip ?? '',
        ]);
    };
    const userBodyTemplate = (rowData: Property) => {
        return concatString([rowData.user?.firstName ?? '', rowData.user?.lastName ?? '']);
    };
    const createdTimeBodyTemplate = (rowData: Property) => {
        return getFormatData(rowData.createdAt, dateConfig.formats.date);
    };
    const updatedTimeBodyTemplate = (rowData: Property) => {
        return getFormatData(rowData.updatedAt, dateConfig.formats.date);
    };

    const actionBodyTemplate = (rowData: Property) => {
        return (
            <Link href={`${BackRoutesList.Properties}/${rowData.id}`} passHref>
                <Button icon="pi pi-pencil" className="p-button-success p-button-text table_action-button" />
            </Link>
        );
    };

    const tableFields: { [index: string]: ColumnProps } = {
        name: { field: 'name', header: 'Property' },
        address1: { field: 'address1', header: 'Location' },
        propertyType: { field: 'propertyType.fullName', header: 'Type' },
        user: { field: 'user.firstName', header: 'Owner' },
        active: { field: 'active', header: 'Status' },
        createdAt: { field: 'createdAt', header: 'Created' },
        updatedAt: { field: 'updatedAt', header: 'Last Modified' },
    };

    return (
        <DashBoardLazyTable store={propertiesStore} tableFields={tableFields} fetchList={'fetchList'}>
            <Column field={tableFields.name.field} header={tableFields.name.header} sortable />
            <Column
                className="white-space-nowrap"
                field={tableFields.address1.field}
                header={tableFields.address1.header}
                sortable
                body={locationBodyTemplate}
            />
            <Column
                className="white-space-nowrap"
                field={tableFields.propertyType.field}
                header={tableFields.propertyType.header}
                sortable
            />
            <Column
                className="white-space-nowrap"
                field={tableFields.user.field}
                header={tableFields.user.header}
                body={userBodyTemplate}
                sortable
            />
            <Column
                className="w-full"
                field={tableFields.active.field}
                header={tableFields.active.header}
                body={statusBodyTemplate}
                sortable
            />
            <Column
                className="white-space-nowrap"
                field={tableFields.createdAt.field}
                header={tableFields.createdAt.header}
                body={createdTimeBodyTemplate}
                sortable
            />
            <Column
                className="white-space-nowrap"
                field={tableFields.updatedAt.field}
                header={tableFields.updatedAt.header}
                body={updatedTimeBodyTemplate}
                sortable
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
    );
});
