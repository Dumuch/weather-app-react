import React, { FunctionComponent, useEffect, useRef } from 'react';
import { Dialog, DialogProps, DialogPositionType } from './dialog';

interface Props extends DialogProps {
    children: React.ReactNode;
    blockScrolling?: boolean;
}

export const FrontModal: FunctionComponent<Props> = (props) => {
    const settings = {
        ...props,
        resizable: props.resizable ?? false,
        draggable: props.draggable ?? false,
        position: 'top' as DialogPositionType,
    };

    useEffect(() => {
        const scrollTop = document.documentElement.scrollTop;
        const scrollLeft = document.documentElement.scrollLeft;
        if (props.blockScrolling && props.visible) {
            document.body.style.overflow = 'hidden';
        } else {
            window.scrollTo(scrollLeft, scrollTop);
            document.body.style.overflow = '';
        }
    }, [props.visible]);

    return <Dialog {...settings}>{props.children}</Dialog>;
};
