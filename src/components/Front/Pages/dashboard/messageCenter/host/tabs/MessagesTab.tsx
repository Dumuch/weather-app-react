import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Column, ColumnProps } from 'primereact/column';
import { DataTable, DataTablePFSEvent, DataTableRowClickEventParams } from 'primereact/datatable';
import { useStores } from '../../../../../../../store';
import { LazyParams, Message, MessageTypes, UserType } from '../../../../../../../models/api';
import { Avatar } from 'primereact/avatar';
import { FrontImage } from '../../../../../Global/image';
import { concatString, delimitString } from '../../../../../../../utils/helpers';
import { getFormatData } from '../../../../../../../utils/dateTime';
import { dateConfig } from '../../../../../../../config/date';
import { MAX_TOPIC_CHARS } from '.';
import { DataTableParams } from '../../../../../../../utils/constants';
import { paginationTemplate } from '../../../../../../../config/table';
import { PaginatorTemplate } from 'primereact/paginator';
import ChatModal from '../../modals/ChatModal';
import RemoveChatModal from '../../modals/RemoveChatModal';

const MessagesTab = observer(() => {
    const { messagesStore, userStore } = useStores();

    const [lazyParams, setLazyParams] = useState<DataTablePFSEvent | LazyParams>({
        first: 0,
        rows: DataTableParams.rowsCount,
        page: 0,
    });

    const [visibleModal, setVisibleModal] = useState<'reply' | 'remove' | ''>('');

    const [modalMetadata, setModalMetadata] = useState<Message | null>(null);

    const showReplyModal = () => setVisibleModal('reply');
    const showRemoveMessageModal = (rowData: Message) => () => {
        setModalMetadata(rowData);
        setVisibleModal('remove');
    };
    const userBodyTemplate = (rowData: Message) => {
        return (
            <div className="user-wrap">
                <Avatar className="icon" shape="circle">
                    <FrontImage
                        src={`${rowData.from?.id}/${rowData.from?.profilePicture}`}
                        identityId="users"
                        width="auto"
                    />
                </Avatar>
                <span>{concatString([rowData.from?.firstName ?? '', rowData.from?.lastName ?? ''])}</span>
            </div>
        );
    };

    const dateBodyTemplate = (rowData: Message) => {
        return getFormatData(rowData.createdAt, dateConfig.formats.dateWithoutSeconds, true);
    };

    const topicBodyTemplate = (rowData: Message) => {
        return delimitString(rowData.body, MAX_TOPIC_CHARS);
    };

    const propertyBodyTemplate = (rowData: Message) => {
        return rowData.reservation?.property?.name || rowData.property?.name;
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
            unread: !data.isRead && data.fromUserId !== userStore.user?.id,
            'has-reply': data.fromUserId === userStore.user?.id,
        };
    };

    const onRowClick = (e: DataTableRowClickEventParams) => {
        setModalMetadata(e.data);
        showReplyModal();
    };

    const tableFields: { [index: string]: ColumnProps } = {
        user: { field: 'user.firstName', header: 'User' },
        date: { field: 'createdAt', header: 'Date' },
        topic: { field: 'body', header: 'Topic' },
        property: { field: 'reservation.property.name', header: 'Property' },
        checkInOut: { field: 'reservation.checkIn', header: 'Check-in - Check-out' },
    };

    const onPage = (event: DataTablePFSEvent) => {
        setLazyParams(event);
    };

    const enablePaginator = messagesStore.list.message.count > lazyParams.rows;

    useEffect(() => {
        const offset = (lazyParams.page ?? 0) * lazyParams.rows;
        messagesStore.fetchMessages({
            messageType: MessageTypes.message,
            userType: UserType.host,
            limit: lazyParams.rows,
            offset: offset,
        });
    }, [lazyParams.page]);
    return (
        <>
            <DataTable
                value={messagesStore.list.message.rows}
                dataKey="id"
                responsiveLayout="stack"
                breakpoint="672px"
                selectionMode="checkbox"
                loading={messagesStore.list.message.isLoading}
                rowClassName={rowClass}
                onRowClick={onRowClick}
                className="messages-table"
                lazy
                paginator={enablePaginator}
                // using 'as' because we want to customize PageLinks only, but other properties are required
                paginatorTemplate={paginationTemplate as PaginatorTemplate}
                first={lazyParams.first}
                rows={lazyParams.rows}
                totalRecords={messagesStore.list.message.count}
                onPage={onPage}
            >
                <Column
                    className="w-2"
                    field={tableFields.user.field}
                    header={tableFields.user.header}
                    body={userBodyTemplate}
                />
                <Column
                    className="w-1"
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
                <Column
                    className="w-3"
                    field={tableFields.property.field}
                    header={tableFields.property.header}
                    body={propertyBodyTemplate}
                />
                <Column
                    className="w-3"
                    field={tableFields.checkInOut.field}
                    header={tableFields.checkInOut.header}
                    body={checkInOutBodyTemplate}
                />
                <Column className="w-1" header="" body={actionBodyTemplate} exportable={false} />
            </DataTable>
            <ChatModal
                readonly={false}
                message={modalMetadata}
                userType={UserType.host}
                isVisible={visibleModal === 'reply'}
                setIsVisible={setVisibleModal}
                limit={lazyParams.rows}
                offset={(lazyParams.page ?? 0) * lazyParams.rows}
            />
            <RemoveChatModal
                reservationId={modalMetadata?.reservationId ?? ''}
                propertyId={modalMetadata?.propertyId ?? ''}
                isVisible={visibleModal === 'remove'}
                setIsVisible={setVisibleModal}
                userType={UserType.host}
                limit={lazyParams.rows}
                offset={(lazyParams.page ?? 0) * lazyParams.rows}
            />
        </>
    );
});

export default MessagesTab;
