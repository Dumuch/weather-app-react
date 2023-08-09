import React, { FC, PropsWithChildren, useEffect } from 'react';
import { Avatar } from 'primereact/avatar';
import { useRouter } from 'next/router';
import { SidePanel } from '../SideMenu';
import { useStores } from '../../../store';
import { BackRoutesList } from '../Pages/BackRoutesList';
import Link from 'next/link';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuthCheck } from '../../../utils/useAuthCheck';
import { observer } from 'mobx-react-lite';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { concatString } from '../../../utils/helpers';
import Head from 'next/head';
import { FrontRoutesList } from '../../Front/Pages/FrontRoutesList';
import { SignOut } from '../../../utils/amplifyHelpers';
import changeStyle from './changeStyles';

interface Props {
    className?: string;
    route?: BackRoutesList;
    pageTitle?: string;
}

const DashboardLayout: FC<PropsWithChildren<Props>> = observer(
    ({ children, className = '', route = BackRoutesList.SignIn, pageTitle = 'Welcome to Admin Panel' }) => {
        const { authenticated, checkingAuth } = useAuthCheck(route, true);
        const router = useRouter();
        const { userStore, globalStore } = useStores();
        const saveToast = React.useRef<null | Toast>(null);

        React.useEffect(() => {
            globalStore.setToastRef(saveToast);
        }, [authenticated]);

        useEffect(() => {
            changeStyle();
        }, []);

        const signOut = async (event: { preventDefault: () => void }) => {
            event.preventDefault();
            try {
                await SignOut(userStore);
                router.replace(BackRoutesList.SignIn);
            } catch (error) {
                console.log('error signing out: ', error);
            }
        };

        if (checkingAuth) return checkingAuth;
        if (authenticated) {
            return (
                <>
                    <Head>
                        <title>{pageTitle}</title>
                        <link href="/assets/css/prime-core.min.css" rel="stylesheet" />
                        <link href="/assets/css/manager.min.css" rel="stylesheet" />
                    </Head>
                    <Toast ref={saveToast} />
                    <div className="admin-dashboard">
                        <div className="side-panel">
                            <header>
                                <Avatar
                                    label={concatString([
                                        userStore.user?.firstName[0] ?? '',
                                        userStore.user?.lastName[0] ?? '',
                                    ])
                                        .replaceAll(' ', '')
                                        .toUpperCase()}
                                    className="avatar"
                                    size="xlarge"
                                    shape="circle"
                                />
                                <div className="user-wrapper">
                                    <span>
                                        {userStore.user?.firstName} {userStore.user?.lastName}
                                    </span>
                                    <div className="user-options">
                                        <Link href={FrontRoutesList.Default}>
                                            <a title="Home" target="_blank">
                                                <span className="icon pi pi-home"></span>
                                            </a>
                                        </Link>
                                        <Link href={`${BackRoutesList.UserList}/${userStore.user?.id}`}>
                                            <a className="ml-2" title="My Account">
                                                <span className="icon pi pi-user"></span>
                                            </a>
                                        </Link>
                                        <a className="ml-2" title="Log out" onClick={signOut}>
                                            <span className=" icon pi pi-sign-out"></span>
                                        </a>
                                    </div>
                                </div>
                            </header>
                            <aside>
                                <SidePanel />
                            </aside>
                        </div>

                        <main className={`dashboard-content ${className}`}>
                            <ConfirmDialog />
                            {globalStore.isLoading && (
                                <ProgressSpinner
                                    className={'progress-spinner progress-spinner_opacity'}
                                    animationDuration={'1.4s'}
                                />
                            )}
                            {children}
                        </main>
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <link href="/assets/css/prime-core.min.css" rel="stylesheet" />
                    <link href="/assets/css/manager.min.css" rel="stylesheet" />
                </>
            );
        }
    }
);

export default DashboardLayout;
