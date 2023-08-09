import classnames from 'classnames';
import { useField, useFormikContext } from 'formik';
import { Calendar, CalendarViewChangeParams } from 'primereact/calendar';
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { FrontFloatLabel } from '../../../Global/floatLabel';

interface Props {
    label: string;
    disabled?: boolean;
    className?: string;
    calendarClassName?: string;
    viewDate?: Date;
    setViewDate?: Dispatch<SetStateAction<Date>>;
    disabledDates?: Date[];
}

const CalendarInput: FC<Props> = ({
    label,
    disabled,
    viewDate,
    setViewDate,
    className = '',
    calendarClassName = '',
    disabledDates = [],
}) => {
    const { values } = useFormikContext<{ checkInOut: Date[] | null }>();
    const todayDate = useMemo(() => new Date(), []);
    const [calendarState, setCalendarState] = useState(false);
    const calendarRef = useRef<Calendar | null>(null);

    useEffect(() => {
        if (values.checkInOut && values.checkInOut[0] && values.checkInOut[1]) {
            calendarRef.current?.hide();
        }
    }, [values.checkInOut]);

    const onFieldClick = () => {
        if (!disabled) {
            setCalendarState(true);
            calendarRef.current?.show();
        }
    };

    const handleViewChange = (e: CalendarViewChangeParams) => {
        setViewDate && setViewDate(new Date(e.value));
    };

    useEffect(() => {
        const scrollListener = () => {
            if (!calendarRef.current) return;
            if (calendarState) {
                setCalendarState(false);
                calendarRef.current?.hide();
            }
        };
        window.addEventListener('scroll', scrollListener);
        return () => window.removeEventListener('scroll', scrollListener);
    }, [calendarState]);

    const [field] = useField('checkInOut');
    const onShow = () => {
        viewDate && calendarRef.current?.updateViewDate(null, viewDate);
    };
    return (
        <div className={classnames('input-wrap has-icon', className)} onClick={onFieldClick}>
            <FrontFloatLabel id={'checkInOut'} label={label}>
                <Calendar
                    ref={calendarRef}
                    {...field}
                    selectionMode={'range'}
                    panelClassName={className}
                    className={calendarClassName}
                    disabled={disabled}
                    showIcon
                    viewDate={viewDate}
                    onShow={onShow}
                    disabledDates={disabledDates}
                    onViewDateChange={handleViewChange}
                    minDate={new Date()}
                />
            </FrontFloatLabel>
        </div>
    );
};

export default CalendarInput;
