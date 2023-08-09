import React, { FunctionComponent } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { FrontFloatLabel } from './floatLabel';

interface Props {
    id: string;
    label: string;
    classNameDropdown?: string;
    classNameDropdownWrapper?: string;
    optionValue?: string;
    optionLabel?: string;
    value: string | number | null;
    options: any[];
    handlerDropdown: (e: any) => void;
    name: string;
    required?: boolean;
    style?: object;
    readOnly?: boolean;
    filter?: boolean;
    showClear?: boolean;
    filterBy?: string;
    resetFilterOnHide?: boolean;
    emptyFilterMessage?: string;
}

export const FrontDropdown: FunctionComponent<Props> = ({
    id,
    label,
    classNameDropdown = '',
    optionValue = '',
    optionLabel = '',
    value,
    options,
    handlerDropdown,
    name,
    classNameDropdownWrapper = '',
    required = false,
    style = {},
    readOnly = false,
    filter = false,
    filterBy = '',
    resetFilterOnHide = false,
    emptyFilterMessage = '',
}) => {
    return (
        <div className={`input-wrap has-content select-wrap ${classNameDropdownWrapper}`}>
            <FrontFloatLabel label={label} id={id} required={required}>
                <Dropdown
                    style={style}
                    className={`w-full ${classNameDropdown}`}
                    optionValue={optionValue}
                    optionLabel={optionLabel}
                    value={value}
                    options={options}
                    onChange={handlerDropdown}
                    name={name}
                    disabled={readOnly}
                    filter={filter}
                    filterBy={filterBy}
                    resetFilterOnHide={resetFilterOnHide}
                    emptyFilterMessage={emptyFilterMessage}
                />
            </FrontFloatLabel>
        </div>
    );
};
