import React, { FunctionComponent } from 'react';
import { ErrorMessage, Field } from 'formik';
import { FormFieldProps } from './types';
import { useFormField } from './hooks/useFormField';
import { useFocusEffect } from './hooks/useFocusEffect';

export const FormField: FunctionComponent<FormFieldProps> = (props) => {
    const { id, hasError, error } = useFormField(props.formName, props.field);
    const fieldRef = useFocusEffect(props.isFirst);

    const isSelect = props.type === 'select';
    const type = !isSelect ? props.type : '';
    const as = isSelect ? 'select' : '';
    return (
        <div className={`${props.className}`}>
            <div className="wrapper__form-group">
                <span className={`field-icon pi fa-fw ${props.classIcon}`} />
                <Field
                    className={`form-control ${hasError ? 'is-invalid' : ''}`}
                    id={id}
                    value={props.value}
                    name={props.field}
                    type={type}
                    as={as}
                    placeholder={props.placeholder}
                    innerRef={fieldRef}
                    readOnly={props.readOnly}
                >
                    {props.children}
                </Field>
            </div>
            <div className="p-error">{hasError && <ErrorMessage name={props.field} />}</div>
        </div>
    );
};
