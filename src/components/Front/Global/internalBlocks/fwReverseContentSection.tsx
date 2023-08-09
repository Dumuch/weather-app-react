import classnames from 'classnames';
import { FC, ReactNode } from 'react';

interface Props {
    imageSrcSet?: string;
    imageWidth?: string;
    imageHeight?: string;
    fallbackImageSrc?: string;
    imageName?: string;
    title?: string;
    reversed?: boolean;
    customImageBlock?: ReactNode;
    sectionClassName?: string;
    children: ReactNode;
}

export const FrontFwReverseContentSection: FC<Props> = ({
    imageSrcSet = '',
    imageWidth = 'auto',
    imageHeight = 'auto',
    fallbackImageSrc = '',
    imageName = '',
    title = '',
    reversed = false,
    customImageBlock,
    sectionClassName,
    children,
}) => {
    return (
        <section className={classnames('content-section', sectionClassName)}>
            <div className="container">
                {title ? <h2 className="mb-big text-center">{title}</h2> : null}
                <div className={classnames('row v-align-center', { 'order-reverse': reversed })}>
                    <div className="col-sm-6 mb-big-xs">
                        <div className="textbox">
                            {customImageBlock ? (
                                customImageBlock
                            ) : (
                                <div className="text-image-wrap">
                                    {imageSrcSet && fallbackImageSrc ? (
                                        <picture>
                                            <source srcSet={imageSrcSet} />
                                            <img
                                                src={fallbackImageSrc}
                                                alt={imageName}
                                                width={imageWidth}
                                                height={imageHeight}
                                            />
                                        </picture>
                                    ) : (
                                        <img
                                            src={fallbackImageSrc}
                                            alt={imageName}
                                            width={imageWidth}
                                            height={imageHeight}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={classnames('col-sm-6', { 'indent-right': reversed, 'indent-left': !reversed })}>
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
};
