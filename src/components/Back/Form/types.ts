interface FormElement {
    formName: string;
    field: string;
    value?: any;
}

export interface FormFieldProps extends FormElement {
    classIcon?: string;
    children?: any;
    type: string;
    className?: string;

    label?: string;
    placeholder?: string;
    readOnly?: boolean;

    isFirst?: boolean;
}

export interface FormSelectProps extends FormElement {
    placeholder?: string;
    className?: string;
}

export interface FormCheckboxProps extends FormElement {
    className?: string;
    label?: string;
    readOnly?: boolean;
}

export interface FormNotificationProps {
    message: string | null;
    className?: string;
}
