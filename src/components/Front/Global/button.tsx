import { FunctionComponent } from 'react';
import { Button, ButtonProps } from 'primereact/button';

export const FrontButton: FunctionComponent<ButtonProps> = (props) => {
    const settings = { ...props, className: `btn ${props.className ?? ''}` };
    return <Button {...settings} />;
};
