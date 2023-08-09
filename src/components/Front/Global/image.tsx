import React, { FunctionComponent, useEffect, useState } from 'react';
import { Image as StaticImage } from './react-image';
import FrontSkeleton from './skeleton';
import { useStores } from '../../../store';

interface Props {
    src: string | null;
    classNameImage?: string;
    alt?: string;
    width?: string;
    height?: string;
    identityId?: string;
}

const IMAGE_RETRY_TIME_MS = 5000;

export const FrontImage: FunctionComponent<Props> = ({
    src,
    classNameImage = '',
    alt = '',
    width = 'auto',
    height = 'auto',
    identityId,
}) => {
    const [url, setUrl] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(false);
    const { globalStore } = useStores();

    useEffect(() => {
        if (src && src.length !== 0) {
            (async () => {
                setUrl(await globalStore.getFileFromS3(src, identityId || ''));
            })();
        }
    }, [src]);
    return (
        <>
            {src ? (
                <div className={'wrapper-dynamic-image'}>
                    <FrontSkeleton
                        width={'100%'}
                        height={'100%'}
                        className={`image-skeleton ${isLoaded ? 'not-opaque' : 'opaque'}`}
                    />
                    {url && (
                        <StaticImage
                            src={url}
                            alt={alt}
                            onLoadCapture={() => {
                                setIsLoaded(true);
                            }}
                            onError={() => {
                                setTimeout(() => {
                                    (async () => {
                                        setUrl(await globalStore.getFileFromS3(src, identityId || ''));
                                    })();
                                }, IMAGE_RETRY_TIME_MS);
                            }}
                            width={`${width}px`}
                            height={`${height}px`}
                            className={`${classNameImage} lazy-image ${isLoaded ? 'opaque' : 'not-opaque'}`}
                        />
                    )}
                </div>
            ) : (
                <StaticImage
                    alt={alt}
                    src={'/assets/img/no-photo.png'}
                    className={`${classNameImage}`}
                    width={width}
                    height={height}
                />
            )}
        </>
    );
};
