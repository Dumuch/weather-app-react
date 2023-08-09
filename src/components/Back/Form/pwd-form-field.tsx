import React, { FunctionComponent, useState } from 'react';
import { ErrorMessage, Field } from 'formik';
import { FormFieldProps } from './types';
import { useFormField } from './hooks/useFormField';
import { useFocusEffect } from './hooks/useFocusEffect';
import cs from 'classnames';

export const PwdFormField: FunctionComponent<FormFieldProps> = (props) => {
    const { id, hasError, error } = useFormField(props.formName, props.field);
    const [openPassword, setOpenPassword] = useState(false);
    const fieldRef = useFocusEffect(props.isFirst);

    const [inputType, setInputType] = useState('password');

    const isPasswordHidden = inputType === 'password';
    const handleShowPasswordClick = () => {
        setOpenPassword(!openPassword);
        setInputType(isPasswordHidden ? 'text' : 'password');
    };

    return (
        <div className={`form-group ${props.className}`}>
            <div className="wrapper__form-group">
                <span className="field-icon pi pi-key fa-fw" />
                <Field
                    className={`form-control ${hasError ? 'is-invalid' : ''}`}
                    id={id}
                    name={props.field}
                    type={inputType}
                    placeholder={props.placeholder}
                    innerRef={fieldRef}
                    readOnly={props.readOnly}
                >
                    {props.children}
                </Field>
                <span
                    className={cs('pi field-icon toggle-password size', {
                        'pi-eye': openPassword,
                        'pi-eye-slash': !openPassword,
                    })}
                    title="Show password"
                    onClick={handleShowPasswordClick}
                />
            </div>
            <ErrorMessage name="pwd" />
        </div>
    );
};
