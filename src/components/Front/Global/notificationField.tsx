import React, { FunctionComponent, ReactNode } from 'react';
import cs from 'classnames';

export enum AlertType {
    success = 'success',
    danger = 'danger',
    warning = 'warning',
}
interface Props {
    message: string | null;
    alertType?: AlertType;
    closeButton?: boolean;
    handlerCloseButton?: () => void;
    isMarginBottom?: boolean;
    iconSrc?: string;
    iconClassName?: string;
    isHTML?: boolean;
    customBody?: () => ReactNode;
}

export const FrontNotificationField: FunctionComponent<Props> = ({
    message,
    alertType = 'success',
    closeButton = false,
    handlerCloseButton,
    isMarginBottom = true,
    iconSrc = '',
    iconClassName = '',
    isHTML = false,
    customBody,
}) => {
    return message || customBody ? (
        <div
            className={cs(`alert alert-${alertType}`, {
                mb: isMarginBottom,
                'alert_close-button': closeButton,
                alert_icon: iconSrc,
                'd-flex': closeButton || iconSrc,
            })}
            role="alert"
            style={{ whiteSpace: isHTML ? 'initial' : 'pre-line' }}
        >
            {iconSrc && (
                <img src={iconSrc} width={18} height={18} className={`alert__icon ${iconClassName}`} alt={''} />
            )}

            {customBody ? (
                <>{customBody()}</>
            ) : (
                <>{isHTML && message ? <p dangerouslySetInnerHTML={{ __html: message }} /> : <>{message}</>}</>
            )}

            {closeButton && (
                <button className={'alert__close-button'} onClick={handlerCloseButton}>
                    <span className="alert__close-icon pi pi-times"></span>
                </button>
            )}
        </div>
    ) : (
        <></>
    );
};
