import React, { FunctionComponent, useEffect, useState } from 'react';
import { Image } from 'primereact/image';
import { Storage } from '@aws-amplify/storage';
import { S3AccessLevel } from '../../../utils/constants';

interface Props {
    src: string | null | undefined;
    classNameImage?: string;
    classNameWrapper?: string;
    alt?: string;
    width?: string;
    height?: string;
    identityId?: string;
}

export const DashBoardImage: FunctionComponent<Props> = ({
    src,
    classNameWrapper,
    classNameImage,
    alt,
    width = '100',
    height = '100',
    identityId,
}) => {
    const [url, setUrl] = useState<string>('/assets/img/no-photo.png');
    const divStyle = { width: width + 'px', height: height + 'px' };

    useEffect(() => {
        if (src && src.length !== 0) {
            (async () => {
                const config = { level: S3AccessLevel.protected, identityId };
                setUrl((await Storage.get(src, config)) as string);
            })();
        }
    }, [src]);

    return (
        <div className={`wrapper__dashboard-image ${classNameWrapper}`} style={divStyle}>
            <Image alt={alt} src={url} className={`${classNameImage}`} />
        </div>
    );
};
