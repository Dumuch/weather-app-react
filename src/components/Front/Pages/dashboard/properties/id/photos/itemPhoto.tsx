import React, { FunctionComponent, useEffect, useState } from 'react';
import { Property, PropertyPhoto } from '../../../../../../../models/api/property';
import { FrontImage } from '../../../../../Global/image';
import PropertySectionDeletePhotoModal from '../modals/deletePhotoModal';
import { useStores } from '../../../../../../../store';

interface Props {
    property: Property;
    photo: PropertyPhoto;
    handlerDeletePhoto: (size: number) => void;
}
const PropertySectionPhotosFormItemPhoto: FunctionComponent<Props> = ({ property, photo, handlerDeletePhoto }) => {
    const [imageUrl, setImageUrl] = useState<string>();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const { globalStore } = useStores();

    const toggleIsOpenModal = () => setIsOpenModal((prevState) => !prevState);

    useEffect(() => {
        globalStore.getFileFromS3(`${property.id}/${photo.name}`, 'properties').then((res) => setImageUrl(res));
    }, [photo]);
    return (
        <>
            <div className="item" key={photo.id} data-photo-id={photo.id}>
                <FrontImage
                    src={`${property.id}/thumbnails/thumbnail-300_${photo.name}`}
                    identityId={'properties'}
                    alt={property.name}
                />
                <button className="btn-delete" title="Delete" onClick={toggleIsOpenModal} type={'button'}>
                    <span className="far fa-trash-alt"></span>
                </button>
                <a className="area-link" href={imageUrl}></a>
            </div>
            <PropertySectionDeletePhotoModal
                isOpenModal={isOpenModal}
                closeDeleteModal={toggleIsOpenModal}
                photoId={photo.id}
                photoSize={photo.size}
                handlerDeletePhoto={handlerDeletePhoto}
            />
        </>
    );
};

export default PropertySectionPhotosFormItemPhoto;
