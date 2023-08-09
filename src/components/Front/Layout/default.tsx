import React, { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/router';
import changeStyle from './changeStyles';
import HeadComponent from './head';
import Header from './header';
import Footer from './footer';
import { useStores } from '../../../store';
import { BackRoutesList } from '../../Back/Pages/BackRoutesList';
import { FrontRoutesList } from '../Pages/FrontRoutesList';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AlertType, FrontNotificationField } from '../Global/notificationField';
import { StripeAccountStatusType, UserType } from '../../../models/api';
import Link from 'next/link';
import classnames from 'classnames';
import dynamic from 'next/dynamic';

interface Props {
    children?: React.ReactNode;
    title?: string;
    route?: BackRoutesList;
    sidebarEnabled?: boolean;
    isFullHeight?: boolean;
}

const DynamicSidebar = dynamic(() => import('./sidebar'));

const DefaultLayout: FC<Props> = observer(({ children, title, sidebarEnabled = false, isFullHeight = false }) => {
    const { globalStore, userStore } = useStores();
    const router = useRouter();

    useEffect(() => {
        changeStyle();
        const bodyTag = document.getElementsByTagName('body')[0];
        if (
            router.route.match(/\/dashboard/) ||
            router.route.match(/\/properties/) ||
            router.route === FrontRoutesList.SignIn ||
            router.route === FrontRoutesList.SignUp ||
            router.route === FrontRoutesList.ForgotPwd ||
            router.route === FrontRoutesList.ResetPwd ||
            router.route === FrontRoutesList.Confirmation ||
            router.route === FrontRoutesList.HelpRequest
        ) {
            bodyTag.classList.add('bbs-authorized');
        } else {
            bodyTag.classList.remove('bbs-authorized');
        }

        return () => bodyTag.classList.remove('bbs-authorized');
    }, [router.route]);

    const saveToast = React.useRef<null | Toast>(null);
    useEffect(() => {
        globalStore.setToastRef(saveToast);
    }, []);

    const [userNotifications, setUserNotifications] = useState<string[]>([]);
    useEffect(() => {
        setUserNotifications(userStore.user?.notifications?.list ?? []);
    }, [userStore.isLoading]);

    const removeNotifications = () =>
        userStore.user && userStore.updateUser({ ...userStore.user, notifications: null }, false);

    const customBodyNotification = () => {
        return (
            <p>
                You do not have a Stripe account, or you have a problem with it. Please visit your&nbsp;
                <Link href={`${FrontRoutesList.DashboardProfile}?tabIndex=1`} passHref>
                    <a>profile settings.</a>
                </Link>
            </p>
        );
    };

    return (
        <>
            <HeadComponent title={title ?? 'BBS'} />
            <div id="page-wrap" className={classnames({ 'full-height-page': isFullHeight })}>
                <Toast ref={saveToast} />
                <Header />
                <main className="dashboard-content">
                    {sidebarEnabled ? (
                        <div className="bbs-panels-wrap container">
                            <DynamicSidebar />
                            {globalStore.isLoading && (
                                <ProgressSpinner
                                    className={'progress-spinner progress-spinner_front progress-spinner_opacity'}
                                    animationDuration={'1.4s'}
                                />
                            )}
                            {(userNotifications.length > 0 && userStore.activeType === UserType.guest) ||
                            (userStore.activeType === UserType.host &&
                                userStore.user &&
                                userStore.user?.stripeAccountStatus !== StripeAccountStatusType.completed &&
                                router.route !== FrontRoutesList.Dashboard) ? (
                                <div className={'wrapper-main-panel'}>
                                    {userStore.activeType === UserType.host &&
                                    userStore.user?.stripeAccountStatus !== StripeAccountStatusType.completed ? (
                                        <FrontNotificationField
                                            alertType={AlertType.danger}
                                            message={''}
                                            closeButton={false}
                                            handlerCloseButton={removeNotifications}
                                            isMarginBottom={false}
                                            iconSrc={'/assets/img/i-info.svg'}
                                            customBody={customBodyNotification}
                                        />
                                    ) : (
                                        <FrontNotificationField
                                            alertType={AlertType.warning}
                                            message={userNotifications.join('<br/>')}
                                            closeButton={true}
                                            handlerCloseButton={removeNotifications}
                                            isMarginBottom={false}
                                            iconSrc={'/assets/img/i-info.svg'}
                                            isHTML={true}
                                        />
                                    )}

                                    {children}
                                </div>
                            ) : (
                                <>{children}</>
                            )}
                        </div>
                    ) : (
                        <>{children}</>
                    )}
                </main>
            </div>
            <Footer />
            <link href="/assets/css/prime-core.min.css" rel="stylesheet" />
            <link href="/assets/css/base.min.css" rel="stylesheet" />
            <link href="/assets/css/PrimeReact-BBS-theme.css" rel="stylesheet" data-front={true} />
            <link href="/assets/css/style.min.css" rel="stylesheet" data-front={true} />
        </>
    );
});

export default DefaultLayout;
