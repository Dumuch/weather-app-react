import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import Link from 'next/link';

interface Props {
    title: string;
    description?: string;
    buttonName?: string;
    buttonLink?: string;
    centered?: boolean;
    className?: string;
    rowContainerClassName?: string;
}
export const FrontMastheadSection: FunctionComponent<Props> = ({
    title,
    description,
    buttonName,
    centered = false,
    className = '',
    buttonLink,
    rowContainerClassName = '',
}) => {
    return (
        <>
            <section
                className={classnames(
                    'masthead-internal-section content-section large-padding-top large-padding-bottom color-white bg-image-cover',
                    className
                )}
            >
                <div className="container">
                    <div className="row">
                        <div className={rowContainerClassName}>
                            <h1
                                className={classnames('text-shadow', {
                                    'text-center': centered,
                                })}
                            >
                                {title}
                            </h1>
                            {description && (
                                <h2
                                    className={classnames('h5-style text-shadow-light', {
                                        'text-center': centered,
                                    })}
                                >
                                    {description}
                                </h2>
                            )}
                            {buttonName && buttonLink && (
                                <div className="textbox">
                                    <Link href={buttonLink}>
                                        <a className="btn btn-primary">{buttonName}</a>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
