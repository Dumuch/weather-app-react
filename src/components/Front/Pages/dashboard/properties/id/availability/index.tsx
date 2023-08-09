import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, MouseEventHandler, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Property, PropertyAvailability, PropertyAvailabilityStatus } from '../../../../../../../models/api/property';
import FrontCalendar, { CalendarEvent, CalendarResource } from '../../../../../Global/calendar';
import format from 'date-fns-tz/format';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';

import { dateConfig } from '../../../../../../../config/date';
import {
    getLastErrorMessage,
    isMobile,
    isTouchDevice,
    setErrorsMessageFormik,
    UseLangMessage,
} from '../../../../../../../utils/helpers';
import { AlertType, FrontNotificationField } from '../../../../../Global/notificationField';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useStores } from '../../../../../../../store';
import FrontInput, { InputType } from '../../../../../Global/input';
import { FrontButton } from '../../../../../Global/button';
import { ValidationMessage } from '../../../../../../../lang/en/validatons';
import { Menu } from 'primereact/menu';
import ExportCalendarModal from './ExportCalendarModal';
import { MenuItem } from 'primereact/menuitem';
import ImportCalendarModal from './ImportCalendarModal';
import CustomMenuItemTemplate from './CustomMenuItemTemplate';
import EditCalendarModal from './EditCalendarModal';
import { useRouter } from 'next/router';
import { appConfig } from '../../../../../../../config/app';
import FrontTooltip from '../../../../../Global/tooltip/index';

interface Props {
    property: Property;
}

interface initialValuesInterface {
    dateStart: string;
    dateEnd: string;
    status: PropertyAvailabilityStatus;
    nightlyPrice: number | null;
    isAcceptBids: boolean;
    minNightBidPrice: number | null;
    bidsReceivingPeriod: number | null;
}

export type CalendarModalsState = '' | 'export' | 'import' | 'edit';

