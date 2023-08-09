import React, { FunctionComponent } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';

interface Props {
    title?: string;
    className?: string;
    readOnly?: boolean;
    value?: string;
    setValue: (value: string) => void;
    placeholder?: string;
}

export const DashBoardTextarea: FunctionComponent<Props> = ({
    title,
    className,
    readOnly = false,
    value,
    setValue,
    placeholder,
}) => {
    return (
        <InputTextarea
            className={`form-control ${className}`}
            style={{ resize: 'vertical' }}
            readOnly={readOnly}
            id="in"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
        />
    );
};
