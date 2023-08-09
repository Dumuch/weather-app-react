import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import classnames from 'classnames';
import Link from 'next/link';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { observer } from 'mobx-react-lite';
import { concatString } from '../../../utils/helpers';
import { FrontImage } from '../Global/image';
import { FrontRoutesList } from '../Pages/FrontRoutesList';
import DashboardSvg from '../../../../public/assets/img/i-acc-dashboard-grey.svg';
import ProfileSvg from '../../../../public/assets/img/i-acc-profile-grey.svg';
import PropertiesSvg from '../../../../public/assets/img/i-acc-properties-grey.svg';
import SearchSvg from '../../../../public/assets/img/i-acc-searches-grey.svg';
import ReservationsSvg from '../../../../public/assets/img/i-acc-reservations-grey.svg';
import BidsSvg from '../../../../public/assets/img/i-acc-bids-grey.svg';
import PaymentsSvg from '../../../../public/assets/img/i-acc-payments-grey.svg';
import MessageSvg from '../../../../public/assets/img/i-acc-message-grey.svg';
import { useStores } from '../../../store';
import { UserInfo, UserType } from '../../../models/api';
import { FrontStaticImage } from '../Global/staticImage';

const Sidebar = observer(() => {
    const { userStore, reservationsStore, messagesStore } = useStores();
    const [user, setUser] = useState<UserInfo | null>(null);
    const router = useRouter();

    useEffect(() => {
        userStore.user && setUser(userStore.user);
        userStore.user &&
            userStore.activeType &&
            (reservationsStore.fetchUnreadBidsCount({
                userType: userStore.activeType as Omit<UserType, 'admin'>,
            }),
            messagesStore.fetchUnreadMessagesCount({ userType: userStore.activeType as Omit<UserType, 'admin'> }));
    }, [userStore, userStore.isLoading]);

    if (!user) return null;
    return (
        <div className="account-panel hidden-sm hidden-xs">
            <div className="account-side-nav mb-big">
                <div className="user-name">
                    <Avatar className="dashboard-avatar" shape="circle">
                        <FrontImage src={`${user?.id}/${user?.profilePicture}`} identityId="users" width="auto" />
                    </Avatar>
                    <div>
                        <div>Welcome</div>
                        <div>
                            <strong>{concatString([user?.firstName ?? '', user?.lastName ?? ''])}</strong>
                        </div>
                    </div>
                </div>
                <ul>
                    <li
                        className={classnames({
                            'active svg-color-blue': router.route === FrontRoutesList.Dashboard,
                        })}
                    >
                        <Link href={FrontRoutesList.Dashboard}>
                            <a>
                                <span className="menu-icon">
                                    <FrontStaticImage src={DashboardSvg} />
                                </span>
                                Dashboard
                            </a>
                        </Link>
                    </li>
                    <li
                        className={classnames({
                            'active svg-color-blue': router.route === FrontRoutesList.DashboardProfile,
                        })}
                    >
                        <Link href={FrontRoutesList.DashboardProfile}>
                            <a>
                                <span className="menu-icon">
                                    <FrontStaticImage src={ProfileSvg} />
                                </span>
                                Profile
                            </a>
                        </Link>
                    </li>
                    {userStore.activeType === UserType.host ? (
                        <>
                            <li
                                className={classnames({
                                    'active svg-color-blue':
                                        router.pathname.indexOf(FrontRoutesList.DashboardProperties) >= 0 ||
                                        router.route === FrontRoutesList.DashboardProperties,
                                })}
                            >
                                <Link href={FrontRoutesList.DashboardProperties}>
                                    <a>
                                        <span className="menu-icon">
                                            <FrontStaticImage src={PropertiesSvg} />
                                        </span>
                                        Properties
                                    </a>
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li
                                className={classnames({
                                    'active svg-color-blue': router.route === FrontRoutesList.DashboardSavedSearches,
                                })}
                            >
                                <Link href={FrontRoutesList.DashboardSavedSearches}>
                                    <a>
                                        <span className="menu-icon">
                                            <FrontStaticImage src={SearchSvg} />
                                        </span>
                                        Saved Searches
                                    </a>
                                </Link>
                            </li>
                        </>
                    )}
                    <li
                        className={classnames({
                            'active svg-color-blue':
                                router.pathname.indexOf(FrontRoutesList.DashboardReservations) >= 0 ||
                                router.route === FrontRoutesList.DashboardReservations,
                        })}
                    >
                        <Link href={FrontRoutesList.DashboardReservations}>
                            <a>
                                <span className="menu-icon">
                                    <FrontStaticImage src={ReservationsSvg} />
                                </span>
                                Reservations
                            </a>
                        </Link>
                    </li>
                    <li
                        className={classnames({
                            'active svg-color-blue':
                                router.pathname.indexOf(FrontRoutesList.DashboardBids) >= 0 ||
                                router.route === FrontRoutesList.DashboardBids,
                        })}
                    >
                        <Link href={FrontRoutesList.DashboardBids}>
                            <a>
                                <span className="menu-icon">
                                    <FrontStaticImage src={BidsSvg} />
                                </span>
                                Bids
                                {reservationsStore.unreadBidsCount.data.count > 0 ? (
                                    <Badge value={reservationsStore.unreadBidsCount.data.count} />
                                ) : null}
                            </a>
                        </Link>
                    </li>
                    <li
                        className={classnames({
                            'active svg-color-blue': router.route === FrontRoutesList.DashboardPayments,
                        })}
                    >
                        <Link href={FrontRoutesList.DashboardPayments}>
                            <a>
                                <span className="menu-icon">
                                    <FrontStaticImage src={PaymentsSvg} />
                                </span>
                                Payments
                            </a>
                        </Link>
                    </li>
                    <li
                        className={classnames({
                            'active svg-color-blue': router.route === FrontRoutesList.DashboardMessageCenter,
                        })}
                    >
                        <Link href={FrontRoutesList.DashboardMessageCenter}>
                            <a>
                                <span className="menu-icon">
                                    <FrontStaticImage src={MessageSvg} />
                                </span>
                                Message Center
                                {messagesStore.unreadMessagesCount.data.count > 0 ? (
                                    <Badge value={messagesStore.unreadMessagesCount.data.count} />
                                ) : null}
                            </a>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
});

export default Sidebar;
