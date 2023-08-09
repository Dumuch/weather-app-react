import { FC, useState, useEffect, useMemo, MouseEvent } from 'react';
import { observer } from 'mobx-react-lite';
//@ts-ignore
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox.css';
import { PropertyPhoto } from '../../../../../models/api/property';
import { FrontImage } from '../../../Global/image';
import { useStores } from '../../../../../store';

interface Props {
    propertyId: string;
    photos: PropertyPhoto[] | null | undefined;
}

const VISIBLE_PHOTOS_COUNT = 4;

const PropertyPhotos: FC<Props> = observer(({ propertyId, photos }) => {
    const { globalStore } = useStores();
    const [fancyboxSource, setFancyboxSource] = useState<{ src: string; type: string; preload: boolean }[]>([]);
    const showAll = (index: number) => (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        Fancybox.show(fancyboxSource, { startIndex: index });
    };

    const mainPhoto = photos?.find((photo) => photo.mainPhoto === true);
    const sortedPhotos = useMemo(() => photos?.sort((a, b) => (a.order < b.order ? -1 : 1)) || [], []);
    const primaryImageSrc = mainPhoto
        ? `${propertyId}/thumbnails/thumbnail-700_${mainPhoto.name}`
        : sortedPhotos[0]?.name
        ? `${propertyId}/thumbnails/thumbnail-700_${sortedPhotos[0]?.name}`
        : '';

    useEffect(() => {
        (async () => {
            const source = sortedPhotos.map(async (photo) => ({
                src: await globalStore.getFileFromS3(`${propertyId}/${photo.name}`, 'properties'),
                type: 'image',
                preload: false,
            }));
            Promise.all(source).then((res) => setFancyboxSource(res));
        })();
    }, [sortedPhotos]);

    return (
        <div className="property-details-gallery mb-big color-white">
            <div className="primary-image">
                <FrontImage src={primaryImageSrc} identityId={'properties'} />
                <a
                    className="area-link"
                    href={fancyboxSource[0]?.src}
                    onClick={showAll(0)}
                    title="Property primary image"
                />
            </div>
            {sortedPhotos[1]?.name && (
                <div className="secondary-wrap">
                    <div className="secondary-image">
                        <FrontImage
                            src={
                                sortedPhotos[1]?.name
                                    ? `${propertyId}/thumbnails/thumbnail-500_${sortedPhotos[1]?.name}`
                                    : ''
                            }
                            identityId={'properties'}
                        />
                        <a
                            href={fancyboxSource[1]?.src}
                            onClick={showAll(1)}
                            className="area-link"
                            title="Property secondary image"
                        />
                    </div>
                    {sortedPhotos[2]?.name && (
                        <div className="tertiary-wrap">
                            <div className="tertiary-image">
                                <FrontImage
                                    src={
                                        sortedPhotos[2]?.name
                                            ? `${propertyId}/thumbnails/thumbnail-300_${sortedPhotos[2]?.name}`
                                            : ''
                                    }
                                    identityId={'properties'}
                                />
                                <a
                                    href={fancyboxSource[2]?.src}
                                    onClick={showAll(2)}
                                    className="area-link"
                                    title="Property tertiary image"
                                />
                            </div>
                            {sortedPhotos[3]?.name && (
                                <div className="tertiary-image">
                                    <FrontImage
                                        src={
                                            sortedPhotos[3]?.name
                                                ? `${propertyId}/thumbnails/thumbnail-300_${sortedPhotos[3]?.name}`
                                                : ''
                                        }
                                        identityId={'properties'}
                                    />
                                    <a
                                        onClick={showAll(3)}
                                        className={`area-link ${sortedPhotos[4]?.name && 'more-photos-link'}`}
                                        title="Property tertiary image"
                                    >
                                        {sortedPhotos[4]?.name
                                            ? `+${sortedPhotos.length - VISIBLE_PHOTOS_COUNT} more photo${
                                                  sortedPhotos.length - VISIBLE_PHOTOS_COUNT === 1 ? '' : 's'
                                              }`
                                            : null}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default PropertyPhotos;
