import React, { FunctionComponent } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';

interface Props {
    title?: string;
    className?: string;
    readOnly?: boolean;
    value?: string | number;
    /* TODO: type */
    setValue: (value: any) => void;
    placeholder?: string;
    type?: string;
    id?: string;
    name?: string;
    required?: boolean;
}

export const DashBoardInput: FunctionComponent<Props> = ({
    type = 'text',
    id = 'in',
    title,
    className,
    readOnly = false,
    value,
    setValue,
    placeholder,
    name,
    required = false,
}) => {
    const isPassword = type === 'password';

    return (
        <>
            {isPassword ? (
                <Password
                    className={'w-full'}
                    inputClassName={`form-control ${className}`}
                    readOnly={readOnly}
                    id={id}
                    value={value}
                    onChange={setValue}
                    placeholder={placeholder}
                    name={name}
                    toggleMask
                    feedback={false}
                    required={required}
                />
            ) : (
                <InputText
                    className={`form-control ${className}`}
                    type={type}
                    readOnly={readOnly}
                    id={id}
                    value={value}
                    onChange={setValue}
                    placeholder={placeholder}
                    name={name}
                    required={required}
                />
            )}
        </>
    );
};
