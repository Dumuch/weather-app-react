import { TabPanel, TabView } from 'primereact/tabview';
import { FC, useEffect, useState } from 'react';
import { UserType } from '../../../../models/api';
import { HelpQuestion } from '../../../../models/api/helpCenter';
import GuestTab from './tabs/GuestTab';
import HostTab from './tabs/HostTab';

interface Props {
    questionsList: HelpQuestion[];
}

const CommonlyAskedQuestions: FC<Props> = ({ questionsList }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [guestQuestions, setGuestQuestions] = useState<HelpQuestion[]>([]);
    const [hostQuestions, setHostQuestions] = useState<HelpQuestion[]>([]);
    const handleChangeTab = (tabId: number) => () => setActiveIndex(tabId);

    const isActiveTabClass = (tabId: number): string => (activeIndex === tabId ? 'active' : '');
    useEffect(() => {
        const guestQuestionsList = questionsList.filter(
            (question) => question.questionType?.shortName === UserType.guest
        );
        const hostQuestionsList = questionsList.filter(
            (question) => question.questionType?.shortName === UserType.host
        );
        setGuestQuestions(guestQuestionsList);
        setHostQuestions(hostQuestionsList);
    }, []);
    return (
        <div className="col-sm-6 indent-right">
            <div className="content-section">
                <h2 className="h4-style mb-big">Commonly Asked Questions</h2>
                <div className="tabs-wrap">
                    <ul className="nav nav-tabs" role="tablist">
                        <li className={isActiveTabClass(0)}>
                            <button aria-controls="tab-panel1" onClick={handleChangeTab(0)}>
                                Guest
                            </button>
                        </li>
                        <li className={isActiveTabClass(1)}>
                            <button aria-controls="tab-panel2" onClick={handleChangeTab(1)}>
                                Host
                            </button>
                        </li>
                    </ul>
                    <TabView
                        renderActiveOnly={false}
                        activeIndex={activeIndex}
                        onTabChange={(e) => handleChangeTab(e.index)}
                    >
                        <TabPanel header="Guest">
                            <GuestTab questions={guestQuestions} />
                        </TabPanel>
                        <TabPanel header="Host">
                            <HostTab questions={hostQuestions} />
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default CommonlyAskedQuestions;
