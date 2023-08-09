import React, { FunctionComponent } from 'react';

interface Props {
    mainLabel: string;
    required?: boolean;
    onChange: (e: React.FormEvent<HTMLInputElement>) => void;
    value1: string;
    value2: string;
    checked1: boolean;
    checked2: boolean;
    label1: string;
    label2: string;
    name: string;
    readOnly?: boolean;
}
const FrontSwitchWithLabel: FunctionComponent<Props> = ({
    mainLabel,
    required = false,
    onChange,
    value1,
    value2,
    checked1,
    checked2,
    label1,
    label2,
    name,
    readOnly = false,
}) => {
    return (
        <div className="form-group inline-label">
            <label className={`${required && 'required'}`}>{mainLabel}</label>
            <fieldset>
                <span className="button-switch">
                    <label>
                        <input
                            onChange={onChange}
                            type="radio"
                            value={value1}
                            name={name}
                            checked={checked1}
                            disabled={readOnly}
                        />
                        <span className="title">{label1}</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            onChange={onChange}
                            value={value2}
                            name={name}
                            checked={checked2}
                            disabled={readOnly}
                        />
                        <span className="title">{label2}</span>
                    </label>
                </span>
            </fieldset>
        </div>
    );
};

export default FrontSwitchWithLabel;
