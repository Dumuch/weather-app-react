import classnames from 'classnames';
import Link from 'next/link';
import { FC } from 'react';

interface Props {
    className?: string;
    title: string;
    linkHref?: string;
    linkText: string;
}

export const FrontBottomCTA: FC<Props> = ({ className = '', title, linkHref = '/', linkText }) => {
    return (
        <section
            className={classnames(
                'content-section cta-bottom-section large-padding-top large-padding-bottom bg-image-cover color-white text-center',
                className
            )}
        >
            <div className="container">
                <div className="row">
                    <div className="col-md-10 col-md-offset-1">
                        <h2 className="text-shadow">{title}</h2>
                        <Link href={linkHref}>
                            <a className="btn btn-primary">{linkText}</a>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
