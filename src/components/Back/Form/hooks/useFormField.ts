import { useFormikContext, getIn } from 'formik';

export const useFormField = (formName: string, field: string) => {
    const { errors, touched, submitCount } = useFormikContext<any>();

    const fieldError = getIn(errors, field);
    const isTouched = getIn(touched, field);
    const hasError = fieldError && isTouched && submitCount > 0;

    return {
        id: `${formName}_${field}`,
        hasError,
        error: fieldError,
    };
};
