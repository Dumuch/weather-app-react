import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';
import cs from 'classnames';
import React, { FC, useEffect, useRef } from 'react';
import { BackRoutesList } from '../Pages/BackRoutesList';
import Link from 'next/link';
import { useRouter } from 'next/router';

const menuItems = [
    {
        headerText: 'Dashboard',
        headerIcon: 'pi pi-desktop',
        content: null,
        link: BackRoutesList.Dashboard,
    },
    {
        headerText: 'Site Users',
        headerIcon: 'pi pi-users',
        content: null,
        link: BackRoutesList.UserList,
    },
    // BA_BBS-10
    /* {
        headerText: 'Dictionaries',
        headerIcon: 'pi pi-book',
        content: null,
        link: BackRoutesList.Dictionaries,
    }, */
    {
        headerText: 'Properties',
        headerIcon: 'pi pi-building',
        content: null,
        link: BackRoutesList.Properties,
    },
    {
        headerText: 'Data Dump',
        headerIcon: 'pi pi-database',
        content: null,
        link: BackRoutesList.DataDump,
    },
    {
        headerText: 'Payments',
        headerIcon: 'pi pi-dollar',
        content: null,
        link: BackRoutesList.Payments,
    },
    {
        headerText: 'Help Center',
        headerIcon: 'pi pi-question-circle',
        content: [
            {
                text: 'Help Topics',
                link: BackRoutesList.HelpTopics,
            },
            {
                text: 'FAQs',
                link: BackRoutesList.HelpFAQs,
            },
            /* {
                text: 'Form Submissions',
                link: '/11',
            }, */
        ],
    },
    // {
    //     headerText: 'Notifications',
    //     headerIcon: 'pi pi-bell',
    //     content: null,
    //     link: '/6',
    // },
    {
        headerText: 'Settings',
        headerIcon: 'pi pi-cog',
        content: null,
        link: BackRoutesList.Settings,
    },
];

interface TemplateProps extends PanelHeaderTemplateOptions {
    headerText: string;
    headerIcon: string;
    link?: string;
    activeLink: boolean;
}

const headerTemplate: FC<TemplateProps> = ({
    onTogglerClick,
    collapsed,
    headerText,
    headerIcon,
    link,
    activeLink,
    props,
}): JSX.Element => {
    const content = (
        <a className={cs({ active: activeLink, 'menu-item': true })}>
            <div className="open-border" style={{ width: collapsed || !props.toggleable ? '0' : '5px' }} />
            <span className={`${headerIcon}`} />
            <span className="text">{headerText}</span>
            <div
                className={cs({
                    hidden: !props.toggleable,
                    'toggle-icon': true,
                    'pi pi-chevron-down': collapsed,
                    'pi pi-chevron-up': !collapsed,
                })}
            />
        </a>
    );
    return <>{link ? <Link href={link}>{content}</Link> : <div onClick={onTogglerClick}>{content}</div>}</>;
};

export const SidePanel = () => {
    const router = useRouter();

    const isLinkActive = (link: string): boolean => {
        const isActive =
            router.pathname === link ||
            (link && router.pathname.indexOf(link) >= 0 && router.query.id && BackRoutesList.Dashboard !== link);
        return isActive ? true : false;
    };

    useEffect(() => {
        const helpCenterPanel = document.querySelectorAll('.p-panel.p-component.p-panel-toggleable');
        const isOpened = helpCenterPanel.item(0).querySelectorAll('.menu-item .pi.pi-chevron-up').length > 0;

        if (isOpened && !router.route.includes('/help-center/')) {
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: false,
            });

            helpCenterPanel.item(0).querySelectorAll('.menu-item .pi.pi-chevron-up').item(0).dispatchEvent(clickEvent);
        }
    }, [router.route]);

    return (
        <>
            {menuItems.map(({ headerText, headerIcon, content, link }) => {
                let activeLink = false;
                if (link && isLinkActive(link)) {
                    activeLink = true;
                }
                return (
                    <Panel
                        headerTemplate={(props) =>
                            headerTemplate({ ...props, headerText, headerIcon, link, activeLink })
                        }
                        toggleable={!!content}
                        collapsed
                        key={headerText}
                    >
                        <div className="content" style={{ display: content ? 'block' : 'none' }}>
                            {content?.map((content: any) => {
                                let activeLink = false;
                                if (content.link && isLinkActive(content.link)) {
                                    activeLink = true;
                                }
                                return (
                                    <Link href={content.link} key={content.text}>
                                        <a className={cs({ active: activeLink, 'content-item': true })}>
                                            {content.text}
                                        </a>
                                    </Link>
                                );
                            })}
                        </div>
                    </Panel>
                );
            })}
        </>
    );
};
