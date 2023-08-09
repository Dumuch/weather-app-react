import React, { FunctionComponent } from 'react';
import { FormSelectProps } from './types';

export const FormField: FunctionComponent<FormSelectProps> = (props) => {
    return (
        <div className={`form-group `}>
            <span className="field-icon pi pi-user fa-fw" />
        </div>
    );
};
