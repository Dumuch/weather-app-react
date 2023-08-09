import { useFormikContext } from 'formik';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputMask } from 'primereact/inputmask';
import { FC } from 'react';
import { ResetFormSignature } from './TablePayments';

interface Props {
    onCancel: (resetForm: ResetFormSignature) => () => void;
}

export const FilterForm: FC<Props> = ({ onCancel }) => {
    const { values, errors, handleChange, resetForm, handleSubmit, setFieldValue } = useFormikContext<{
        fromDate: Date;
        toDate: Date;
    }>();
    const onClick = () => handleSubmit();
    return (
        <>
            <div className="flex">
                <div className="mx-4 flex flex-column">
                    <label className="control-label">From Date:</label>
                    <Calendar
                        id="fromDate"
                        name="fromDate"
                        value={values.fromDate}
                        showIcon
                        icon="pi pi-calendar"
                        onChange={handleChange}
                        maxDate={values.toDate}
                    />
                </div>
                <div className="mx-4 flex flex-column">
                    <label className="control-label">To Date:</label>
                    <Calendar
                        id="toDate"
                        name="toDate"
                        value={values.toDate}
                        showIcon
                        icon="pi pi-calendar"
                        onChange={handleChange}
                        minDate={values.fromDate}
                    />
                </div>
            </div>
            <div className="action-buttons">
                <Button className="p-button-default mx-3" type="reset" onClick={onCancel(resetForm)}>
                    Clear
                </Button>
                <Button type="submit" className="p-button-primary mx-3" onClick={onClick}>
                    Filter
                </Button>
            </div>
        </>
    );
};
