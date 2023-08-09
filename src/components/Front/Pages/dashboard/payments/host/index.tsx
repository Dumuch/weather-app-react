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

const PaymentsHost = observer(() => {
    const { paymentsStore } = useStores();
    const [lazyParams, setLazyParams] = useState<DataTablePFSEvent | LazyParams>({
        first: 0,
        rows: DataTableParams.paymentsRowsCount,
        page: 0,
    });

    const guestBodyTemplate = (rowData: Payment) => {
        const checkIn = getFormatData(rowData.checkIn, dateConfig.formats.localizedDate, true);
        const checkOut = getFormatData(rowData.checkOut, dateConfig.formats.localizedDate, true);
        return (
            <div>
                <span>{concatString([rowData.billingFirst ?? '', rowData.billingLast ?? ''])}</span>
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
        return formatIntoPriceValue(rowData.hostPayout ?? 0, true, true);
    };

    const statusBodyTemplate = (rowData: Payment) => {
        if (rowData.status === PaymentStatus.cancel) {
            const sumString =
                PaymentStatusUI[rowData.status] +
                ' (' +
                (rowData.returnSumHost && rowData.returnSumHost > 0 ? '-' : '') +
                formatIntoPriceValue(rowData.returnSumHost ?? 0, true, true) +
                ')';

            return (
                <>
                    {sumString}
                    {rowData.returnSumHost && rowData.penaltyHost ? (
                        <ul>
                            <li>
                                Revoked: {formatIntoPriceValue(rowData.returnSumHost - rowData.penaltyHost, true, true)}
                            </li>
                            <li>Penalty: {formatIntoPriceValue(rowData.penaltyHost, true, true)}</li>
                        </ul>
                    ) : null}
                </>
            );
        } else {
            return PaymentStatusUI[rowData.status];
        }
    };

    const tableFields: { [index: string]: ColumnProps } = {
        property: { field: 'propertyName', header: 'Property' },
        guest: { field: 'guest.firstName', header: 'Guest' },
        date: { field: 'createdAt', header: 'Date' },
        amount: { field: 'hostPayout', header: 'Amount' },
        status: { field: 'status', header: 'Status' },
    };

    const onPage = (event: DataTablePFSEvent) => {
        setLazyParams(event);
    };

    const enablePaginator = paymentsStore.list.count > lazyParams.rows;

    useEffect(() => {
        const offset = (lazyParams.page ?? 0) * lazyParams.rows;
        paymentsStore.fetchList(lazyParams.rows, offset, '', 0, UserType.host, true);
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
                <Column className="w-auto" field={tableFields.property.field} header={tableFields.property.header} />
                <Column
                    className="w-3"
                    field={tableFields.guest.field}
                    header={tableFields.guest.header}
                    body={guestBodyTemplate}
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
                    className="w-2 capitalize"
                    field={tableFields.status.field}
                    header={tableFields.status.header}
                    body={statusBodyTemplate}
                />
            </DataTable>
        </div>
    );
});

export default PaymentsHost;
