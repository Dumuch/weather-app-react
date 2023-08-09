import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useRef, useState } from 'react';
import { dateConfig } from '../../../../../config/date';
import { Message } from '../../../../../models/api';
import { useStores } from '../../../../../store';
import { getFormatData } from '../../../../../utils/dateTime';
import { concatString } from '../../../../../utils/helpers';

interface Props {
    messages: Message[];
}

const CHAT_HEIGHT = 344;

const ChatBlock: FC<Props> = observer(({ messages }) => {
    const { userStore, messagesStore } = useStores();
    const chatContainer = useRef<HTMLDivElement | null>(null);
    const [scrollHeight, setScrollHeight] = useState(CHAT_HEIGHT);

    useEffect(() => {
        if (!chatContainer.current) return;
        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
        setScrollHeight(chatContainer.current.scrollHeight);
    }, [messagesStore.listByReservation.items, chatContainer.current?.scrollHeight]);

    return messages?.length > 0 ? (
        <div className={classnames('chat', { 'chat-overflow': scrollHeight > CHAT_HEIGHT })} ref={chatContainer}>
            {messages.map((message) => {
                const isOwnMessage = message.from?.id === userStore.user?.id;
                const formattedBody = message.body.replaceAll('\n', '<br>').replaceAll(' ', '&thinsp;');
                return (
                    <div
                        key={message.id}
                        className={classnames('message', { in: !isOwnMessage }, { out: isOwnMessage })}
                    >
                        <div className="user small">
                            {!isOwnMessage
                                ? `${concatString([message.from?.firstName ?? '', message.from?.lastName ?? ''])} | `
                                : null}
                            {getFormatData(message.createdAt, dateConfig.formats.dateWithoutSeconds)}
                        </div>
                        <div className="text" dangerouslySetInnerHTML={{ __html: formattedBody }} />
                    </div>
                );
            })}
        </div>
    ) : (
        <div className="textbox">
            <p>There are no messages yet.</p>
        </div>
    );
});

export default ChatBlock;
