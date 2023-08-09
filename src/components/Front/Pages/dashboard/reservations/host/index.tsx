import { observer } from 'mobx-react-lite';
import { TabPanel, TabView } from 'primereact/tabview';
import { HistoryTab, PendingTab, UpcomingTab } from './tabs';
import { useTabView } from '../../../../../../utils/useTabView';

const ReservationsHost = observer(() => {
    const { activeIndex, isActiveTabClass, handlerChangeTab } = useTabView(2, []);
    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb">
                <h2 className="h4-style title">Reservations</h2>
            </div>
            <div className="tabs-wrap">
                <ul className="nav nav-tabs" role="tablist">
                    <li className={isActiveTabClass(0)}>
                        <button aria-controls="tab-panel1" onClick={handlerChangeTab(0)}>
                            Pending
                        </button>
                    </li>
                    <li className={isActiveTabClass(1)}>
                        <button aria-controls="tab-panel2" onClick={handlerChangeTab(1)}>
                            Upcoming
                        </button>
                    </li>
                    <li className={isActiveTabClass(2)}>
                        <button aria-controls="tab-panel3" onClick={handlerChangeTab(2)}>
                            History
                        </button>
                    </li>
                </ul>
                <TabView
                    renderActiveOnly={false}
                    activeIndex={activeIndex}
                    onTabChange={(e) => handlerChangeTab(e.index)}
                    className="smaller-tab-padding"
                >
                    <TabPanel header="Pending">
                        <PendingTab />
                    </TabPanel>
                    <TabPanel header="Upcoming">
                        <UpcomingTab />
                    </TabPanel>
                    <TabPanel header="History">
                        <HistoryTab />
                    </TabPanel>
                </TabView>
            </div>
        </div>
    );
});

export default ReservationsHost;
