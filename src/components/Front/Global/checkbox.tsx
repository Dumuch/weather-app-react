import React, { FunctionComponent } from 'react';
import { Checkbox, CheckboxProps } from 'primereact/checkbox';
import classnames from 'classnames';

interface Props extends CheckboxProps {
    label?: string;
    labelClassName?: string;
    wrapperClassName?: string;
    errored?: boolean;
}

export const FrontCheckbox: FunctionComponent<Props> = (props) => {
    return (
        <div className={classnames('checkbox', props.wrapperClassName ?? '')}>
            <Checkbox
                inputId={props.name}
                name={props.name}
                className={classnames({ 'p-invalid': props.errored }, props.className ?? '')}
                {...props}
            />
            <label className="inline-flex" htmlFor={props.name}>
                <span
                    className={classnames(
                        'radio-check-label',
                        { 'p-error': props.errored },
                        props.labelClassName ?? ''
                    )}
                >
                    {props.label ?? ''}
                </span>
            </label>
        </div>
    );
};
