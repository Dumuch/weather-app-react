import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { MessagesTab, NotificationsTab } from './tabs';
import { appConfig } from '../../../../../../config/app';

const MessageCenterHost = observer(() => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handlerChangeTab = (tabId: number) => {
        return () => setActiveIndex(tabId);
    };

    const isActiveTabClass = (tabId: number): string => (activeIndex === tabId ? 'active' : '');

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb-smtb">
                <h2 className="h4-style title">Message Center</h2>
                <a href={`mailto:${appConfig.adminEmail}`} className="btn btn-border btn-sm">
                    Message to Administrator
                </a>
            </div>
            <div className="tabs-wrap">
                <ul className="nav nav-tabs" role="tablist">
                    <li className={isActiveTabClass(0)}>
                        <button aria-controls="tab-panel1" onClick={handlerChangeTab(0)}>
                            Messages
                        </button>
                    </li>
                    <li className={isActiveTabClass(1)}>
                        <button aria-controls="tab-panel2" onClick={handlerChangeTab(1)}>
                            Notifications
                        </button>
                    </li>
                </ul>
                <TabView
                    renderActiveOnly={false}
                    activeIndex={activeIndex}
                    onTabChange={(e) => handlerChangeTab(e.index)}
                    className="smaller-tab-padding"
                >
                    <TabPanel header="Messages">
                        <MessagesTab />
                    </TabPanel>
                    <TabPanel header="Notifications">
                        <NotificationsTab />
                    </TabPanel>
                </TabView>
            </div>
        </div>
    );
});

export default MessageCenterHost;
