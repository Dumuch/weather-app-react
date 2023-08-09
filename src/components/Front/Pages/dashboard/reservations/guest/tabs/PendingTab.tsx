import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { Column, ColumnProps } from 'primereact/column';
import { DataTable, DataTablePFSEvent } from 'primereact/datatable';
import { PaginatorTemplate } from 'primereact/paginator';
import { useEffect, useState } from 'react';
import { dateConfig } from '../../../../../../../config/date';
import { paginationTemplate } from '../../../../../../../config/table';
import { LazyParams, Reservation, ReservationStatus, UserType } from '../../../../../../../models/api';
import { useStores } from '../../../../../../../store';
import { DataTableParams } from '../../../../../../../utils/constants';
import { getFormatData } from '../../../../../../../utils/dateTime';
import { concatString } from '../../../../../../../utils/helpers';
import { FrontRoutesList } from '../../../../FrontRoutesList';

const PendingTab = observer(() => {
    const { reservationsStore } = useStores();
    const [lazyParams, setLazyParams] = useState<DataTablePFSEvent | LazyParams>({
        first: 0,
        rows: DataTableParams.rowsCount,
        page: 0,
    });

    const datesBodyTemplate = (rowData: Reservation) => {
        const checkIn = getFormatData(rowData.checkIn, dateConfig.formats.localizedDate, true);
        const checkOut = getFormatData(rowData.checkOut, dateConfig.formats.localizedDate, true);
        return concatString([checkIn, checkOut], ' - ');
    };

    const locationBodyTemplate = (rowData: Reservation) => {
        return concatString([rowData.property?.city ?? '', rowData.property?.state ?? ''], ',');
    };

    const actionBodyTemplate = (rowData: Reservation) => {
        return (
            <Link href={`${FrontRoutesList.DashboardReservations}/${rowData.id}`}>
                <a className="details-link">
                    Details
                    <span className="fas fa-chevron-right" />
                </a>
            </Link>
        );
    };

    const tableFields: { [index: string]: ColumnProps } = {
        dates: { field: 'checkIn', header: 'Dates' },
        location: { field: 'property.city', header: 'Location' },
    };

    const onPage = (event: DataTablePFSEvent) => {
        setLazyParams(event);
    };

    const enablePaginator = reservationsStore.list.items.pending.count > lazyParams.rows;

    useEffect(() => {
        reservationsStore.fetchList(
            UserType.guest,
            ReservationStatus.pending,
            {
                limit: lazyParams.rows,
                offset: (lazyParams.page ?? 0) * lazyParams.rows,
            },
            true
        );
    }, [lazyParams.page]);

    return (
        <>
            <DataTable
                value={reservationsStore.list.items.pending.data}
                dataKey="id"
                responsiveLayout="stack"
                breakpoint="566px"
                selectionMode="checkbox"
                loading={reservationsStore.list.items.pending.isLoading}
                paginator={enablePaginator}
                // using 'as' because we want to customize PageLinks only, but other properties are required
                paginatorTemplate={paginationTemplate as PaginatorTemplate}
                lazy
                first={lazyParams.first}
                rows={lazyParams.rows}
                onPage={onPage}
                totalRecords={reservationsStore.list.items.pending.count}
            >
                <Column
                    className="w-5"
                    field={tableFields.dates.field}
                    header={tableFields.dates.header}
                    body={datesBodyTemplate}
                />
                <Column
                    className="w-5"
                    field={tableFields.location.field}
                    header={tableFields.location.header}
                    body={locationBodyTemplate}
                />
                <Column className="w-1" header="" body={actionBodyTemplate} exportable={false} />
            </DataTable>
        </>
    );
});

export default PendingTab;
