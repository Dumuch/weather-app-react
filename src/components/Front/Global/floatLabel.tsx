import classnames from 'classnames';
import { FunctionComponent, PropsWithChildren } from 'react';

interface Props {
    spanClassName?: string;
    labelClassName?: string;
    errored?: boolean;
    required?: boolean;
    label: string;
    id: string;
}

export const FrontFloatLabel: FunctionComponent<PropsWithChildren<Props>> = ({
    spanClassName = '',
    labelClassName = '',
    errored = false,
    required = false,
    label,
    id,
    children,
}) => {
    return (
        <span className={classnames('p-float-label', spanClassName)}>
            {children}
            <label htmlFor={id} className={classnames({ 'p-error': errored }, { required }, labelClassName)}>
                {label}
            </label>
        </span>
    );
};
