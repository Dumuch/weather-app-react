import ProfileSectionNotificationsForm from './notifications';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../store';
import React, { useEffect, useState } from 'react';
import ProfileSectionGeneral from './general';
import { TabView, TabPanel } from 'primereact/tabview';
import ProfileSectionPayment from './payment';
import ProfileChangePasswordForm from './modalChangePassword';
import { FrontButton } from '../../../Global/button';
import { UserType } from '../../../../../models/api';
import ProfileSectionStatistics from './statistics';
import { useRouter } from 'next/router';
import { FrontRoutesList } from '../../FrontRoutesList';

const DashboardProfileSection = observer(() => {
    const { userStore } = useStores();
    const router = useRouter();
    const [openModalChangePassword, setOpenModalChangePassword] = useState(false);
    const toggleModalChangePhoto = () => setOpenModalChangePassword(!openModalChangePassword);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        if (typeof router.query?.tabIndex === 'string') {
            if (
                (userStore.activeType === UserType.host && Number(router.query.tabIndex) > 3) ||
                (userStore.activeType !== UserType.host && Number(router.query.tabIndex) > 2)
            ) {
                router.replace(`${FrontRoutesList.DashboardProfile}?tabIndex=0`);
            } else {
                setActiveIndex(Number(router.query.tabIndex));
            }
        } else {
            setActiveIndex(0);
            router.replace(`${FrontRoutesList.DashboardProfile}?tabIndex=0`);
        }
    }, [router.query]);

    const handlerChangeTab = (tabId: number) => {
        return () => {
            setActiveIndex(tabId);
            router.replace(`${FrontRoutesList.DashboardProfile}?tabIndex=${tabId}`);
        };
    };

    const isActiveTabClass = (tabId: number): string => (activeIndex === tabId ? 'active' : '');

    return (
        <>
            <div className="main-panel">
                <div className="block-heading align-justify">
                    <h2 className="h4-style title">Profile</h2>
                    <FrontButton className={'btn-primary btn-sm'} type={'button'} onClick={toggleModalChangePhoto}>
                        Change Password
                    </FrontButton>
                </div>
                <div className="tabs-wrap">
                    <ul className="nav nav-tabs" role="tablist">
                        <li className={isActiveTabClass(0)}>
                            <button onClick={handlerChangeTab(0)}>General</button>
                        </li>
                        <li className={isActiveTabClass(1)}>
                            <button onClick={handlerChangeTab(1)}>Payment Info</button>
                        </li>
                        <li className={isActiveTabClass(2)}>
                            <button onClick={handlerChangeTab(2)}>Notifications</button>
                        </li>
                        {userStore.activeType === UserType.host && (
                            <li className={isActiveTabClass(3)}>
                                <button onClick={handlerChangeTab(3)}>Performance &amp; Statistics</button>
                            </li>
                        )}
                    </ul>
                    {activeIndex !== null && (
                        <TabView
                            renderActiveOnly={false}
                            activeIndex={activeIndex}
                            onTabChange={(e) => handlerChangeTab(e.index)}
                        >
                            <TabPanel header="General">
                                <ProfileSectionGeneral />
                            </TabPanel>
                            <TabPanel header="Payment Info">
                                <ProfileSectionPayment />
                            </TabPanel>
                            <TabPanel header="Notifications">
                                <ProfileSectionNotificationsForm />
                            </TabPanel>
                            {userStore.activeType === UserType.host && (
                                <TabPanel header="Performance &amp; Statistics">
                                    <ProfileSectionStatistics />
                                </TabPanel>
                            )}
                        </TabView>
                    )}
                </div>
            </div>
            <ProfileChangePasswordForm
                isOpenModal={openModalChangePassword}
                closeModalChangePassword={toggleModalChangePhoto}
            />
        </>
    );
});

export default DashboardProfileSection;
