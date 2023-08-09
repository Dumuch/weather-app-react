import { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import { InputMask } from 'primereact/inputmask';
import cs from 'classnames';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import * as React from 'react';

interface Props {
    label?: string;
    required?: boolean;
    classWrapper?: string;
    classInput?: string;
    classLabel?: string;
    placeholder?: string;
    id?: string;
    name: string;
    value: string | number | undefined;
    onChange?: (value: any) => void;
    onBlur?: (value: any) => void;
    onFocus?: (value: any) => void;
    onClipboardClick?: (value: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => void;
    isLoading?: boolean;
    type?: InputType;
    readOnly?: boolean;
    error?: string;
    min?: number;
    max?: number;
    inputRef?: any;
    mask?: string;
    maxLength?: number;
    usePrimereact?: boolean;
    autocomplete?: boolean;
    minFractionDigits?: number;
    suffix?: string;
}

export enum InputType {
    text = 'text',
    tel = 'tel',
    textarea = 'textarea',
    number = 'number',
    email = 'email',
    password = 'password',
    mask = 'mask',
    clipboard = 'clipboard',
    currency = 'currency',
}

const FrontInput: FunctionComponent<Props> = ({
    autocomplete = false,
    classInput = '',
    classLabel = '',
    classWrapper = '',
    error,
    id,
    inputRef,
    isLoading = false,
    label = null,
    mask = '+1(999) 999-9999',
    max,
    maxLength,
    min,
    name,
    onBlur,
    onChange,
    onClipboardClick,
    onFocus,
    placeholder = '',
    readOnly = false,
    required = false,
    type = InputType.text,
    usePrimereact = false,
    value,
    minFractionDigits = 2,
    suffix,
}) => {
    const [hasContent, setHasContent] = useState(false);
    const [focusInput, setFocusInput] = useState(false);

    useEffect(() => {
        if (value?.toString()?.length) {
            setHasContent(true);
        } else if ((value && value.toString().length === 0) || value === '') {
            if (!focusInput) setHasContent(false);
        }
    }, [value]);

    const copyText: React.MouseEventHandler<HTMLInputElement> = async (e) => {
        const cb = navigator.clipboard;
        const target = e.target as HTMLInputElement;
        await cb.writeText(target.value);
        onClipboardClick && onClipboardClick(e);
    };

    const isHasContent = () => {
        if (value?.toString() && value.toString()?.length > 0) {
            setHasContent(true);
        } else {
            setHasContent(false);
        }
        setFocusInput(false);
    };

    const onFocusInput = (e: any) => {
        setTimeout(() => {
            setHasContent(true);
            setFocusInput(true);
        }, 50);

        if (onFocus) {
            onFocus(e);
        }
    };
    // ToDo all inputs
    const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
        isHasContent();
        if (onBlur) {
            onBlur(e);
        }
    };

    return (
        <div
            className={cs(`input-wrap ${classWrapper}`, {
                'has-error': error,
                'has-content': hasContent,
                disabled: readOnly,
            })}
        >
            <>
                {label && (
                    <label
                        className={cs(`input-label ${classLabel}`, {
                            required: required,
                            'textarea-label': type === InputType.textarea,
                        })}
                    >
                        {label}
                    </label>
                )}
                {(type === InputType.tel || type === InputType.mask) && (
                    <InputMask
                        id={id}
                        className={`form-control ${classInput}`}
                        style={{ fontSize: hasContent ? 'inherit' : 0 }}
                        placeholder={placeholder}
                        mask={mask}
                        value={value?.toString()}
                        onChange={onChange ?? (() => {})}
                        onFocus={onFocusInput}
                        onBlur={isHasContent}
                        name={name}
                        readOnly={readOnly}
                        autoClear={false}
                        ref={inputRef}
                    ></InputMask>
                )}
                {type === InputType.textarea && (
                    <textarea
                        className={`form-control form-control_textarea ${classInput}`}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange ?? (() => {})}
                        onFocus={() => {
                            if (!readOnly) {
                                setHasContent(true);
                                setFocusInput(true);
                            }
                        }}
                        readOnly={readOnly}
                        onBlur={isHasContent}
                        name={name}
                        id={id}
                        ref={inputRef}
                        maxLength={maxLength}
                    ></textarea>
                )}
                {type === InputType.currency && (
                    <InputNumber
                        inputId={id}
                        name={name}
                        inputStyle={{ fontSize: hasContent ? 'inherit' : 0 }}
                        value={value as number}
                        onValueChange={onChange ?? (() => {})}
                        mode="currency"
                        currency="USD"
                        locale="en-US"
                        placeholder={placeholder}
                        inputClassName={`form-control form-control_number ${classInput}`}
                        onFocus={(event) => {
                            if (!readOnly) {
                                setTimeout(() => {
                                    event.target.selectionStart = event.target.selectionEnd = 1;
                                });
                                setHasContent(true);
                                setFocusInput(true);
                            }
                        }}
                        onBlur={onBlurInput}
                        readOnly={readOnly}
                        max={max}
                        min={min}
                        ref={inputRef}
                        minFractionDigits={minFractionDigits}
                        suffix={!focusInput ? suffix : undefined}
                    />
                )}
                {type === InputType.number && (
                    <>
                        {usePrimereact ? (
                            <InputNumber
                                inputId={id}
                                name={name}
                                inputStyle={{ fontSize: hasContent ? 'inherit' : 0 }}
                                value={value as number}
                                onValueChange={onChange ?? (() => {})}
                                placeholder={placeholder}
                                inputClassName={`form-control form-control_number ${classInput}`}
                                onFocus={(event) => {
                                    if (!readOnly) {
                                        setTimeout(() => {
                                            event.target.selectionStart = event.target.selectionEnd = 1;
                                        });
                                        setHasContent(true);
                                        setFocusInput(true);
                                    }
                                }}
                                onBlur={isHasContent}
                                readOnly={readOnly}
                                max={max}
                                min={min}
                                ref={inputRef}
                            />
                        ) : (
                            <input
                                id={id}
                                className={`form-control form-control_number ${classInput}`}
                                placeholder={placeholder}
                                value={value}
                                onChange={onChange ?? (() => {})}
                                onFocus={() => {
                                    if (!readOnly) {
                                        setHasContent(true);
                                        setFocusInput(true);
                                    }
                                }}
                                onBlur={onBlurInput}
                                onKeyDown={(e) =>
                                    (e.key === '-' || e.key === '+' || e.key === 'e') && e.preventDefault()
                                }
                                name={name}
                                readOnly={readOnly}
                                type={type}
                                min={min}
                                max={max}
                                ref={inputRef}
                            />
                        )}
                    </>
                )}
                {type === InputType.clipboard && (
                    <span className="p-input-icon-right">
                        <i className={`pi ${isLoading ? 'pi-spin pi-spinner' : 'pi-copy'}`} />
                        <InputText
                            id={id}
                            className={`form-control ${classInput}`}
                            placeholder={placeholder}
                            value={value}
                            onClick={copyText}
                            name={name}
                            readOnly={true}
                            type={InputType.text}
                            ref={inputRef}
                        />
                    </span>
                )}

                {type !== InputType.tel &&
                    type !== InputType.textarea &&
                    type !== InputType.number &&
                    type !== InputType.clipboard &&
                    type !== InputType.mask &&
                    type !== InputType.currency && (
                        <input
                            id={id}
                            className={`form-control ${classInput}`}
                            placeholder={placeholder}
                            value={value}
                            onChange={onChange ?? (() => {})}
                            onFocus={onFocusInput}
                            onBlur={isHasContent}
                            name={name}
                            readOnly={readOnly}
                            type={type}
                            ref={inputRef}
                            autoComplete={autocomplete ? 'on' : 'off'}
                        />
                    )}
                {error && <div className="field-error-message small">{error}</div>}
            </>
        </div>
    );
};

export default FrontInput;
