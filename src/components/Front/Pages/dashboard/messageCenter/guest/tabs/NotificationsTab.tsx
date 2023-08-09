import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { Column, ColumnProps } from 'primereact/column';
import { DataTable, DataTablePFSEvent, DataTableRowClickEventParams } from 'primereact/datatable';
import { useStores } from '../../../../../../../store';
import { LazyParams, Message, MessageTypes, UserType } from '../../../../../../../models/api';
import { concatString, delimitString } from '../../../../../../../utils/helpers';
import { getFormatData } from '../../../../../../../utils/dateTime';
import { dateConfig } from '../../../../../../../config/date';
import ReplyModal from '../../modals/ReplyModal';
import RemoveMessageModal from '../../modals/RemoveMessageModal';
import { MAX_TOPIC_CHARS } from '.';
import { DataTableParams } from '../../../../../../../utils/constants';
import { paginationTemplate } from '../../../../../../../config/table';
import { PaginatorTemplate } from 'primereact/paginator';

const NotificationsTab = observer(() => {
    const { messagesStore } = useStores();

    const [lazyParams, setLazyParams] = useState<DataTablePFSEvent | LazyParams>({
        first: 0,
        rows: DataTableParams.rowsCount,
        page: 0,
    });

    const [visibleModal, setVisibleModal] = useState<'reply' | 'remove' | ''>('');

    const [modalMetadata, setModalMetadata] = useState<Message | null>(null);

    const parser = useMemo(() => new DOMParser(), []);

    const showReplyModal = () => setVisibleModal('reply');
    const showRemoveMessageModal = (rowData: Message) => () => {
        setModalMetadata(rowData);
        setVisibleModal('remove');
    };

    const dateBodyTemplate = (rowData: Message) => {
        return getFormatData(rowData.createdAt, dateConfig.formats.dateWithoutSeconds, true);
    };

    const topicBodyTemplate = (rowData: Message) => {
        return delimitString(rowData.subject ?? '', MAX_TOPIC_CHARS);
    };

    const checkInOutBodyTemplate = (rowData: Message) => {
        const checkIn = getFormatData(rowData.reservation?.checkIn, dateConfig.formats.localizedDate, true);
        const checkOut = getFormatData(rowData.reservation?.checkOut, dateConfig.formats.localizedDate, true);
        return concatString([checkIn, checkOut], ' - ');
    };

    const actionBodyTemplate = (rowData: Message) => {
        return (
            <a onClick={showRemoveMessageModal(rowData)} className="btn-delete" title="Delete">
                <span className="far fa-trash-alt" />
            </a>
        );
    };

    const rowClass = (data: Message) => {
        return {
            unread: !data.isRead,
            'has-reply': data.replyTo,
        };
    };

    const onRowClick = (e: DataTableRowClickEventParams) => {
        setModalMetadata(e.data);
        showReplyModal();
    };

    const tableFields: { [index: string]: ColumnProps } = {
        date: { field: 'createdAt', header: 'Date' },
        topic: { field: 'body', header: 'Topic' },
        property: { field: 'reservation.property.name', header: 'Property' },
        checkInOut: { field: 'reservation.checkIn', header: 'Check-in - Check-out' },
    };

    const onPage = (event: DataTablePFSEvent) => {
        setLazyParams(event);
    };

    const enablePaginator = messagesStore.list.notification.count > lazyParams.rows;

    useEffect(() => {
        const offset = (lazyParams.page ?? 0) * lazyParams.rows;
        messagesStore.fetchMessages({
            messageType: MessageTypes.notification,
            userType: UserType.guest,
            limit: lazyParams.rows,
            offset: offset,
        });
    }, [lazyParams.page]);
    return (
        <>
            <DataTable
                value={messagesStore.list.notification.rows}
                dataKey="id"
                responsiveLayout="stack"
                breakpoint="672px"
                selectionMode="checkbox"
                loading={messagesStore.list.notification.isLoading}
                rowClassName={rowClass}
                onRowClick={onRowClick}
                className="messages-table"
                lazy
                paginator={enablePaginator}
                // using 'as' because we want to customize PageLinks only, but other properties are required
                paginatorTemplate={paginationTemplate as PaginatorTemplate}
                first={lazyParams.first}
                rows={lazyParams.rows}
                totalRecords={messagesStore.list.notification.count}
                onPage={onPage}
            >
                <Column
                    className="w-2"
                    field={tableFields.date.field}
                    header={tableFields.date.header}
                    body={dateBodyTemplate}
                />
                <Column
                    className="w-2"
                    field={tableFields.topic.field}
                    header={tableFields.topic.header}
                    body={topicBodyTemplate}
                />
                <Column className="w-3" field={tableFields.property.field} header={tableFields.property.header} />
                <Column
                    className="w-3"
                    field={tableFields.checkInOut.field}
                    header={tableFields.checkInOut.header}
                    body={checkInOutBodyTemplate}
                />
                <Column className="w-1" header="" body={actionBodyTemplate} exportable={false} />
            </DataTable>
            <ReplyModal
                readonly
                message={modalMetadata}
                userType={UserType.guest}
                isVisible={visibleModal === 'reply'}
                setIsVisible={setVisibleModal}
                limit={lazyParams.rows}
                offset={(lazyParams.page ?? 0) * lazyParams.rows}
            />
            <RemoveMessageModal
                messageId={modalMetadata?.id ?? ''}
                isVisible={visibleModal === 'remove'}
                setIsVisible={setVisibleModal}
                userType={UserType.guest}
                limit={lazyParams.rows}
                offset={(lazyParams.page ?? 0) * lazyParams.rows}
            />
        </>
    );
});

export default NotificationsTab;