const PropertySectionAvailability: FunctionComponent<Props> = observer(({ property }) => {
    const { globalStore, propertiesStore } = useStores();
    const [onlyView, setOnlyView] = useState(false);
    const [selectDays, setSelectDays] = useState<Date[]>([]);
    const [minDay, setMinDay] = useState<Date | null>(null);
    const [maxDay, setMaxDay] = useState<Date | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        {
            label: 'Export Calendar',
            command: () => showExportModal(),
        },
        {
            label: 'Import Calendar',
            command: () => showImportModal(),
        },
    ]);
    const [editCalendarId, setEditCalendarId] = useState<string | null>(null);
    const [resourceMap, setResourceMap] = useState<CalendarResource[]>([]);
    const [findAvailableList, setFindAvailableList] = useState<PropertyAvailability[]>([]);
    const [currentAvailable, setCurrentAvailable] = useState<PropertyAvailability | null>(null);
    const [isAnyAvailability, setIsAnyAvailability] = useState(false);
    const [visibleModal, setVisibleModal] = useState<CalendarModalsState>('');
    const calendarMenu = useRef<Menu | null>(null);
    const [isBookedSelected, setIsBookedSelected] = useState(false);
    const [isGetAvailabilities, setIsGetAvailabilities] = useState(false);
    const [activeYear, setActiveYear] = useState(Number(new Date().getFullYear()));
    const router = useRouter();

    const handlerActiveYear = (year: number) => {
        setIsGetAvailabilities(false);
        setActiveYear(year);
    };

    let isAcceptBids = false;
    let isAvailabilityStatus = true;
    const selectable = useRef(null);

    let error: string | null = '';
    const setError = (err: string | null) => (error = err);

    useEffect(() => {
        setIsAnyAvailability(false);
        if (selectDays.length > 0) {
            setMinDay(selectDays[0]);
            setMaxDay(selectDays[selectDays.length - 1]);

            setCurrentAvailable(
                findAvailableList.find(
                    (item) =>
                        utcToZonedTime(new Date(item.date), dateConfig.defaultTimeZone).toDateString() ===
                        selectDays[0].toDateString()
                ) ?? null
            );

            const arrayFindDays: PropertyAvailability[] = [];

            selectDays.forEach((day) => {
                const item = findAvailableList.find(
                    (item) =>
                        utcToZonedTime(new Date(item.date), dateConfig.defaultTimeZone).toDateString() ===
                        day.toDateString()
                );
                item && arrayFindDays.push(item);
            });
            setIsBookedSelected(!!arrayFindDays.find((item) => item.status === PropertyAvailabilityStatus.booked));

            for (let i = 0; i < arrayFindDays.length; i++) {
                for (let f = i; f < arrayFindDays.length; f++) {
                    const item = arrayFindDays[f];
                    const findDay = arrayFindDays[i];
                    if (
                        findDay.bidsReceivingPeriod !== item.bidsReceivingPeriod ||
                        findDay.isAcceptBids !== item.isAcceptBids ||
                        findDay.minNightBidPrice !== item.minNightBidPrice ||
                        findDay.nightlyPrice !== item.nightlyPrice ||
                        findDay.status !== item.status
                    ) {
                        setIsAnyAvailability(true);
                        break;
                    }
                }
                if (isAnyAvailability) {
                    break;
                }
            }
        } else {
            setCurrentAvailable(null);
        }
    }, [selectDays]);

    useEffect(() => {
        if (Number(router.query.tabIndex) !== 5 || isGetAvailabilities) {
            return;
        }
        setIsGetAvailabilities(true);
        propertiesStore.findAvailability(activeYear).then((res) => {
            if (res?.findAvailable) {
                setFindAvailableList(res.findAvailable);
                setEvents(
                    res.findAvailable.map((item) => {
                        return {
                            id: item.id,
                            title: '',
                            start: item.date,
                            end: item.date,
                            resourceId: item.externalCalendarId,
                            status: item.status,
                            minNightBidPrice: item.minNightBidPrice,
                            nightlyPrice: item.nightlyPrice,
                        };
                    })
                );
            }

            if (res?.findExternalCalendar) {
                setResourceMap(
                    res.findExternalCalendar.map((item) => {
                        return {
                            resourceId: item.id,
                            resourceTitle: item.name,
                            color: item.colorHEX ?? '',
                        };
                    })
                );
            }
        });
        propertiesStore.fetchExternalCalendars(property.id);

        // hide calendar menu on scroll
        // e is of type unknown, because listener expects Event type, and .hide(e) expects SyntheticEvent type
        const scrollListener = (e: unknown) => {
            if (!calendarMenu.current) return;
            calendarMenu.current.hide(e as SyntheticEvent);
        };
        window.addEventListener('scroll', scrollListener);
        return () => window.removeEventListener('scroll', scrollListener);
    }, [router.query.tabIndex, activeYear, isGetAvailabilities]);

    const fetchCalendar = () => setIsGetAvailabilities(false);

    useEffect(() => {
        const propertyCalendars = propertiesStore.externalCalendars.items.filter(
            (calendar) => calendar.propertyId === property.id
        );
        const newMenuItems = propertyCalendars.flatMap<MenuItem>((calendar, index) => {
            if (calendar) {
                if (index === propertyCalendars.length - 1) {
                    return [
                        {
                            label: calendar.name,
                            command: () => showEditModal(calendar.id),
                            template: (item, options) => (
                                <CustomMenuItemTemplate
                                    item={item}
                                    options={options}
                                    badgeColor={calendar.colorHEX ?? '#ffffff'}
                                />
                            ),
                        },
                        { separator: true },
                    ];
                }
                return {
                    label: calendar.name,
                    command: () => showEditModal(calendar.id),
                    template: (item, options) => (
                        <CustomMenuItemTemplate
                            item={item}
                            options={options}
                            badgeColor={calendar.colorHEX ?? '#ffffff'}
                        />
                    ),
                };
            } else return {};
        });
        setMenuItems([
            ...newMenuItems,
            {
                label: 'Export Calendar',
                command: () => showExportModal(),
            },
            {
                label: 'Import Calendar',
                command: () => showImportModal(),
            },
        ]);
    }, [propertiesStore.externalCalendars.items]);

    const handlerActiveView = (view: string) => {
        if (view === 'day' && window.innerWidth <= appConfig.mobileScreenWidth) {
            setOnlyView(true);
        } else {
            setOnlyView(false);
        }
    };

    const showExportModal = () => setVisibleModal('export');
    const showImportModal = () => {
        setIsGetAvailabilities(true);
        setVisibleModal('import');
    };
    const showEditModal = (id: string) => {
        setIsGetAvailabilities(true);
        setVisibleModal('edit');
        setEditCalendarId(id);
    };

    const onSubmit = async (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);
        const minNightBidPrice = props.minNightBidPrice
            ? props.minNightBidPrice.toString().length > 0
                ? props.minNightBidPrice
                : null
            : null;
        const nightlyPrice = props.nightlyPrice
            ? props.nightlyPrice.toString().length > 0
                ? props.nightlyPrice
                : null
            : null;

        if (isAvailabilityStatus) {
            if (props.isAcceptBids && !minNightBidPrice) {
                setError(UseLangMessage('Nightly Minimum Bid Price', ValidationMessage.requiredFront));
                return;
            }
            if (!nightlyPrice) {
                setError(UseLangMessage('Nightly Price', ValidationMessage.requiredFront));
                return;
            }
        }

        if (isBookedSelected) {
            globalStore.showToast({
                severity: 'error',
                detail: 'You cannot edit the parameters of booked dates. Please choose another dates',
            });
            return;
        }

        try {
            if (minDay && maxDay) {
                await propertiesStore
                    .createOrUpdateAvailability({
                        ...props,
                        minNightBidPrice: props.isAcceptBids ? minNightBidPrice : null,
                        nightlyPrice: nightlyPrice,
                        bidsReceivingPeriod:
                            props.isAcceptBids && props.bidsReceivingPeriod
                                ? props.bidsReceivingPeriod.toString().length > 0
                                    ? props.bidsReceivingPeriod
                                    : null
                                : null,
                        dateEnd: format(maxDay, dateConfig.formats.dateOnlyDayAtBackend),
                        dateStart: format(minDay, dateConfig.formats.dateOnlyDayAtBackend),
                    })
                    .then((res) => {
                        if (res?.findAvailable) {
                            setFindAvailableList(res.findAvailable);
                            setCurrentAvailable(null);
                            setEvents(
                                res.findAvailable.map((item: PropertyAvailability) => {
                                    return {
                                        id: item.id,
                                        title: '',
                                        start: item.date,
                                        end: item.date,
                                        resourceId: item.externalCalendarId,
                                        status: item.status,
                                        minNightBidPrice: item.minNightBidPrice,
                                        nightlyPrice: item.nightlyPrice,
                                    };
                                })
                            );
                        }
                    })
                    .catch((e) => {
                        globalStore.showToast({
                            severity: 'error',
                            detail: getLastErrorMessage(e),
                        });
                    });
                // delete all rbc-selected
                document.querySelectorAll<HTMLElement>('.rbc-day-bg').forEach((item) => {
                    item.setAttribute('style', '');
                    item.classList.remove('rbc-selected-cell');
                });
                setMaxDay(null);
                setMinDay(null);
                setCurrentAvailable(null);
            }
        } catch (e) {}
        formikHelpers.setSubmitting(false);
    };

    const initialValues: initialValuesInterface = {
        dateStart: currentAvailable?.date ?? '',
        dateEnd: currentAvailable?.date ?? '',
        status: currentAvailable?.status ?? PropertyAvailabilityStatus.block,
        nightlyPrice: currentAvailable?.nightlyPrice ?? null,
        isAcceptBids: currentAvailable?.isAcceptBids ?? false,
        minNightBidPrice: currentAvailable?.minNightBidPrice ?? null,
        bidsReceivingPeriod: currentAvailable?.bidsReceivingPeriod ?? null,
    };

    const showCalendarMenu: MouseEventHandler<HTMLButtonElement> = (e) => {
        if (!calendarMenu.current) return;
        calendarMenu.current.toggle(e);
    };
    return (
        <>
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                enableReinitialize={true}
                validateOnChange={false}
            >
                {(props) => {
                    isAcceptBids = props.values.isAcceptBids;
                    isAvailabilityStatus = props.values.status === PropertyAvailabilityStatus.available;

                    setErrorsMessageFormik(props.errors, setError);
                    return (
                        <>
                            <FrontNotificationField alertType={AlertType.danger} message={error} />

                            <div className="row">
                                <div className="col-sm-8 indent-right mb-big-xs">
                                    <div className="calendar-component-wrap mb">
                                        <FrontCalendar
                                            handleSelectDays={(dayList) => setSelectDays(dayList)}
                                            events={events}
                                            resourceMap={resourceMap}
                                            calendarRef={selectable}
                                            activeYear={handlerActiveYear}
                                            activeView={handlerActiveView}
                                        />
                                    </div>
                                    <Menu
                                        model={menuItems}
                                        popup
                                        ref={calendarMenu}
                                        id="calendar_menu"
                                        className="calendar-menu"
                                    />
                                    <FrontButton
                                        onClick={showCalendarMenu}
                                        className="btn-border btn-sm calendar-menu-button"
                                    >
                                        Export / Import / Edit A Calendar
                                    </FrontButton>
                                    <ExportCalendarModal
                                        propertyId={property.id}
                                        isVisible={visibleModal === 'export'}
                                        setIsVisible={setVisibleModal}
                                    />
                                    <ImportCalendarModal
                                        propertyId={property.id}
                                        isVisible={visibleModal === 'import'}
                                        setIsVisible={setVisibleModal}
                                        fetchCalendar={fetchCalendar}
                                    />
                                    <EditCalendarModal
                                        propertyId={property.id}
                                        calendar={propertiesStore.externalCalendars.items.find(
                                            (calendar) => calendar.id === editCalendarId
                                        )}
                                        isVisible={visibleModal === 'edit'}
                                        setIsVisible={setVisibleModal}
                                        fetchCalendar={fetchCalendar}
                                    />
                                    <div className="calendar-legend-wrap">
                                        <div className="mb-half text-uppercase">Calendar Legend</div>
                                        <div className="calendar-legend">
                                            <div className="inner-wrap mb">
                                                <div className="item">
                                                    <span className="legend-day booked">20</span>
                                                    <span className="small">Booked</span>
                                                </div>
                                                <div className="item">
                                                    <span className="legend-day">2</span>
                                                    <span className="small">Available</span>
                                                </div>
                                                <div className="item">
                                                    <span className="legend-day blocked">10</span>
                                                    <span className="small">Blocked</span>
                                                </div>
                                                <div className="item">
                                                    <span className={'legend-day legend-day_nightly-price'}>
                                                        <span
                                                            className="fas fa-moon"
                                                            style={{ color: 'rgb(183, 190, 203)' }}
                                                        />
                                                    </span>
                                                    <span className="small">Nightly Price</span>
                                                </div>
                                                <div className="item">
                                                    <span className={'legend-day legend-day_bid-price'}>
                                                        <span
                                                            className="fas fa-arrow-up"
                                                            style={{ color: 'rgb(183, 190, 203)' }}
                                                        />
                                                    </span>
                                                    <span className="small">Minimum Nightly Bid Price</span>
                                                </div>
                                            </div>
                                            {propertiesStore.externalCalendars.items.length > 0 ? (
                                                <div className="item">
                                                    {propertiesStore.externalCalendars.items.map((calendar) => (
                                                        <span
                                                            key={calendar.id}
                                                            style={{
                                                                backgroundColor: calendar.colorHEX ?? '#ffffff',
                                                                borderColor: calendar.colorHEX ?? '#ffffff',
                                                            }}
                                                            className="legend-day locked"
                                                        >
                                                            13
                                                        </span>
                                                    ))}
                                                    <span className="small">Locked from imported calendar</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-4">
                                    {isAnyAvailability && (
                                        <div className="alert alert-warning small mb">
                                            <p>
                                                <span className="fas fa-info-circle"></span> The dates have a different
                                                values, they will be overwritten.
                                            </p>
                                        </div>
                                    )}
                                    <Form method="post">
                                        <div className="form-group mb">
                                            <FrontTooltip
                                                className={isTouchDevice() ? 'p-tooltip_disabled-arrow' : undefined}
                                                mouseTrack={isTouchDevice()}
                                                target={'._calendar-selected-date-title'}
                                                position={'top'}
                                            >
                                                {isMobile() ? (
                                                    <>
                                                        Select the date(s) on the calendar you would like to edit. You
                                                        can click and drag to choose multiple dates at a time. Your
                                                        selected date range will populate in the box below.
                                                    </>
                                                ) : (
                                                    <>
                                                        Select the date(s) on the calendar you would like to edit. You
                                                        can click
                                                        <br />
                                                        and drag to choose multiple dates at a time. Your selected date
                                                        range
                                                        <br />
                                                        will populate in the box below.
                                                    </>
                                                )}
                                            </FrontTooltip>
                                            <h3 className="h6-style color-black mb-half">
                                                Selected Dates&nbsp;
                                                <span className="ml-1 fas fa-question-circle _calendar-selected-date-title"></span>
                                            </h3>
                                            <input
                                                disabled
                                                type="text"
                                                className="form-control"
                                                placeholder=""
                                                value={
                                                    minDay && maxDay
                                                        ? `${format(
                                                              minDay,
                                                              dateConfig.formats.localizedDate
                                                          )} - ${format(maxDay, dateConfig.formats.localizedDate)}`
                                                        : 'Choose Date'
                                                }
                                                title="Text"
                                            />
                                        </div>
                                        <div className="form-group mb">
                                            <h3 className="h6-style color-black mb-half">Availability</h3>
                                            <fieldset>
                                                <span className="inline-radio-wrap">
                                                    <label>
                                                        <Field
                                                            type="radio"
                                                            name="status"
                                                            value={PropertyAvailabilityStatus.available}
                                                        />
                                                        <span className="radio-check-control"></span>
                                                        <span className="radio-check-label">Available</span>
                                                    </label>
                                                    <label>
                                                        <Field
                                                            type="radio"
                                                            name="status"
                                                            value={PropertyAvailabilityStatus.block}
                                                        />
                                                        <span className="radio-check-control"></span>
                                                        <span className="radio-check-label">Blocked</span>
                                                    </label>
                                                </span>
                                            </fieldset>
                                        </div>
                                        <div className="form-group mb">
                                            <FrontInput
                                                label={'Nightly Price ($)'}
                                                value={props.values.nightlyPrice ?? ''}
                                                name={'nightlyPrice'}
                                                onChange={props.handleChange}
                                                type={InputType.currency}
                                                required={isAvailabilityStatus}
                                                readOnly={onlyView}
                                                min={0}
                                            />
                                        </div>
                                        <div className="checkbox mb">
                                            <FrontTooltip
                                                className={isTouchDevice() ? 'p-tooltip_disabled-arrow' : undefined}
                                                mouseTrack={isTouchDevice()}
                                                target={'._calendar-selected-date-accepting-bids'}
                                                position={'top'}
                                            >
                                                {isMobile() ? (
                                                    <>
                                                        Check this box if you would like to allow guests to send you
                                                        bids for the selected date(s).
                                                        <br />
                                                        You will then set the nightly minimum bid price. This will allow
                                                        guests to only send you bids that are at or above this minimum
                                                        nightly price
                                                    </>
                                                ) : (
                                                    <>
                                                        Check this box if you would like <br />
                                                        to allow guests to send you bids
                                                        <br />
                                                        for the selected date(s).
                                                        <br />
                                                        <br />
                                                        You will then set the nightly
                                                        <br />
                                                        minimum bid price. This will
                                                        <br />
                                                        allow guests to only send you
                                                        <br />
                                                        bids that are at or above this
                                                        <br />
                                                        minimum nightly price
                                                    </>
                                                )}
                                            </FrontTooltip>
                                            <label>
                                                <Field type="checkbox" name="isAcceptBids" />
                                                <span className="radio-check-control"></span>
                                                <span className="radio-check-label">
                                                    Do you want to accept bids for these dates?&nbsp;
                                                    <span className="ml-1 fas fa-question-circle _calendar-selected-date-accepting-bids"></span>
                                                </span>
                                            </label>
                                        </div>
                                        <div className="form-group mb">
                                            <FrontInput
                                                label={'Nightly Minimum Bid Price ($)'}
                                                value={
                                                    isAcceptBids && props.values.minNightBidPrice
                                                        ? props.values.minNightBidPrice
                                                        : ''
                                                }
                                                name={'minNightBidPrice'}
                                                onChange={props.handleChange}
                                                type={InputType.currency}
                                                required={isAcceptBids}
                                                readOnly={onlyView || !isAcceptBids}
                                                min={0}
                                            />
                                        </div>
                                        <div className="form-group mb">
                                            <FrontTooltip
                                                showEvent={isTouchDevice() ? 'click' : undefined}
                                                mouseTrack={isTouchDevice()}
                                                className={isTouchDevice() ? 'p-tooltip_disabled-arrow' : undefined}
                                                target={'._calendar-selected-date-receiving-period'}
                                                position={'top'}
                                            >
                                                {isMobile() ? (
                                                    <>
                                                        Enter the number of days before the selected date(s) that you
                                                        want to allow bidding. This will determine when guests can begin
                                                        sending you bids for unreserved dates. For example, if you enter
                                                        “14”, then bidding will become available 14 days prior to this
                                                        date range if the property is not yet booked.
                                                        <br />
                                                        If you would like bidding to always be open to guests for the
                                                        selected date(s) then please leave this field blank.
                                                    </>
                                                ) : (
                                                    <>
                                                        Enter the number of days before the selected
                                                        <br />
                                                        date(s) that you want to allow bidding. This will
                                                        <br />
                                                        determine when guests can begin sending you
                                                        <br />
                                                        bids for unreserved dates. For example, if you
                                                        <br />
                                                        enter “14”, then bidding will become available 14
                                                        <br />
                                                        days prior to this date range if the property is not
                                                        <br />
                                                        yet booked.
                                                        <br />
                                                        <br />
                                                        If you would like bidding to always be open to
                                                        <br />
                                                        guests for the selected date(s) then please leave
                                                        <br />
                                                        this field blank.
                                                    </>
                                                )}
                                            </FrontTooltip>
                                            <label htmlFor={'bidsReceivingPeriodInput'}>
                                                How many days before the selected dates would you like to allow bids?
                                                &nbsp;
                                                <span className="ml-1 fas fa-question-circle _calendar-selected-date-receiving-period"></span>
                                            </label>
                                            <FrontInput
                                                id={'bidsReceivingPeriodInput'}
                                                label={'X# days'}
                                                value={
                                                    isAcceptBids && props.values.bidsReceivingPeriod
                                                        ? props.values.bidsReceivingPeriod
                                                        : ''
                                                }
                                                name={'bidsReceivingPeriod'}
                                                onChange={props.handleChange}
                                                type={InputType.number}
                                                min={1}
                                                readOnly={onlyView || !isAcceptBids}
                                            />
                                        </div>
                                        <FrontButton
                                            className={'btn btn-primary'}
                                            type={'submit'}
                                            loading={props.isSubmitting}
                                            disabled={!(maxDay || minDay) || onlyView}
                                        >
                                            Save
                                        </FrontButton>
                                    </Form>
                                </div>
                            </div>
                        </>
                    );
                }}
            </Formik>
        </>
    );
});

export default PropertySectionAvailability;
