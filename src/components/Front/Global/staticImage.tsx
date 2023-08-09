import React, { FunctionComponent, useState, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import { ImageProps } from 'next/image';
import classnames from 'classnames';
import FrontSkeleton from './skeleton';
import { Image as StaticImage } from './react-image';
import { useStores } from '../../../store';

interface Props extends ImageProps {
    src: StaticImageData | string;
    wrapperClassName?: string;
    classNameImage?: string;
    isStaticImport?: boolean;
    alt?: string;
    width?: number;
    height?: number;
    identityId?: string;
    noImage?: boolean;
    onLoadImage?: (photo: string) => void;
}

export const FrontStaticImage: FunctionComponent<Props> = ({
    src,
    wrapperClassName,
    classNameImage = '',
    isStaticImport = true,
    alt = '',
    width = 24,
    height = 24,
    identityId,
    layout = 'fixed',
    noImage = false,
    priority = false,
    onLoadImage,
}) => {
    const [url, setUrl] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(isStaticImport);
    const { globalStore } = useStores();

    useEffect(() => {
        if (isStaticImport && typeof src !== 'string') {
            setUrl(src.src);
        }

        if (src && !isStaticImport && typeof src !== 'object') {
            (async () => {
                const photo = await globalStore.getFileFromS3(src, identityId || '');
                setUrl(photo);
                onLoadImage && onLoadImage(photo);
            })();
        }
    }, [src]);

    return (
        <div className={classnames(wrapperClassName ?? '', 'wrapper-static-image')}>
            {!noImage ? (
                <>
                    <FrontSkeleton
                        width={`${width}px`}
                        height={`${height}px`}
                        className={`image-skeleton ${isLoaded ? 'not-opaque' : 'opaque'}`}
                    />
                    {url && (
                        <StaticImage
                            src={url}
                            alt={alt}
                            onLoadCapture={() => {
                                setIsLoaded(true);
                            }}
                            width={`${width}px`}
                            height={`${height}px`}
                            className={`${classNameImage} lazy-image ${isLoaded ? 'opaque' : 'not-opaque'}`}
                        />
                    )}
                </>
            ) : (
                <Image
                    priority
                    src={'/assets/img/no-photo.png'}
                    alt={alt}
                    layout={'responsive'}
                    className={classNameImage}
                    width={width}
                    height={height}
                />
            )}
        </div>
    );
};
