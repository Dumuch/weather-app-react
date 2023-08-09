import { Form, Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { Column, ColumnProps } from 'primereact/column';
import { DataTable, DataTablePFSEvent } from 'primereact/datatable';
import { PaginatorTemplate } from 'primereact/paginator';
import { useEffect, useMemo, useState } from 'react';
import { dateConfig } from '../../../../../../config/date';
import { paginationTemplate } from '../../../../../../config/table';
import {
    DictionaryCode,
    Reservation,
    UserType,
    BidLazyParamsWithFilter,
    Message,
    ReservationStatus,
    BidStatus,
} from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { BidStatusFilters, DataTableParams } from '../../../../../../utils/constants';
import { getFormatData } from '../../../../../../utils/dateTime';
import { concatString, countdown, formatIntoPriceValue, formatTimeRemaining } from '../../../../../../utils/helpers';
import { FrontButton } from '../../../../Global/button';
import { FrontDropdown } from '../../../../Global/dropdown';
import { FrontRoutesList } from '../../../FrontRoutesList';
import { TimeRemaining } from '../../../../../../models/helpers';

interface FilterInitialValues {
    status: BidStatusFilters;
    propertyName: string;
    bidTimer: number | null;
}

const BidsHost = observer(() => {
    const { reservationsStore, dictionaryStore, propertiesStore } = useStores();
    const [lazyParams, setLazyParams] = useState<DataTablePFSEvent | BidLazyParamsWithFilter>({
        first: 0,
        rows: DataTableParams.rowsCount,
        page: 0,
        status: BidStatusFilters.all,
        propertyName: '',
        bidTimer: null,
        sortField: '',
        sortOrder: 1,
    });

    const initialValues: FilterInitialValues = {
        status: BidStatusFilters.all,
        propertyName: '',
        bidTimer: null,
    };
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
        return formatIntoPriceValue(rowData.hostPayout ?? 0, true);
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

    const onSubmit = async (values: FilterInitialValues) => {
        setLazyParams((prevParams) => ({
            ...prevParams,
            status: values.status,
            propertyName: values.propertyName,
            bidTimer: values.bidTimer,
            page: 0,
            first: 0,
            sortField: '',
            sortOrder: 1,
        }));
    };

    const onReset = async () => {
        setLazyParams({
            first: 0,
            rows: DataTableParams.rowsCount,
            page: 0,
            status: BidStatusFilters.all,
            propertyName: '',
            bidTimer: null,
            sortField: '',
            sortOrder: 1,
        });
    };

    const onSort = (e: DataTablePFSEvent) => {
        setLazyParams((prevParams) => ({
            ...prevParams,
            sortField: e.sortField,
            sortOrder: e.sortOrder,
        }));
    };

    const bidStatuses = [
        { fullName: BidStatusFilters.all },
        ...dictionaryStore
            .getDictionary(DictionaryCode.bidStatuses)
            .filter((status) => status.fullName !== BidStatusFilters.approved),
    ];

    const sortedPropertyNames = useMemo(
        () =>
            propertiesStore.namesList.items
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })),
        [propertiesStore.namesList.items]
    );

    const bidTimers = [
        { label: '< 12 hours remaining', duration: dateConfig.values.halfDayHours },
        { label: '< 24 hours remaining', duration: dateConfig.values.dayHours },
        { label: '< 2 days remaining', duration: dateConfig.values.twoDaysHours },
        { label: '< 7 days remaining', duration: dateConfig.values.weekHours },
    ];

    const enablePaginator = reservationsStore.bidsList.count > lazyParams.rows;

    useEffect(() => {
        reservationsStore.fetchBidsList(
            UserType.host,
            {
                limit: lazyParams.rows,
                offset: (lazyParams.page ?? 0) * lazyParams.rows,
                status: lazyParams.status,
                propertyName: lazyParams.propertyName,
                bidTimer: lazyParams.bidTimer,
                sortField: lazyParams.sortField,
                sortOrder: lazyParams.sortOrder,
            },
            true
        );
    }, [
        lazyParams.page,
        lazyParams.propertyName,
        lazyParams.status,
        lazyParams.bidTimer,
        lazyParams.sortField,
        lazyParams.sortOrder,
    ]);

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    useEffect(() => {
        propertiesStore.fetchNamesList();
    }, []);

    const rowClass = (data: Reservation) => {
        return {
            'p-row_unread': !data.isHostRead,
        };
    };

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb-big">
                <h2 className="h4-style title">Bids</h2>
            </div>
            <Formik initialValues={initialValues} onSubmit={onSubmit}>
                {(props) => (
                    <Form className="mb-smtb">
                        <div className="form-wrap">
                            <label className="mb-2">Filter by:</label>
                            <div className="form-filter mb-big">
                                <div className="form-group width1">
                                    <div className="input-wrap has-content select-wrap">
                                        <FrontDropdown
                                            optionValue="fullName"
                                            optionLabel="fullName"
                                            label="Status"
                                            id="status"
                                            value={props.values.status}
                                            options={bidStatuses}
                                            handlerDropdown={props.handleChange}
                                            name="status"
                                        />
                                    </div>
                                </div>
                                <div className="form-group width1">
                                    <div className="input-wrap has-content select-wrap">
                                        <FrontDropdown
                                            optionValue="name"
                                            optionLabel="name"
                                            label="Property"
                                            id="propertyName"
                                            filter
                                            filterBy="name"
                                            emptyFilterMessage="No properties found"
                                            resetFilterOnHide
                                            value={props.values.propertyName}
                                            options={sortedPropertyNames}
                                            handlerDropdown={props.handleChange}
                                            name="propertyName"
                                        />
                                    </div>
                                </div>
                                <div className="form-group width1">
                                    <div className="input-wrap has-content select-wrap">
                                        <FrontDropdown
                                            optionValue="duration"
                                            optionLabel="label"
                                            label="Timer"
                                            id="bidTimer"
                                            value={props.values.bidTimer}
                                            options={bidTimers}
                                            handlerDropdown={props.handleChange}
                                            name="bidTimer"
                                        />
                                    </div>
                                </div>

                                <div className="form-group buttons-group width0">
                                    <FrontButton className="btn btn-primary" type="submit" loading={props.isSubmitting}>
                                        Filter
                                    </FrontButton>
                                    <FrontButton className="btn clear-btn" type="reset" onClick={onReset}>
                                        <span className="icon-first fas fa-times"></span>Clear
                                    </FrontButton>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
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
                tableClassName="mb-big"
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

export default BidsHost;
