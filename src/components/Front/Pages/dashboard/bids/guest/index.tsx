import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { Column, ColumnProps } from 'primereact/column';
import { DataTable, DataTablePFSEvent } from 'primereact/datatable';
import { PaginatorTemplate } from 'primereact/paginator';
import { useEffect, useState } from 'react';
import { dateConfig } from '../../../../../../config/date';
import { paginationTemplate } from '../../../../../../config/table';
import { Reservation, UserType, BidLazyParamsWithFilter, BidStatus } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { DataTableParams } from '../../../../../../utils/constants';
import { getDurationString, getFormatData } from '../../../../../../utils/dateTime';
import { concatString, countdown, formatIntoPriceValue, formatTimeRemaining } from '../../../../../../utils/helpers';
import { FrontRoutesList } from '../../../FrontRoutesList';
import { TimeRemaining } from '../../../../../../models/helpers';

const BidsGuest = observer(() => {
    const { reservationsStore, dictionaryStore, propertiesStore } = useStores();
    const [lazyParams, setLazyParams] = useState<DataTablePFSEvent | BidLazyParamsWithFilter>({
        first: 0,
        rows: DataTableParams.rowsCount,
        page: 0,
        sortField: '',
        sortOrder: 1,
    });

    // for updated rows
    const [timerData, setTimerData] = useState({});
    useEffect(() => {
        const timer = setInterval(() => {
            setTimerData({});
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const datesBodyTemplate = (rowData: Reservation) => {
        const checkIn = getFormatData(rowData.checkIn, dateConfig.formats.localizedDate, true);
        const checkOut = getFormatData(rowData.checkOut, dateConfig.formats.localizedDate, true);
        return concatString([checkIn, checkOut], ' - ');
    };

    const nightlyBidBodyTemplate = (rowData: Reservation) => {
        return formatIntoPriceValue(rowData.nightlyBidAmount ?? 0, true);
    };
    const totalBodyTemplate = (rowData: Reservation) => {
        return formatIntoPriceValue(rowData.total ?? 0, true);
    };

    const timerBodyTemplate = (rowData: Reservation) => {
        const timeRemaining: TimeRemaining = countdown(new Date(rowData.createdAt), rowData.bidTimer ?? 1);
        if (rowData.status?.shortName !== BidStatus.pending || timeRemaining.timeIsUp) {
            return '';
        }
        return formatTimeRemaining(timeRemaining);
    };

    const actionBodyTemplate = (rowData: Reservation) => {
        return (
            <>
                <Link href={`${FrontRoutesList.DashboardBids}/${rowData.id}`}>
                    <a className="details-link">
                        Details
                        <span className="fas fa-chevron-right" />
                    </a>
                </Link>
            </>
        );
    };

    const tableFields: { [index: string]: ColumnProps } = {
        property: { field: 'property.name', header: 'Property Name' },
        dates: { field: 'checkIn', header: 'Dates' },
        nightlyBid: { field: 'nightlyBidAmount', header: 'Nightly Bid' },
        totalBid: { field: 'total', header: 'Total Bid' },
        bidTimer: { field: 'bidTimer', header: 'Bid Timer' },
        status: { field: 'status.fullName', header: 'Status' },
    };

    const onPage = (event: DataTablePFSEvent) => {
        setLazyParams((prevParams) => ({ ...prevParams, ...event }));
    };

    const onSort = (e: DataTablePFSEvent) => {
        setLazyParams((prevParams) => ({
            ...prevParams,
            sortField: e.sortField,
            sortOrder: e.sortOrder,
        }));
    };

    const enablePaginator = reservationsStore.bidsList.count > lazyParams.rows;

    useEffect(() => {
        reservationsStore.fetchBidsList(
            UserType.guest,
            {
                limit: lazyParams.rows,
                offset: (lazyParams.page ?? 0) * lazyParams.rows,
                sortField: lazyParams.sortField,
                sortOrder: lazyParams.sortOrder,
            },
            true
        );
    }, [lazyParams.page, lazyParams.sortField, lazyParams.sortOrder]);

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    useEffect(() => {
        propertiesStore.fetchNamesList();
    }, []);

    const rowClass = (data: Reservation) => {
        return {
            'p-row_unread': !data.isGuestRead,
        };
    };

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb-smtb">
                <h2 className="h4-style title">Bids</h2>
            </div>
            <DataTable
                value={reservationsStore.bidsList.data}
                dataKey="id"
                responsiveLayout="stack"
                breakpoint="693px"
                selectionMode="checkbox"
                loading={reservationsStore.bidsList.isLoading}
                paginator={enablePaginator}
                // using 'as' because we want to customize PageLinks only, but other properties are required
                paginatorTemplate={paginationTemplate as PaginatorTemplate}
                lazy
                first={lazyParams.first}
                rows={lazyParams.rows}
                onPage={onPage}
                removableSort
                onSort={onSort}
                sortField={lazyParams.sortField}
                sortOrder={lazyParams.sortOrder}
                totalRecords={reservationsStore.bidsList.count}
                rowClassName={rowClass}
            >
                <Column
                    className="w-3"
                    field={tableFields.property.field}
                    header={tableFields.property.header}
                    sortable
                />
                <Column
                    className="w-3"
                    field={tableFields.dates.field}
                    header={tableFields.dates.header}
                    body={datesBodyTemplate}
                    sortable
                />
                <Column
                    className="w-2"
                    field={tableFields.nightlyBid.field}
                    header={tableFields.nightlyBid.header}
                    body={nightlyBidBodyTemplate}
                    sortable
                />
                <Column
                    className="w-2"
                    field={tableFields.totalBid.field}
                    header={tableFields.totalBid.header}
                    body={totalBodyTemplate}
                    sortable
                />
                <Column
                    className="w-2"
                    field={tableFields.bidTimer.field}
                    header={tableFields.bidTimer.header}
                    body={timerBodyTemplate}
                    sortable
                />
                <Column className="w-1" field={tableFields.status.field} header={tableFields.status.header} sortable />
                <Column className="w-1" header="" body={actionBodyTemplate} exportable={false} />
            </DataTable>
        </div>
    );
});

export default BidsGuest;
