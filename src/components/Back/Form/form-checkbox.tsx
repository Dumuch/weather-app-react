import React, { FunctionComponent } from 'react';
import { ErrorMessage, Field } from 'formik';
import { FormCheckboxProps } from './types';
import { useFormField } from './hooks/useFormField';

export const FormCheckbox: FunctionComponent<FormCheckboxProps> = (props) => {
    const { id, hasError, error } = useFormField(props.formName, props.field);
    return (
        <div className={`checkbox ${props.className}`}>
            <div className="wrapper__form-group">
                <label>
                    <Field
                        className={`form-control ${hasError ? 'is-invalid' : ''}`}
                        id={id}
                        name={props.field}
                        type={'checkbox'}
                        readOnly={props.readOnly}
                    />
                    <span className="radio-check-control" />
                    <span className="radio-check-label">{props.label}</span>
                </label>
            </div>
            <ErrorMessage name={props.field} />
        </div>
    );
};
