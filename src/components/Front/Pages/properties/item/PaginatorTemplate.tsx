import classNames from 'classnames';
import { PaginatorTemplateOptions } from 'primereact/paginator';

const paginatorTemplate: PaginatorTemplateOptions = {
    layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
    PrevPageLink: (options) => {
        return (
            <div className={classNames({ disabled: options.disabled }, 'cursor-pointer')} onClick={options.onClick}>
                <span className="fas fa-chevron-left"></span>
            </div>
        );
    },
    NextPageLink: (options) => {
        return (
            <div className={classNames({ disabled: options.disabled }, 'cursor-pointer')} onClick={options.onClick}>
                <span className="fas fa-chevron-right"></span>
            </div>
        );
    },
    PageLinks: (options) => {
        if (
            (options.view.startPage === options.page && options.view.startPage !== 0) ||
            (options.view.endPage === options.page && options.page + 1 !== options.totalPages)
        ) {
            const className = classNames(options.className, { 'p-disabled': true });
            return (
                <span className={className} style={{ userSelect: 'none' }}>
                    ...
                </span>
            );
        }
        return (
            <div className={options.className} onClick={options.onClick}>
                {options.page + 1}
            </div>
        );
    },
    RowsPerPageDropdown: (options) => {
        return <></>;
    },
    CurrentPageReport: (options) => {
        return <></>;
    },
    FirstPageLink: (options) => {
        return <></>;
    },
    LastPageLink: (options) => {
        return <></>;
    },
    JumpToPageInput: (options) => {
        return <></>;
    },
};

export default paginatorTemplate;
