import classnames from 'classnames';
import { FC, ReactNode } from 'react';

interface Props {
    title?: string;
    introText?: string;
    introTextClassName?: string;
    sectionClassName?: string;
    children: ReactNode;
}

export const FrontFwSimpleContentSection: FC<Props> = ({
    title,
    introText = '',
    introTextClassName,
    sectionClassName,
    children,
}) => {
    return (
        <section className={classnames('content-section', sectionClassName)}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-10 col-lg-offset-1">
                        {title ? <h2 className={classnames('color-blue', { 'mb-big': !introText })}>{title}</h2> : null}
                        {introText ? (
                            <h3 className={classnames('h5-style color-black', introTextClassName)}>{introText}</h3>
                        ) : null}
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
};
