import { FunctionComponent, useEffect, useState } from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { kbToBytes, kbToMegabytes } from '../../../utils/helpers';
import bytes from 'bytes';
import Image from 'next/image';
import { FileUpload } from './fileupload';
import { FileUploadHandlerParam } from 'primereact/fileupload';

interface Props {
    name: string;
    accept?: string;
    maxFileSizeKB?: number;
    maxUploadFilesKB?: number;
    multiple?: boolean;
    frontUploadFilesRef: any;
    customUpload?: boolean;
    setValue: (files: File[]) => void;
    uploadFilesBytes?: number;
    isUploadButton?: boolean;
    handlerUpload?: () => void;
    isResetCounter?: boolean;
    setErrorFile?: (file: File | null) => void;
}
const FrontUploadFiles: FunctionComponent<Props> = ({
    name,
    accept = 'image/*',
    maxFileSizeKB = 2048,
    maxUploadFilesKB = 10240,
    multiple = true,
    frontUploadFilesRef,
    customUpload = true,
    setValue,
    uploadFilesBytes,
    isUploadButton = false,
    handlerUpload,
    isResetCounter = true,
    setErrorFile,
}) => {
    const [totalSize, setTotalSize] = useState(0);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);

    const checkFileType = (file: File, accept: string) => {
        const acceptedTypes = accept.split(',');
        const fileType = file.type;

        for (let i = 0; i < acceptedTypes.length; i++) {
            const acceptedType = acceptedTypes[i].trim();
            if (
                acceptedType === fileType ||
                acceptedType === '*/*' ||
                (acceptedType.endsWith('/*') && fileType.startsWith(acceptedType.slice(0, -1)))
            ) {
                return true;
            }
        }

        return false;
    };

    const onTemplateClear = () => {
        setUploadFiles([]);
        setErrorFile && setErrorFile(null);
        isResetCounter || uploadFilesBytes === 0 ? setTotalSize(0) : uploadFilesBytes && setTotalSize(uploadFilesBytes);
    };

    useEffect(() => {
        if (typeof uploadFilesBytes === 'number') setTotalSize(uploadFilesBytes);
    }, [uploadFilesBytes]);

    const onTemplateSelect = (e: any) => {
        const arrFiles: File[] = [];
        let isError = false;
        const filesToUpload = Object.values(e.files as File[]);
        const existingFiles = Object.values(uploadFiles as File[]);

        for (const file of filesToUpload) {
            const isFileTypeValid = checkFileType(file, accept);
            const isFileSizeValid = file.size < bytes(`${maxFileSizeKB}KB`);
            const isFileDuplicate = existingFiles.some(
                (existingFile) => existingFile.name === file.name && existingFile.size === file.size
            );

            if (isFileTypeValid && isFileSizeValid && !isFileDuplicate) {
                arrFiles.push(file);
            } else {
                isError = true;
            }
        }

        !isError && setErrorFile && setErrorFile(null);

        setUploadFiles([...uploadFiles, ...arrFiles]);

        let _totalSize = totalSize;
        arrFiles.forEach((file) => {
            _totalSize += file.size;
        });
        setTotalSize(_totalSize);
    };

    const onTemplateRemove = (file: File, callback: any) => {
        setTotalSize(totalSize - file.size);
        setErrorFile && setErrorFile(null);
        const filerUploadFiles = Object.values(uploadFiles as File[]).filter((item) => {
            return item.name !== file.name && item.size !== file.size;
        });
        setUploadFiles(filerUploadFiles);
        callback();
    };

    const headerTemplate = (options: any) => {
        const { className, chooseButton, cancelButton, uploadButton } = options;
        const value = totalSize / (maxUploadFilesKB * 10);

        return (
            <div className={className} style={{ display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                <ProgressBar
                    value={value}
                    displayValueTemplate={() =>
                        `${bytes.format(totalSize, { decimalPlaces: 0 })} / ${kbToMegabytes(maxUploadFilesKB)} MB`
                    }
                ></ProgressBar>
                {isUploadButton && uploadButton}
                {cancelButton}
            </div>
        );
    };
    const chooseOptions = { className: 'p-button p-component btn btn-sm btn-primary btn-sm', label: 'Select file' };
    const uploadOption = {
        className: 'p-button p-component btn btn-sm btn-primary p-fileupload-upload btn-sm mr-2',
        label: 'Upload',
    };
    const cancelOptions = {
        className:
            'p-button p-component btn btn-border btn-sm btn-border p-fileupload-cancel btn-sm ml-2 flex-shrink-0',
        label: 'Clear',
    };

    const itemTemplate = (file: any, props: any) => {
        return (
            <div className="flex align-items-center wrapper-p-fileupload-row">
                <div className="wrapper-bbs-file-info_image">
                    <div className="no-click-wrapper__bbs-file-info_image"></div>
                    <Image
                        src={file.objectURL}
                        alt={file.name}
                        width={120}
                        height={83}
                        className={'bbs-file-info_image'}
                    />
                </div>
                <span className="bbs-file-name">{file.name}</span>
                <span className="bbs-file-size">
                    {bytes.format(file.size, { decimalPlaces: 0, unitSeparator: ' ' })}
                </span>

                <button
                    className={'button_icon-delete ml-auto'}
                    type={'button'}
                    onClick={() => onTemplateRemove(file, props.onRemove)}
                >
                    delete photo
                </button>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column p-fileupload-content__drop-zone">
                <span className="my-5">Drag & Drop Images Here</span>
                <span className="my-5">No images selected</span>
            </div>
        );
    };

    const uploadHandler = (e: FileUploadHandlerParam) => {
        setValue(e.files);
        setErrorFile && setErrorFile(null);
        if (handlerUpload) {
            handlerUpload();
        }
    };

    const onValidationFail = (file: File) => {
        setErrorFile && setErrorFile(file);
    };

    useEffect(() => {
        if (!customUpload) {
            setValue(uploadFiles);
        }
    }, [uploadFiles]);

    return (
        <FileUpload
            ref={frontUploadFilesRef}
            name={name}
            multiple={multiple}
            accept={accept}
            maxFileSize={kbToBytes(maxFileSizeKB)}
            onSelect={onTemplateSelect}
            onClear={onTemplateClear}
            customUpload={customUpload}
            uploadHandler={uploadHandler}
            headerTemplate={headerTemplate}
            itemTemplate={itemTemplate}
            emptyTemplate={emptyTemplate}
            chooseOptions={chooseOptions}
            cancelOptions={cancelOptions}
            uploadOptions={uploadOption}
            onValidationFail={onValidationFail}
        />
    );
};

export default FrontUploadFiles;
