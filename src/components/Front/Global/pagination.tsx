import { FunctionComponent, useEffect, useState } from 'react';
import { Paginator, PaginatorPageState, PaginatorTemplateOptions } from 'primereact/paginator';
import classNames from 'classnames';
import { FrontRoutesList } from '../Pages/FrontRoutesList';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';

interface Props {
    totalRecords: number;
    setCurrentPage: (page: number) => void;
    currentPage: number;
    customPaginatorTemplate?: PaginatorTemplateOptions;
    rowsPerPage: number;
    useCustomChangePage?: boolean;
    pathname?: FrontRoutesList;
}
const FrontPagination: FunctionComponent<Props> = ({
    totalRecords,
    setCurrentPage,
    currentPage,
    customPaginatorTemplate,
    rowsPerPage,
    useCustomChangePage = false,
    pathname = FrontRoutesList.Default,
}) => {
    const [customFirst, setCustomFirst] = useState((currentPage - 1) * rowsPerPage);
    const router = useRouter();

    useEffect(() => {
        setCustomFirst(rowsPerPage * (currentPage - 1));
    }, [currentPage]);

    const onCustomPageChange = (event: PaginatorPageState) => {
        if (useCustomChangePage) {
            setCustomFirst(event.first);
            setCurrentPage(event.page + 1);
        }
        return;
    };

    const handlerChangePage = (options: any, page: number) => {
        return () => {
            const first = currentPage && rowsPerPage ? rowsPerPage * (page - 1) : 0;
            setCurrentPage(page);
            setCustomFirst(first);
        };
    };
    const template: PaginatorTemplateOptions = {
        layout: 'PrevPageLink PageLinks NextPageLink',
        PrevPageLink: (options) => {
            return (
                <div className={classNames({ disabled: options.disabled })}>
                    {options.disabled ? (
                        <a className={classNames({ disabled: options.disabled })}>
                            <span className="fas fa-chevron-left"></span>
                        </a>
                    ) : (
                        <Link
                            href={{
                                pathname,
                                query: { ...router.query, page: currentPage - 1 },
                            }}
                            scroll={false}
                            shallow={true}
                            locale={false}
                        >
                            <a onClick={handlerChangePage(options, currentPage - 1)}>
                                <span className="fas fa-chevron-left"></span>
                            </a>
                        </Link>
                    )}
                </div>
            );
        },
        NextPageLink: (options) => {
            return (
                <div className={classNames({ disabled: options.disabled })}>
                    {options.disabled ? (
                        <a className={classNames({ disabled: options.disabled })}>
                            <span className="fas fa-chevron-right"></span>
                        </a>
                    ) : (
                        <Link
                            href={{
                                pathname,
                                query: { ...router.query, page: currentPage + 1 },
                            }}
                            scroll={false}
                            shallow={true}
                            locale={false}
                        >
                            <a
                                onClick={handlerChangePage(options, currentPage + 1)}
                                className={classNames({ disabled: options.disabled })}
                            >
                                <span className="fas fa-chevron-right"></span>
                            </a>
                        </Link>
                    )}
                </div>
            );
        },
        PageLinks: (options) => {
            const pre = options.view.startPage === options.page && options.view.startPage !== 0;
            const after = options.view.endPage === options.page && options.page + 1 !== options.totalPages;
            if (pre || after) {
                const className = classNames(options.className, { 'p-disabled': true });

                return (
                    <>
                        {pre && (
                            <div className={options.className} onClick={handlerChangePage(options, options.page + 1)}>
                                <Link
                                    href={{
                                        pathname,
                                        query: { ...router.query, page: options.page + 1 },
                                    }}
                                    scroll={false}
                                    shallow={true}
                                    locale={false}
                                >
                                    <a>{options.page + 1}</a>
                                </Link>
                            </div>
                        )}
                        <span className={className} style={{ userSelect: 'none' }}>
                            ...
                        </span>

                        {after && (
                            <div className={options.className} onClick={handlerChangePage(options, options.totalPages)}>
                                <Link
                                    href={{
                                        pathname,
                                        query: { ...router.query, page: options.totalPages },
                                    }}
                                    scroll={false}
                                    shallow={true}
                                    locale={false}
                                >
                                    <a>{options.totalPages}</a>
                                </Link>
                            </div>
                        )}
                    </>
                );
            }
            return (
                <div
                    className={classNames(options.className, {
                        active: options.className.indexOf('p-highlight') >= 0,
                    })}
                    onClick={handlerChangePage(options, options.page + 1)}
                >
                    <Link
                        href={{
                            pathname,
                            query: { ...router.query, page: options.page + 1 },
                        }}
                        shallow={true}
                        scroll={false}
                        locale={false}
                    >
                        <a>{options.page + 1}</a>
                    </Link>
                </div>
            );
        },
        CurrentPageReport: (options) => {
            return <></>;
        },
        RowsPerPageDropdown: (options) => {
            return <></>;
        },
        JumpToPageInput: (options) => {
            return <></>;
        },
        FirstPageLink: (options) => {
            return <></>;
        },
        LastPageLink: (options) => {
            return <></>;
        },
    };

    return (
        <>
            <nav className="pagination-wrap mb-big">
                <Paginator
                    template={customPaginatorTemplate || template}
                    first={customFirst}
                    rows={rowsPerPage}
                    totalRecords={totalRecords}
                    className={'pagination'}
                    onPageChange={onCustomPageChange}
                ></Paginator>
            </nav>
        </>
    );
};
export default FrontPagination;
