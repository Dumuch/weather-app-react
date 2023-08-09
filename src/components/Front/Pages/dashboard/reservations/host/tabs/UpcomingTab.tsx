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

const UpcomingTab = observer(() => {
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

    const guestBodyTemplate = (rowData: Reservation) => {
        return concatString([rowData.guest?.firstName ?? '', rowData.guest?.lastName ?? '']);
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
        property: { field: 'property.name', header: 'Property' },
        guest: { field: 'guest.firstName', header: 'Guest' },
        status: { field: 'status.fullName', header: 'Status' },
    };

    const onPage = (event: DataTablePFSEvent) => {
        setLazyParams(event);
    };

    const enablePaginator = reservationsStore.list.items.upcoming.count > lazyParams.rows;

    useEffect(() => {
        reservationsStore.fetchList(
            UserType.host,
            ReservationStatus.upcoming,
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
                value={reservationsStore.list.items.upcoming.data}
                dataKey="id"
                responsiveLayout="stack"
                breakpoint="566px"
                selectionMode="checkbox"
                loading={reservationsStore.list.items.upcoming.isLoading}
                paginator={enablePaginator}
                // using 'as' because we want to customize PageLinks only, but other properties are required
                paginatorTemplate={paginationTemplate as PaginatorTemplate}
                lazy
                first={lazyParams.first}
                rows={lazyParams.rows}
                onPage={onPage}
                totalRecords={reservationsStore.list.items.upcoming.count}
            >
                <Column
                    className="w-3"
                    field={tableFields.dates.field}
                    header={tableFields.dates.header}
                    body={datesBodyTemplate}
                />
                <Column className="w-auto" field={tableFields.property.field} header={tableFields.property.header} />

                <Column
                    className="w-3"
                    field={tableFields.guest.field}
                    header={tableFields.guest.header}
                    body={guestBodyTemplate}
                />
                <Column className="w-2" field={tableFields.status.field} header={tableFields.status.header} />
                <Column className="w-1" header="" body={actionBodyTemplate} exportable={false} />
            </DataTable>
        </>
    );
});

export default UpcomingTab;
