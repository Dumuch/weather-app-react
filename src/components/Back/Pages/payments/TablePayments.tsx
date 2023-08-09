import { Column, ColumnProps } from 'primereact/column';
import React, { FunctionComponent, useState, useEffect } from 'react';
import { Payment, PaymentStatus, PaymentStatusUI } from '../../../../models/api';
import { useStores } from '../../../../store';
import { BackRoutesList } from '../BackRoutesList';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { getFormatData } from '../../../../utils/dateTime';
import { dateConfig } from '../../../../config/date';
import { concatString, formatIntoPriceValue } from '../../../../utils/helpers';
import { observer } from 'mobx-react-lite';
import { DashBoardLazyTable } from '../../dashboard/lazyTable';
import { FilterPanel } from '../../dashboard/filterPanel';
import { Form, FormikState } from 'formik';
import { FilterForm } from './FilterForm';
import { useRouter } from 'next/router';
import { RouterEvents } from '../../../../utils/constants';

export type ResetFormSignature = (
    nextState?:
        | Partial<
              FormikState<{
                  fromDate: Date;
                  toDate: Date;
              }>
          >
        | undefined
) => void;

export const TablePayments: FunctionComponent = observer(() => {
    const { paymentsStore } = useStores();
    const router = useRouter();

    const [filter, setFilter] = useState<{
        fromDate: Date | string | null;
        toDate: Date | string | null;
        timezone: string;
    } | null>(null);

    const [isPageReset, setIsPageReset] = useState(false);

    const tableFields: { [index: string]: ColumnProps } = {
        createdAt: { field: 'createdAt', header: 'Payment Date' },
        billingFirst: { field: 'billingFirst', header: 'Customer' },
        total: { field: 'total', header: 'Total' },
        propertyName: { field: 'propertyName', header: 'Basis of Payment' },
        transactionId: { field: 'transactionId', header: 'PN REF' },
        status: { field: 'status', header: 'Status' },
    };

    const actionBodyTemplate = (rowData: Payment) => {
        return (
            <Link href={`${BackRoutesList.Payments}/${rowData.id}`} passHref>
                <Button icon="pi pi-eye" className="p-button-success p-button-text table_action-button" />
            </Link>
        );
    };

    const propertyNameBodyTemplate = (rowData: Payment) => {
        return concatString(
            [
                rowData.propertyName.toString(),
                `${rowData.checkIn ? getFormatData(rowData.checkIn, dateConfig.formats.dateOnlyDay) + ' -' : ''} 
                 ${rowData.checkOut ? getFormatData(rowData.checkOut, dateConfig.formats.dateOnlyDay) : ''}`,
            ],
            ','
        );
    };

    const createdTimeBodyTemplate = (rowData: Payment) => {
        return getFormatData(rowData.createdAt ?? '', dateConfig.formats.date, true);
    };
    const customersBodyTemplate = (rowData: Payment) => {
        return concatString([rowData.billingFirst ?? '', rowData.billingLast ?? '']);
    };
    const totalBodyTemplate = (rowData: Payment) => {
        return formatIntoPriceValue(rowData.total, true);
    };
    const transactionBodyTemplate = (rowData: Payment) => {
        return rowData.transactionId.toString();
    };

    const statusBodyTemplate = (rowData: Payment) => {
        return rowData.status === PaymentStatus.cancel
            ? `${PaymentStatusUI[rowData.status]} (-$${rowData.returnSum ?? 0})`
            : PaymentStatusUI[rowData.status];
    };

    const initialValues = {
        fromDate: filter?.fromDate ? new Date(filter.fromDate) : '',
        toDate: filter?.toDate ? new Date(filter.toDate) : '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const onCancel = (resetForm: ResetFormSignature) => () => {
        setIsPageReset(true);
        setFilter({ fromDate: '', toDate: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        resetForm();
        sessionStorage.removeItem('payments_filter');
    };

    const onSubmit = (values: { fromDate: Date | string; toDate: Date | string }) => {
        setIsPageReset(true);
        const transformedFilter = Object.assign(
            { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },

            values.fromDate
                ? { fromDate: getFormatData(values.fromDate, dateConfig.formats.dateOnlyDay) }
                : { fromDate: '' },
            values.toDate ? { toDate: getFormatData(values.toDate, dateConfig.formats.dateOnlyDay) } : { toDate: '' }
        );
        setFilter(transformedFilter);
        sessionStorage.setItem('payments_filter', JSON.stringify(transformedFilter));
    };

    useEffect(() => {
        const persistedFilter = JSON.parse(sessionStorage.getItem('payments_filter') ?? '{}');
        setFilter(persistedFilter);

        return () => {
            router.events.on(RouterEvents.changeStart, (url) => {
                if (url.indexOf(BackRoutesList.Payments) < 0) {
                    sessionStorage.removeItem('payments_filter');
                }
            });
        };
    }, []);

    return (
        <>
            <FilterPanel initialValues={initialValues} onSubmit={onSubmit}>
                <Form className="flex justify-content-between">
                    <FilterForm onCancel={onCancel} />
                </Form>
            </FilterPanel>
            <DashBoardLazyTable
                store={paymentsStore}
                tableFields={tableFields}
                fetchList={'fetchList'}
                filters={filter}
                isPageReset={isPageReset}
                setIsPageReset={setIsPageReset}
            >
                <Column
                    className="white-space-nowrap"
                    field={tableFields.createdAt.field}
                    header={tableFields.createdAt.header}
                    sortable
                    body={createdTimeBodyTemplate}
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.billingFirst.field}
                    header={tableFields.billingFirst.header}
                    sortable
                    body={customersBodyTemplate}
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.total.field}
                    header={tableFields.total.header}
                    sortable
                    body={totalBodyTemplate}
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.propertyName.field}
                    header={tableFields.propertyName.header}
                    sortable
                    body={propertyNameBodyTemplate}
                />
                <Column
                    className="white-space-nowrap"
                    field={tableFields.transactionId.field}
                    header={tableFields.transactionId.header}
                    body={transactionBodyTemplate}
                />
                <Column
                    className="w-full white-space-nowrap capitalize"
                    field={tableFields.status.field}
                    header={tableFields.status.header}
                    body={statusBodyTemplate}
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
        </>
    );
});
