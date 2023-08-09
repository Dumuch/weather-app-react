import { Formik } from 'formik';
import { ReactNode } from 'react';

interface Props<ValidationType> {
    children?: ReactNode;
    initialValues: { fromDate: Date | string; toDate: Date | string };
    onSubmit: (values: { fromDate: Date | string; toDate: Date | string }) => void;
    validationRules?: ValidationType;
}

export const FilterPanel = <T = any,>({ children, initialValues, onSubmit, validationRules }: Props<T>) => {
    return (
        <div className="filter-wrap">
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={validationRules}
                validateOnChange={false}
                enableReinitialize
            >
                {(props) => {
                    return <>{children}</>;
                }}
            </Formik>
        </div>
    );
};
