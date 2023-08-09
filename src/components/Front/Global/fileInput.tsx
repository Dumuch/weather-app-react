import { FunctionComponent, useEffect, useState } from 'react';
import cs from 'classnames';
import { concatFilesNameWithMaxLength } from '../../../utils/helpers';

interface Props {
    label: string;
    required?: boolean;
    classWrapper?: string;
    classInput?: string;
    classLabel?: string;
    classButton?: string;
    buttonName?: string;
    placeholder?: string;
    id?: string;
    name: string;
    value: File | File[] | null;
    setValue?: (name: string, value: any) => void;
    readOnly?: boolean;
    multiple?: boolean;
}

const FrontFileInput: FunctionComponent<Props> = ({
    label,
    required = false,
    classWrapper = '',
    classInput = '',
    classLabel = '',
    classButton = '',
    buttonName = 'Upload',
    placeholder = '',
    name,
    readOnly = false,
    id,
    value,
    setValue,
    multiple = false,
}) => {
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (value) {
            if (multiple && Array.isArray(value)) {
                setFileName(concatFilesNameWithMaxLength(value));
            } else {
                if ('name' in value) {
                    setFileName(value.name);
                }
            }
        }
    }, [value]);

    return (
        <div className="upload-control">
            <div
                className={cs(`input-wrap ${classWrapper}`, {
                    'has-content': label,
                })}
            >
                <label
                    className={cs(`input-label ${classLabel}`, {
                        required: required,
                    })}
                >
                    {label}
                </label>

                <input
                    title={label}
                    type="text"
                    placeholder={placeholder}
                    value={fileName}
                    className={`form-control file-name ${classInput}`}
                    disabled
                />
                <div className={`btn btn-default ${classButton}`}>
                    <span>{buttonName}</span>
                    <input
                        id={id}
                        title={label}
                        type="file"
                        name={name}
                        disabled={readOnly}
                        multiple={multiple}
                        onChange={(event) => {
                            if (event.currentTarget.files && setValue) {
                                if (multiple) {
                                    setValue(name, Array.from(event.currentTarget.files));
                                } else {
                                    setValue(name, event.currentTarget.files[0]);
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FrontFileInput;
