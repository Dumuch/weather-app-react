import React, { FunctionComponent } from 'react';

interface Props {
    children?: React.ReactNode;
    title?: string;
    className?: string;
}

export enum HeaderColors {
    linkWater = 'link-water',
}

interface Props {
    children?: React.ReactNode;
    title?: string;
    className?: string;
    headerColor?: HeaderColors;
}

export const DashBoardPanel: FunctionComponent<Props> = ({
    children,
    title = '',
    headerColor = '',
    className = '',
}) => {
    const headerStyle = {
        background: `var(--${headerColor})`,
    };
    return (
        <div className={`dashboard__panel panel h-auto ${className}`}>
            {title && (
                <div style={headerStyle} className="panel-header">
                    <h3 className="panel-name">{title}</h3>
                </div>
            )}
            <div className="panel-body">{children}</div>
        </div>
    );
};
