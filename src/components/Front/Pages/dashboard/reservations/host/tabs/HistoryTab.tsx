import { Form, Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { Column, ColumnProps } from 'primereact/column';
import { DataTable, DataTablePFSEvent } from 'primereact/datatable';
import { PaginatorTemplate } from 'primereact/paginator';
import { useEffect, useMemo, useState } from 'react';
import { dateConfig } from '../../../../../../../config/date';
import { paginationTemplate } from '../../../../../../../config/table';
import {
    DictionaryCode,
    ReservationLazyParamsWithFilter,
    Reservation,
    ReservationStatus,
    UserType,
} from '../../../../../../../models/api';
import { useStores } from '../../../../../../../store';
import { DataTableParams, ReservationStatusFilters } from '../../../../../../../utils/constants';
import { getFormatData } from '../../../../../../../utils/dateTime';
import { concatString } from '../../../../../../../utils/helpers';
import { FrontButton } from '../../../../../Global/button';
import { FrontDropdown } from '../../../../../Global/dropdown';
import { FrontRoutesList } from '../../../../FrontRoutesList';

interface FilterInitialValues {
    status: ReservationStatusFilters;
    propertyName: string;
}

const HistoryTab = observer(() => {
    const { reservationsStore, dictionaryStore, propertiesStore } = useStores();
    const [lazyParams, setLazyParams] = useState<DataTablePFSEvent | ReservationLazyParamsWithFilter>({
        first: 0,
        rows: DataTableParams.rowsCount,
        page: 0,
        status: ReservationStatusFilters.all,
        propertyName: '',
    });

    const initialValues: FilterInitialValues = {
        status: ReservationStatusFilters.all,
        propertyName: '',
    };

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
            <>
                <Link href={`${FrontRoutesList.DashboardReservations}/${rowData.id}`}>
                    <a className="details-link">
                        Details
                        <span className="fas fa-chevron-right" />
                    </a>
                </Link>
            </>
        );
    };

    const tableFields: { [index: string]: ColumnProps } = {
        dates: { field: 'checkIn', header: 'Dates' },
        property: { field: 'property.name', header: 'Property' },
        guest: { field: 'guest.firstName', header: 'Guest' },
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
            page: 0,
            first: 0,
        }));
    };

    const sortedPropertyNames = useMemo(
        () =>
            propertiesStore.namesList.items
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })),
        [propertiesStore.namesList.items]
    );

    useEffect(() => {
        propertiesStore.fetchNamesList();
    }, []);

    const reservationStatuses = [
        { fullName: ReservationStatusFilters.all },
        { fullName: ReservationStatusFilters.completed },
        { fullName: ReservationStatusFilters.canceled },
        { fullName: ReservationStatusFilters.declined },
    ];

    const enablePaginator = reservationsStore.list.items.all.count > lazyParams.rows;

    useEffect(() => {
        reservationsStore.fetchList(
            UserType.host,
            ReservationStatus.all,
            {
                limit: lazyParams.rows,
                offset: (lazyParams.page ?? 0) * lazyParams.rows,
                status: lazyParams.status,
                propertyName: lazyParams.propertyName,
            },
            true
        );
    }, [lazyParams.page, lazyParams.propertyName, lazyParams.status]);

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    return (
        <>
            <Formik initialValues={initialValues} onSubmit={onSubmit}>
                {(props) => (
                    <Form className="mb-big">
                        <div className="form-wrap">
                            <label>Filter by:</label>
                            <div className="form-filter mb-big">
                                <div className="form-group width1">
                                    <FrontDropdown
                                        optionValue="fullName"
                                        optionLabel="fullName"
                                        label="Status"
                                        id="status"
                                        value={props.values.status}
                                        options={reservationStatuses}
                                        handlerDropdown={props.handleChange}
                                        name="status"
                                    />
                                </div>
                                <div className="form-group width2">
                                    <div className="input-wrap">
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
                                <div className="form-group buttons-group width0">
                                    <FrontButton className="btn btn-primary" type="submit" loading={props.isSubmitting}>
                                        Filter
                                    </FrontButton>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
            <DataTable
                value={reservationsStore.list.items.all.data}
                dataKey="id"
                responsiveLayout="stack"
                breakpoint="566px"
                selectionMode="checkbox"
                loading={reservationsStore.list.items.all.isLoading}
                paginator={enablePaginator}
                // using 'as' because we want to customize PageLinks only, but other properties are required
                paginatorTemplate={paginationTemplate as PaginatorTemplate}
                lazy
                first={lazyParams.first}
                rows={lazyParams.rows}
                onPage={onPage}
                totalRecords={reservationsStore.list.items.all.count}
            >
                <Column
                    className="w-3"
                    field={tableFields.dates.field}
                    header={tableFields.dates.header}
                    body={datesBodyTemplate}
                />
                <Column className="w-4" field={tableFields.property.field} header={tableFields.property.header} />
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

export default HistoryTab;
