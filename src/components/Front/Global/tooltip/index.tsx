import React, { FunctionComponent } from 'react';
import { Tooltip, TooltipProps } from './';

const FrontTooltip: FunctionComponent<TooltipProps> = (props) => {
    return <Tooltip {...props} />;
};

export default FrontTooltip;
