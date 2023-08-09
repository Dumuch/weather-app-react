import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../../store';
import { Property } from '../../../../../../../models/api/property';
import FrontUploadFiles from '../../../../../Global/uploadFiles';
import { FileUpload } from 'primereact/fileupload';
import bytes from 'bytes';
import Sortable, { SortableEvent } from 'sortablejs';
// @ts-ignore
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox.css';
import PropertySectionPhotosFormItemPhoto from './itemPhoto';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';
import { File as FileValidation } from '../../../../../../../config/validate';
import { isImageFile } from '../../../../../../../utils/helpers';

interface initialValuesInterface {
    files: File[] | null;
}

interface Props {
    property: Property;
}

const PropertySectionPhotosForm: FunctionComponent<Props> = observer(({ property }) => {
    const { propertiesStore, userStore, globalStore } = useStores();
    const [propertyPhotos, setPropertyPhotos] = useState(propertiesStore.item.item?.propertyPhotos ?? []);

    const [uploadFilesBytes, setUploadFilesBytes] = useState(0);
    const frontUploadFilesRef = useRef<FileUpload>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPropertyPhotos(propertiesStore.item.item?.propertyPhotos ?? []);
    }, [propertiesStore.item.item!.propertyPhotos]);

    useEffect(() => {
        countUploadFilesBytes();
        new Sortable(document.getElementById('gallery') as HTMLElement, {
            group: 'group',
            delay: 20,
            delayOnTouchOnly: true,
            onEnd: function (evt) {
                onSubmitOrder(evt);
            },
        });
    }, [propertiesStore.item.item]);

    const countUploadFilesBytes = (size: number = 0) => {
        let _totalSize = 0 - size;
        Object.values(propertyPhotos).forEach((file) => {
            _totalSize += file.size;
        });
        setUploadFilesBytes(_totalSize);
    };

    Fancybox.bind('#gallery .area-link', {
        groupAll: true,
    });

    const uploadFiles = (files: File[], props: FormikProps<initialValuesInterface>) => {
        let _totalSize = 0;

        Object.values(files as File[]).forEach((file) => {
            _totalSize += file.size;
        });

        if (_totalSize > bytes(`${FileValidation.maxUploadFilesKB}KB`)) {
            setError(
                `You cannot upload more than ${bytes(bytes(`${FileValidation.maxUploadFilesKB}KB`), {
                    unitSeparator: ' ',
                })}`
            );
        } else {
            setError(null);
        }
        props.values.files = files;
    };

    const onSubmit = async (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        let allSize = 0;
        if (props.files) {
            allSize =
                props.files.reduce((acc, file) => {
                    return acc + file.size;
                }, 0) + uploadFilesBytes;
        }

        if (allSize > bytes(`${FileValidation.maxUploadFilesKB}KB`)) {
            setError(
                `You cannot upload more than ${bytes(bytes(`${FileValidation.maxUploadFilesKB}KB`), {
                    unitSeparator: ' ',
                })}`
            );
        } else {
            try {
                await propertiesStore.uploadFiles({
                    id: property.id,
                    ...props,
                });
                propertiesStore.item.isFetched = false;
                globalStore.showToast({
                    severity: 'success',
                    detail: `New photos have been added`,
                });
            } catch (e) {
            } finally {
                formikHelpers.setSubmitting(false);
            }
            frontUploadFilesRef.current?.clear();
        }
    };

    const onSubmitOrder = async (evt: SortableEvent) => {
        const oldIndex = evt.oldIndex;
        const newIndex = evt.newIndex;
        setPropertyPhotos(propertiesStore.item.item?.propertyPhotos ?? []);

        if (oldIndex !== undefined && newIndex !== undefined) {
            const photo = propertyPhotos.splice(oldIndex, 1);
            propertyPhotos.splice(newIndex, 0, photo[0]);
        }

        propertyPhotos.forEach((photo, index) => {
            photo.mainPhoto = index === 0;
            photo.order = index;
        });

        try {
            await propertiesStore.updateItem(
                {
                    id: property.id,
                    propertyPhotos: propertyPhotos,
                },
                false,
                false,
                false
            );
            userStore.properties.isFetched = false;
        } catch (e) {}
    };

    const handlerErrorFileUpload = (file: File | null) => {
        if (file && file.size > bytes(`${FileValidation.maxUploadFileKB}KB`)) {
            setError(
                `"${file.name}" cannot be uploaded. Max file size ${bytes(
                    bytes(FileValidation.maxUploadFileKB + 'KB')
                )}`
            );
        } else if (file && !isImageFile(file)) {
            setError('Only images can be uploaded');
        } else {
            setError(null);
        }
    };

    const initialValues: initialValuesInterface = {
        files: null,
    };

    return (
        <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize={true} validateOnChange={false}>
            {(props) => {
                return (
                    <>
                        <h3 className="h5-style">Add more photos</h3>
                        <FrontNotificationField alertType={AlertType.danger} message={error} />
                        <div className="images-control mb-big">
                            <FrontUploadFiles
                                name={'files[]'}
                                frontUploadFilesRef={frontUploadFilesRef}
                                setValue={(e) => uploadFiles(e, props)}
                                uploadFilesBytes={uploadFilesBytes}
                                isUploadButton={true}
                                handlerUpload={() => onSubmit(props.values, props)}
                                isResetCounter={false}
                                setErrorFile={handlerErrorFileUpload}
                                maxFileSizeKB={FileValidation.maxUploadFileKB}
                                maxUploadFilesKB={FileValidation.maxUploadFilesKB}
                            />
                        </div>
                        <div className="textbox mb">
                            <p>
                                Your first photo here will be the main property image that guests see.
                                <br />
                                Drag and drop your pictures to rearrange the order they appear on your listing.
                            </p>
                        </div>
                        <div className="prop-photos-listing">
                            <div className="inner-wrap" id={'gallery'}>
                                {propertyPhotos &&
                                    propertyPhotos
                                        .sort((a, b) => (a.order < b.order ? -1 : 1))
                                        .map(
                                            (photo) =>
                                                propertiesStore.item.item && (
                                                    <PropertySectionPhotosFormItemPhoto
                                                        key={photo.id}
                                                        property={propertiesStore.item.item}
                                                        photo={photo}
                                                        handlerDeletePhoto={countUploadFilesBytes}
                                                    />
                                                )
                                        )}
                            </div>
                        </div>
                    </>
                );
            }}
        </Formik>
    );
});
export default PropertySectionPhotosForm;
