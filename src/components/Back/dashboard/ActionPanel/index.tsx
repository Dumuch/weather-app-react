import React, { FormEvent, FunctionComponent, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { timeOutChange } from '../../../../utils/helpers';
import { DashBoardInput } from '../input';

interface Props {
    sortName: string;
    count: number;
    lazyParams: any;
    reset: () => void;
    onPage: (page: string | number) => void;
}

export const DashboardActionPanel: FunctionComponent<Props> = ({ sortName, count, reset, lazyParams, onPage }) => {
    const totalPage = Math.ceil(count / lazyParams.rows);
    const [pageValue, setPageValue] = useState<string | number>(1);

    useEffect(() => {
        setPageValue(lazyParams.page);
    }, [lazyParams.page]);

    const onChangeInput = (event: FormEvent<HTMLInputElement>) => {
        onInput(event.currentTarget.value);
    };

    const onInput = (page: string | number) => {
        setPageValue(page);
        timeOutChange(onPage, page);
    };

    const onPrevPage = () => {
        const newPage = lazyParams.page - 1;
        if (newPage > 0) {
            onPage(newPage);
        }
    };

    const onNextPage = () => {
        const newPage = lazyParams.page + 1;
        if (newPage <= totalPage) {
            onPage(newPage);
        }
    };

    return (
        <div className="controls-group-wrap">
            <div className="controls-group-left"></div>
            <div className="table-records-group color-blue-grey">
                {sortName !== 'none' && (
                    <div>
                        Current Sorting: {sortName} (
                        <Button className="p-0 p-button-text" onClick={reset}>
                            Reset
                        </Button>
                        )
                    </div>
                )}
                <div>{count} record(s) found</div>
                {totalPage > 1 && (
                    <div className="table-paging-control">
                        <Button className="btn-paging p-button-text" type="button" onClick={onPrevPage}>
                            <span className="pi pi-arrow-left"></span>
                        </Button>
                        <DashBoardInput setValue={onChangeInput} type={'number'} value={pageValue} />
                        <span className="total">
                            of{' '}
                            <Button onClick={() => onInput(totalPage)} className={'p-0 p-button-text'}>
                                {totalPage}
                            </Button>
                        </span>
                        <Button className="btn-paging p-button-text" type="button" onClick={onNextPage}>
                            <span className="pi pi-arrow-right"></span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
