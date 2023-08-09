import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { DashboardActionPanel } from './ActionPanel';
import { currentSortText } from '../../../utils/helpers';
import { tableConfig } from '../../../config/table';
import { DataTable } from 'primereact/datatable';
import { useLazyTable } from '../../../utils/useLazyTable';
import { ColumnProps } from 'primereact/column';
import { observer } from 'mobx-react-lite';
import { UserType } from '../../../models/api';

interface Props {
    children?: React.ReactNode;
    store: any;
    fetchList: string;
    tableFields: { [index: string]: ColumnProps };
    initialSort?: { sortField: string; order: number };
    filters?: unknown;
    isPageReset?: boolean;
    setIsPageReset?: Dispatch<SetStateAction<boolean>>;
}

export const DashBoardLazyTable: FunctionComponent<Props> = observer(
    ({ children, store, fetchList, tableFields, initialSort, filters, isPageReset, setIsPageReset }) => {
        const { resetMultiSort, onPage, onSort, lazyParams } = useLazyTable(
            store,
            fetchList,
            initialSort,
            UserType.admin,
            false,
            filters,
            isPageReset,
            setIsPageReset
        );

        return (
            <>
                <DashboardActionPanel
                    reset={resetMultiSort}
                    sortName={currentSortText(tableFields, lazyParams.sortOrder, lazyParams.sortField)}
                    count={store.list.count}
                    lazyParams={lazyParams}
                    onPage={onPage}
                ></DashboardActionPanel>
                <DataTable
                    value={store.list.items}
                    dataKey="id"
                    responsiveLayout="scroll"
                    selectionMode="checkbox"
                    lazy
                    first={lazyParams.first}
                    rows={tableConfig.row}
                    totalRecords={store.list.count}
                    onSort={onSort}
                    sortField={lazyParams.sortField}
                    //@ts-ignore
                    sortOrder={lazyParams.sortOrder}
                >
                    {children}
                </DataTable>
            </>
        );
    }
);
