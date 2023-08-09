import React, { FunctionComponent } from 'react';
import { FormNotificationProps } from '../Form/types';

export const DashboardNotificationField: FunctionComponent<FormNotificationProps> = (props) => {
    return props.message ? (
        <div className={`notification-field ${props.className}`}>
            <div className="notification-field__message">{props.message}</div>
        </div>
    ) : (
        <></>
    );
};
