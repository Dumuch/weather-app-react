import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import enUS from 'date-fns/locale/en-US';
import format from 'date-fns/format';
import add from 'date-fns/add';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import MonthView from './Month';
import Week from './Week';
import cs from 'classnames';
import YearView from './Year';
import { PropertyAvailabilityStatus } from '../../../../models/api/property';
import nextSaturday from 'date-fns/nextSaturday';
import previousSunday from 'date-fns/previousSunday';

import utcToZonedTime from 'date-fns-tz/utcToZonedTime';

import { dateConfig } from '../../../../config/date';

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    resourceId: string | null;
    status: PropertyAvailabilityStatus;
    minNightBidPrice: number | null;
    nightlyPrice: number | null;
}

export interface CalendarResource {
    resourceId: string;
    resourceTitle: string;
    color: string;
}

interface Props {
    handleSelectDays: (dayList: Date[]) => void;
    events: CalendarEvent[];
    resourceMap: CalendarResource[];
    calendarRef?: any;
    activeYear: (year: number) => void;
    activeView?: (view: string) => void;
}
const FrontCalendar: FunctionComponent<Props> = ({
    handleSelectDays,
    events,
    resourceMap,
    calendarRef,
    activeYear,
    activeView,
}) => {
    const handleSelectSlot = useCallback((e: { slots: Date[] }) => {
        handleSelectDays(e.slots);
    }, []);
    const [defaultDate, setDefaultDate] = useState<Date>(new Date());
    const [defaultView, setDefaultView] = useState<View>(Views.MONTH);

    const [obEvents, setObEvents] = useState<any>({});

    useEffect(() => {
        const updateObEvents: any = {};
        events.forEach((event) => {
            updateObEvents[utcToZonedTime(new Date(event.start), dateConfig.defaultTimeZone).toDateString()] = event;
        });
        setObEvents(updateObEvents);
    }, [events]);

    useEffect(() => {
        const currentYear = sessionStorage.getItem('currentYear');
        if (currentYear) {
            if (Number(currentYear) !== Number(format(defaultDate, 'yyyy'))) {
                activeYear(Number(format(defaultDate, 'yyyy')));
            }
        } else {
            activeYear(Number(format(defaultDate, 'yyyy')));
        }
        sessionStorage.setItem('currentYear', format(defaultDate, 'yyyy'));
    }, [defaultDate]);

    const locales = {
        'en-US': enUS,
    };

    const localizer = dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales,
    });

    const changeDefaultDate = (isNext: boolean) => {
        return () => {
            if (defaultView === Views.MONTH) {
                isNext
                    ? setDefaultDate((val) => add(val, { months: 1 }))
                    : setDefaultDate((val) => add(val, { months: -1 }));
            }

            if (defaultView === Views.DAY) {
                isNext
                    ? setDefaultDate((val) => add(val, { years: 1 }))
                    : setDefaultDate((val) => add(val, { years: -1 }));
            }

            if (defaultView === Views.WEEK) {
                isNext
                    ? setDefaultDate((val) => add(val, { weeks: 1 }))
                    : setDefaultDate((val) => add(val, { weeks: -1 }));
            }
        };
    };

    const changeDefaultView = (view: View) => {
        return () => {
            if (activeView) {
                activeView(view as string);
            }
            setDefaultView(view);
        };
    };

    const toolbarChangeDateView = () => {
        if (defaultView === Views.MONTH) {
            return format(defaultDate, 'MMMM yyyy');
        }

        if (defaultView === Views.DAY) {
            return format(defaultDate, 'yyyy');
        }

        if (defaultView === Views.WEEK) {
            return `${format(defaultDate, 'MMMM')} ${format(previousSunday(defaultDate), 'd')} / ${format(
                nextSaturday(defaultDate),
                'd'
            )}`;
        }
    };

    return (
        <>
            <div className="calendar__toolbar">
                <div className="calendar__toolbar-change-date">
                    <button
                        className={'toolbar-change-date__button toolbar-change-date__button_prev'}
                        onClick={changeDefaultDate(false)}
                    >
                        <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.796875 5.125C0.585938 5.33594 0.585938 5.6875 0.796875 5.89844L5.34375 10.4688C5.57812 10.6797 5.92969 10.6797 6.14062 10.4688L6.67969 9.92969C6.89062 9.71875 6.89062 9.36719 6.67969 9.13281L3.07031 5.5L6.67969 1.89062C6.89062 1.65625 6.89062 1.30469 6.67969 1.09375L6.14062 0.554688C5.92969 0.34375 5.57812 0.34375 5.34375 0.554688L0.796875 5.125Z" />
                        </svg>
                    </button>
                    <span className={'toolbar-change-date__title'}>{toolbarChangeDateView()}</span>
                    <button
                        className={'toolbar-change-date__button toolbar-change-date__button_next'}
                        onClick={changeDefaultDate(true)}
                    >
                        <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.67969 5.89844C6.89062 5.6875 6.89062 5.33594 6.67969 5.125L2.13281 0.554688C1.89844 0.34375 1.54688 0.34375 1.33594 0.554688L0.796875 1.09375C0.585938 1.30469 0.585938 1.65625 0.796875 1.89062L4.40625 5.5L0.796875 9.13281C0.585938 9.36719 0.585938 9.71875 0.796875 9.92969L1.33594 10.4688C1.54688 10.6797 1.89844 10.6797 2.13281 10.4688L6.67969 5.89844Z" />
                        </svg>
                    </button>
                </div>

                <div className="calendar__toolbar-view">
                    <button
                        className={cs('toolbar-view__button', {
                            'toolbar-view__button_active': defaultView === Views.DAY,
                        })}
                        onClick={changeDefaultView(Views.DAY)}
                    >
                        Year
                    </button>
                    <button
                        className={cs('toolbar-view__button', {
                            'toolbar-view__button_active': defaultView === Views.MONTH,
                        })}
                        onClick={changeDefaultView(Views.MONTH)}
                    >
                        Month
                    </button>
                    <button
                        className={cs('toolbar-view__button', {
                            'toolbar-view__button_active': defaultView === Views.WEEK,
                        })}
                        onClick={changeDefaultView(Views.WEEK)}
                    >
                        Week
                    </button>
                </div>
            </div>

            <Calendar
                localizer={localizer}
                startAccessor="start"
                endAccessor="end"
                date={defaultDate}
                obEvents={obEvents}
                // @ts-ignore
                views={{
                    month: MonthView,
                    week: Week,
                    day: YearView,
                }}
                onView={() => {}}
                onNavigate={() => {}}
                onSelectSlot={handleSelectSlot}
                selectable
                events={events}
                resourceIdAccessor="resourceId"
                resources={resourceMap}
                resourceTitleAccessor="resourceTitle"
                toolbar={false}
                view={defaultView}
                ref={calendarRef}
                className={defaultView}
            />
        </>
    );
};

export default FrontCalendar;
