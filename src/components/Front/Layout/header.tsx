import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { Avatar } from 'primereact/avatar';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { RoutesListFront } from '../../Back/Pages/RoutesList';
import { useStores } from '../../../store';
import { SignOut } from '../../../utils/amplifyHelpers';
import { FrontStaticImage } from '../Global/staticImage';
import { UserInfo, UserType } from '../../../models/api';
import { FrontRoutesList } from '../Pages/FrontRoutesList';
import { useScroll } from '../../../utils/useScroll';
import { useAuthCheck } from '../../../utils/useAuthCheck';
import { FrontImage } from '../Global/image';
import Logo from '../../../../public/assets/img/logo.svg';
import DashboardSvg from '../../../../public/assets/img/i-acc-dashboard.svg';
import ProfileSvg from '../../../../public/assets/img/i-acc-profile.svg';
import PropertiesSvg from '../../../../public/assets/img/i-acc-properties.svg';
import SearchSvg from '../../../../public/assets/img/i-acc-searches.svg';
import ReservationsSvg from '../../../../public/assets/img/i-acc-reservations.svg';
import BidsSvg from '../../../../public/assets/img/i-acc-bids.svg';
import PaymentsSvg from '../../../../public/assets/img/i-acc-payments.svg';
import MessageSvg from '../../../../public/assets/img/i-acc-message.svg';
import { Badge } from 'primereact/badge';
import FrontSkeleton from '../Global/skeleton';
import { useRouter } from 'next/router';

interface UserWithActiveType extends UserInfo {
    activeType: string | null;
}

