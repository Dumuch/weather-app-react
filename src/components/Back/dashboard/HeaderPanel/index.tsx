import React, { FunctionComponent } from 'react';

interface Props {
    children: React.ReactNode;
    className?: string;
}

export const DashboardHeaderPanel: FunctionComponent<Props> = ({ children, className }) => {
    return <div className={`top-row ${className}`}>{children}</div>;
};
