import React, { FunctionComponent, useEffect, useState } from 'react';

import cs from 'classnames';
import { InputSwitch } from 'primereact/inputswitch';

interface Props {
    setValue?: (value: any) => void;
    value: boolean;
    name?: string;
    classWrapper?: string;
    readonly?: boolean;
}

const FrontSwitch: FunctionComponent<Props> = ({ setValue, value, name, classWrapper = '', readonly = false }) => {
    return (
        <div
            className={cs(`wrapper-input-switch ${classWrapper}`, {
                checked: value,
            })}
        >
            <InputSwitch onChange={setValue} checked={value} name={name} disabled={readonly} />
            <span className={'input-switch__title'}>{value ? 'On' : 'Off'}</span>
        </div>
    );
};

export default FrontSwitch;