const Header = observer(() => {
    const menu = useRef<Menu>(null);
    const { userStore, reservationsStore, messagesStore, globalStore } = useStores();
    const router = useRouter();
    // hook for force update Header
    useAuthCheck();
    const [user, setUser] = useState<UserWithActiveType | null>(null);
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [menuClass, setMenuClass] = useState<string | null>(null);

    useEffect(() => {
        userStore.user && setUser({ ...userStore.user, activeType: userStore.activeType });
        userStore.user &&
            userStore.activeType &&
            (reservationsStore.fetchUnreadBidsCount({
                userType: userStore.activeType as Omit<UserType, 'admin'>,
            }),
            messagesStore.fetchUnreadMessagesCount({ userType: userStore.activeType as Omit<UserType, 'admin'> }));
    }, [userStore.user, userStore.isLoading]);

    useEffect(() => {
        !userStore.user && setUser(null);
    }, [userStore.user]);
    const { hasScrolled } = useScroll();

    const menuModel: MenuItem[] = [
        {
            label: 'Dashboard',
            template: (item, options) => (
                <Link href={FrontRoutesList.Dashboard}>
                    <a onClick={closeNavbar} className={options.className}>
                        <span className={options.iconClassName}>
                            <FrontStaticImage src={DashboardSvg} alt="icon" />
                        </span>
                        <span className={options.labelClassName}>{item.label}</span>
                    </a>
                </Link>
            ),
        },
        {
            label: 'Profile',
            template: (item, options) => (
                <Link href={FrontRoutesList.DashboardProfile}>
                    <a onClick={closeNavbar} className={options.className}>
                        <span className={options.iconClassName}>
                            <FrontStaticImage src={ProfileSvg} alt="icon" />
                        </span>
                        <span className={options.labelClassName}>{item.label}</span>
                    </a>
                </Link>
            ),
        },
        {
            label: user?.activeType === UserType.host ? 'Properties' : 'Saved Searches',
            template: (item, options) => {
                return user?.activeType === UserType.host ? (
                    <Link href={FrontRoutesList.DashboardProperties}>
                        <a onClick={closeNavbar} className={options.className}>
                            <span className={options.iconClassName}>
                                <FrontStaticImage src={PropertiesSvg} alt="icon" />
                            </span>
                            <span className={options.labelClassName}>{item.label}</span>
                        </a>
                    </Link>
                ) : (
                    <Link href={FrontRoutesList.DashboardSavedSearches}>
                        <a onClick={closeNavbar} className={options.className}>
                            <span className={options.iconClassName}>
                                <FrontStaticImage src={SearchSvg} alt="icon" />
                            </span>
                            <span className={options.labelClassName}>{item.label}</span>
                        </a>
                    </Link>
                );
            },
        },
        {
            label: 'Reservations',
            template: (item, options) => (
                <Link href={FrontRoutesList.DashboardReservations}>
                    <a onClick={closeNavbar} className={options.className}>
                        <span className={options.iconClassName}>
                            <FrontStaticImage src={ReservationsSvg} alt="icon" />
                        </span>
                        <span className={options.labelClassName}>{item.label}</span>
                    </a>
                </Link>
            ),
        },
        {
            label: 'Bids',
            template: (item, options) => (
                <Link href={FrontRoutesList.DashboardBids}>
                    <a onClick={closeNavbar} className={options.className}>
                        <span className={options.iconClassName}>
                            <FrontStaticImage src={BidsSvg} alt="icon" />
                        </span>
                        <span className={options.labelClassName}>{item.label}</span>
                        {reservationsStore.unreadBidsCount.data.count > 0 ? (
                            <Badge value={reservationsStore.unreadBidsCount.data.count} />
                        ) : null}
                    </a>
                </Link>
            ),
        },
        {
            label: 'Payments',
            template: (item, options) => (
                <Link href={FrontRoutesList.DashboardPayments}>
                    <a onClick={closeNavbar} className={options.className}>
                        <span className={options.iconClassName}>
                            <FrontStaticImage src={PaymentsSvg} alt="icon" />
                        </span>
                        <span className={options.labelClassName}>{item.label}</span>
                    </a>
                </Link>
            ),
        },
        {
            label: 'Message Center',
            template: (item, options) => (
                <Link href={FrontRoutesList.DashboardMessageCenter}>
                    <a onClick={closeNavbar} className={options.className}>
                        <span className={options.iconClassName}>
                            <FrontStaticImage src={MessageSvg} alt="icon" />
                        </span>
                        <span className={options.labelClassName}>{item.label}</span>
                        {messagesStore.unreadMessagesCount.data.count > 0 ? (
                            <Badge value={messagesStore.unreadMessagesCount.data.count} />
                        ) : null}
                    </a>
                </Link>
            ),
        },
    ];

    const signOut = async (event: MouseEvent) => {
        event.preventDefault();
        closeNavbar(event);
        try {
            await SignOut(userStore);
            globalStore.setLastRoute('');
            window.location.replace(FrontRoutesList.SignIn);
        } catch (error) {
            console.log('error signing out: ', error);
        }
    };

    const toggleMenu = (event: MouseEvent) => {
        // prevent page from jumping up on click
        event.preventDefault();
        // prevent navbar from collapsing on menu click
        setMenuIsOpen(!menuIsOpen);
        menu.current?.toggle(event);
        setMenuClass('shifted');
    };

    const closeNavbar = (event: MouseEvent) => {
        hideMenu(event);
        height = 0;
        closeHeader(false);
    };

    const showMenu = (event: MouseEvent) => {
        event.preventDefault();
        setMenuIsOpen(true);
        setMenuClass(null);
        menu.current?.show(event);
    };
    const hideMenu = (event: MouseEvent) => {
        setMenuIsOpen(false);
        setTimeout(() => {
            setMenuClass(null);
        }, 500);
        menu.current?.hide(event);
    };

    const navigator = useRef<HTMLDivElement>(null);
    const mobileBTN = useRef<HTMLButtonElement>(null);

    const closeHeader = (event: any) => {
        if (
            navigator.current &&
            mobileBTN.current &&
            !navigator.current.contains(event.target) &&
            !mobileBTN.current.contains(event.target)
        ) {
            document.removeEventListener('click', closeHeader);
            closeNavigation();
        }
    };
    let typingTimer: any = null;
    let height = 0;

    const openNavigation = () => {
        clearTimeout(typingTimer);

        if (mobileBTN.current && navigator.current) {
            navigator.current.style.display = 'block';
            navigator.current.style.opacity = '0';
            height = height > 0 ? height : navigator.current.clientHeight;
            navigator.current.style.opacity = '1';
            navigator.current.style.height = '0';
            navigator.current.style.boxShadow = 'none';
            typingTimer = setTimeout(() => {
                if (navigator.current) {
                    navigator.current.style.height = height + 'px';
                    navigator.current.style.boxShadow = '';
                }
            }, 0);
            typingTimer = setTimeout(() => {
                if (navigator.current) {
                    navigator.current.style.height = '';
                }
            }, 500);

            document.addEventListener('click', closeHeader);
            mobileBTN.current.setAttribute('aria-expanded', 'true');
        }
    };
    const closeNavigation = () => {
        clearTimeout(typingTimer);

        if (mobileBTN.current && navigator.current) {
            const height = navigator.current.clientHeight;
            navigator.current.style.height = height + 'px';
            typingTimer = setTimeout(() => {
                if (navigator.current) {
                    navigator.current.style.height = '0';
                }
            }, 0);

            typingTimer = setTimeout(() => {
                if (navigator.current) {
                    navigator.current.style.display = '';
                    navigator.current.style.height = '';
                }
            }, 500);

            mobileBTN.current.setAttribute('aria-expanded', 'false');
        }
    };

    const toggleNavigation = () => {
        if (mobileBTN.current && navigator.current) {
            if (mobileBTN.current.getAttribute('aria-expanded') === 'false') {
                openNavigation();
            } else {
                closeNavigation();
            }
        }
    };

    const handlerLogin = async (event: MouseEvent) => {
        closeNavbar(event);
        await SignOut(userStore);
    };

    return (
        <header id="header">
            <nav
                className={classnames('navbar', { affix: hasScrolled, 'affix-top': !hasScrolled })}
                data-spy="affix"
                data-offset-top="101"
            >
                <div className="container">
                    <div className="navbar-header">
                        <Link href="/">
                            <a className="navbar-brand" title="BidBookStay" onClick={closeNavbar}>
                                <FrontStaticImage
                                    src={Logo}
                                    alt={'BidBookStay'}
                                    layout="responsive"
                                    width={315}
                                    height={45}
                                />
                            </a>
                        </Link>
                        <button
                            id="mobile_nav_btn"
                            ref={mobileBTN}
                            type="button"
                            className="navbar-toggle collapsed"
                            data-toggle="collapse"
                            data-target-custom="#navigation"
                            aria-expanded={'false'}
                            onClick={toggleNavigation}
                        >
                            <span className="sr-only">Toggle navigation</span>
                            <span className="fas fa-bars fa-lg"></span>
                        </button>
                    </div>

                    <div className="collapse navbar-collapse" id="navigation" ref={navigator}>
                        <div className="inner-wrap">
                            <ul className="nav navbar-nav" id="main-nav">
                                <li
                                    className={classnames({
                                        active: router.route === FrontRoutesList.Properties,
                                    })}
                                >
                                    <Link href={FrontRoutesList.Properties}>
                                        <a onClick={closeNavbar}>
                                            <span className="icon fas fa-search" />
                                            Search
                                        </a>
                                    </Link>
                                </li>
                                <li className={classnames({ active: router.route === FrontRoutesList.HowToBid })}>
                                    <Link href={FrontRoutesList.HowToBid}>
                                        <a onClick={closeNavbar}>How to Bid</a>
                                    </Link>
                                </li>
                                <li className={classnames({ active: router.route === FrontRoutesList.ListWithUs })}>
                                    <Link href={FrontRoutesList.ListWithUs}>
                                        <a onClick={closeNavbar}>List with us</a>
                                    </Link>
                                </li>
                                {user && !user.isAdmin ? (
                                    <>
                                        <li
                                            className={classnames(
                                                { '': !menuIsOpen, open: menuIsOpen },
                                                'account-nav-wrap dropdown dropdown_split'
                                            )}
                                            onMouseEnter={showMenu}
                                            onMouseLeave={hideMenu}
                                        >
                                            <Link href={FrontRoutesList.Dashboard}>
                                                <a>
                                                    <Avatar className="icon" shape="circle">
                                                        <FrontImage
                                                            src={`${user?.id}/${user?.profilePicture}`}
                                                            identityId="users"
                                                        />
                                                    </Avatar>
                                                    My account
                                                </a>
                                            </Link>
                                            <a
                                                onClick={toggleMenu}
                                                className="dropdown-toggle"
                                                role="button"
                                                aria-expanded={menuIsOpen}
                                            >
                                                <span className="fas fa-chevron-down"></span>
                                            </a>
                                            <Menu
                                                model={menuModel}
                                                appendTo="self"
                                                popup
                                                ref={menu}
                                                id="profile_menu"
                                                className={`menu-sticky user-menu ${menuClass}`}
                                            />
                                        </li>
                                        <li className="log-wrap">
                                            <a className="btn btn-border" onClick={signOut}>
                                                Log out
                                            </a>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        {userStore.isColdStart ? (
                                            <>
                                                <li className="signup-wrap">
                                                    <FrontSkeleton width="140px" height="40px" />
                                                </li>
                                                <li className="log-wrap">
                                                    <FrontSkeleton width="100px" height="40px" />
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="signup-wrap">
                                                    <Link href={RoutesListFront.SignUp}>
                                                        <a className="btn btn-border" onClick={closeNavbar}>
                                                            Sign up
                                                        </a>
                                                    </Link>
                                                </li>
                                                <li className="log-wrap">
                                                    <Link href={RoutesListFront.SignIn}>
                                                        <a className="btn btn-default" onClick={handlerLogin}>
                                                            Log in
                                                        </a>
                                                    </Link>
                                                </li>
                                            </>
                                        )}
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
});

export default Header;
