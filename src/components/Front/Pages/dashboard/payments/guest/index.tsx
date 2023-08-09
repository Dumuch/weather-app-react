import { observer } from 'mobx-react-lite';
import { Column, ColumnProps } from 'primereact/column';
import { DataTable, DataTablePFSEvent } from 'primereact/datatable';
import { PaginatorTemplate } from 'primereact/paginator';
import { useEffect, useState } from 'react';
import { dateConfig } from '../../../../../../config/date';
import { paginationTemplate } from '../../../../../../config/table';
import { LazyParams, Payment, PaymentStatus, PaymentStatusUI, UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { DataTableParams } from '../../../../../../utils/constants';
import { getFormatData } from '../../../../../../utils/dateTime';
import { concatString, formatIntoPriceValue } from '../../../../../../utils/helpers';

const PaymentsGuest = observer(() => {
    const { paymentsStore } = useStores();
    const [lazyParams, setLazyParams] = useState<DataTablePFSEvent | LazyParams>({
        first: 0,
        rows: DataTableParams.paymentsRowsCount,
        page: 0,
    });

    const reservationBodyTemplate = (rowData: Payment) => {
        const checkIn = getFormatData(rowData.checkIn, dateConfig.formats.localizedDate, true);
        const checkOut = getFormatData(rowData.checkOut, dateConfig.formats.localizedDate, true);
        return (
            <div>
                <span>{rowData.reservation?.property?.name}</span>
                <div className="color-dark-grey">
                    <span>{concatString([checkIn, checkOut], ' - ')}</span>
                </div>
            </div>
        );
    };

    const dateBodyTemplate = (rowData: Payment) => {
        return getFormatData(rowData.createdAt, dateConfig.formats.dateWithoutSeconds, true);
    };

    const amountBodyTemplate = (rowData: Payment) => {
        return formatIntoPriceValue(rowData.total, true, false);
    };

    const statusBodyTemplate = (rowData: Payment) => {
        const sumString = `${PaymentStatusUI[rowData.status]} (${
            rowData.returnSum && rowData.returnSum > 0 ? '+' : ''
        }$${rowData.returnSum ?? 0})`;

        return rowData.status === PaymentStatus.cancel ? sumString : PaymentStatusUI[rowData.status];
    };

    const tableFields: { [index: string]: ColumnProps } = {
        reservation: { field: 'propertyName', header: 'Reservation' },
        date: { field: 'createdAt', header: 'Date' },
        amount: { field: 'total', header: 'Amount' },
        status: { field: 'status', header: 'Status' },
    };

    const onPage = (event: DataTablePFSEvent) => {
        setLazyParams(event);
    };

    const enablePaginator = paymentsStore.list.count > lazyParams.rows;

    useEffect(() => {
        const offset = (lazyParams.page ?? 0) * lazyParams.rows;
        paymentsStore.fetchList(lazyParams.rows, offset, '', 0, UserType.guest, true);
    }, [lazyParams.page]);

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb-big">
                <h2 className="h4-style title">Payments</h2>
            </div>

            <DataTable
                value={paymentsStore.list.items}
                dataKey="id"
                responsiveLayout="stack"
                breakpoint="566px"
                loading={paymentsStore.list.isLoading}
                paginator={enablePaginator}
                // using 'as' because we want to customize PageLinks only, but other properties are required
                paginatorTemplate={paginationTemplate as PaginatorTemplate}
                lazy
                first={lazyParams.first}
                rows={lazyParams.rows}
                onPage={onPage}
                totalRecords={paymentsStore.list.count}
            >
                <Column
                    className="w-auto"
                    field={tableFields.reservation.field}
                    header={tableFields.reservation.header}
                    body={reservationBodyTemplate}
                />
                <Column
                    className="w-2"
                    field={tableFields.date.field}
                    header={tableFields.date.header}
                    body={dateBodyTemplate}
                />
                <Column
                    className="w-2"
                    field={tableFields.amount.field}
                    header={tableFields.amount.header}
                    body={amountBodyTemplate}
                />
                <Column
                    className="w-3 capitalize"
                    field={tableFields.status.field}
                    header={tableFields.status.header}
                    body={statusBodyTemplate}
                />
            </DataTable>
        </div>
    );
});

export default PaymentsGuest;
