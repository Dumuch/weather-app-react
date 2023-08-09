import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import chunk from 'lodash/chunk';
import { notify } from './utils/helpers';
import DateContentRow from './DateContentRow';
import Header from './Header';
import { PropertyAvailabilityStatus } from '../../../../models/api/property';
import { monthsInYear } from './utils/dates';
import getMonth from 'date-fns/getMonth';
import format from 'date-fns/format';

class YearView extends React.Component {
    constructor(...args) {
        super(...args);
        this._pendingSelection = [];
    }

    getContainer = (monthIndex) => {
        return () => document.getElementById(`monthId-${monthIndex}`);
    };

    render() {
        const { date, localizer, className } = this.props;

        const monthList = monthsInYear(date.getFullYear());
        return monthList.map((currentMonth, index) => {
            const month = localizer.visibleDays(new Date(currentMonth), localizer);
            const weeks = chunk(month, 7);
            const arrWeekName = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

            return (
                <div
                    className={clsx('rbc-month-view', className)}
                    id={`monthId-${index}`}
                    key={index}
                    role="table"
                    aria-label="Month View"
                    ref={this.containerRef}
                >
                    <div className="rbc-row rbc-month-header" role="row">
                        <span className={'rbc-month-header__title'}>{localizer.format(currentMonth, 'MMMM')}</span>
                        <div className="wrapper-rbc-month-header">{this.renderHeaders(arrWeekName)}</div>
                    </div>
                    {weeks.map((week, weekIdx) => {
                        return this.renderWeek(week, weekIdx, index, currentMonth);
                    })}
                </div>
            );
        });
    }

    renderWeek = (week, weekIdx, monthIndex, currentMonth) => {
        let {
            events,
            components,
            selectable,
            getNow,
            selected,
            date,
            localizer,
            longPressThreshold,
            accessors,
            getters,
            showAllEvents,
        } = this.props;
        return (
            <DateContentRow
                key={`${weekIdx}_${currentMonth}`}
                ref={weekIdx === 0 ? this.slotRowRef : undefined}
                container={this.getContainer(monthIndex)}
                monthIndex={monthIndex}
                className="rbc-month-row"
                getNow={getNow}
                date={date}
                range={week}
                weekIdx={weekIdx}
                selected={selected}
                selectable={selectable}
                components={components}
                accessors={accessors}
                isSelecting={true}
                currentMonth={currentMonth}
                getters={getters}
                localizer={localizer}
                renderHeader={this.readerDateHeading}
                onShowMore={this.handleShowMore}
                onSelect={this.handleSelectEvent}
                onDoubleClick={this.handleDoubleClickEvent}
                onKeyPress={this.handleKeyPressEvent}
                onSelectSlot={this.handleSelectSlot}
                longPressThreshold={longPressThreshold}
                rtl={this.props.rtl}
                resizable={this.props.resizable}
                showAllEvents={showAllEvents}
                onlyViewMobile={true}
            />
        );
    };

    readerDateHeading = ({ date, className, month_index, key, ...props }) => {
        let { date: currentDate, localizer, events, resources, obEvents } = this.props;
        let isOffRange = month_index !== getMonth(date);
        let isCurrent = localizer.isSameDate(date, currentDate);
        let label = localizer.format(date, 'd');
        const currentEvent = obEvents[date.toDateString()];
        let currentResource = null;
        if (currentEvent?.resourceId) {
            currentResource = resources.find((resource) => {
                if (currentEvent.resourceId === resource.resourceId) {
                    return resource;
                }
            });
        }

        let isExternalCalendar = false;
        let backgroundColor = null;

        if (currentResource) {
            isExternalCalendar = true;
            backgroundColor = currentResource?.color;
        }

        if (currentEvent && currentEvent.status === PropertyAvailabilityStatus.booked) {
            backgroundColor = '#EFFFEB';
        }

        if (currentResource) {
            isExternalCalendar = true;
            backgroundColor = currentResource?.color;
        }

        const { nightlyPrice, minNightBidPrice } = { ...currentEvent };
        return (
            <>
                {!isOffRange ? (
                    <div
                        {...props}
                        className={clsx(
                            className,
                            isOffRange && 'rbc-off-range',
                            isCurrent && 'rbc-current',
                            currentEvent?.status === PropertyAvailabilityStatus.block && 'currentEvent'
                        )}
                        style={{ backgroundColor: backgroundColor ? backgroundColor : 'white' }}
                        role="cell"
                    >
                        {isExternalCalendar && (
                            <img
                                className={'rbc-icon-lock'}
                                src={'/assets/img/i-lock.svg'}
                                width={6}
                                height={7}
                                alt={'Date is blocked'}
                            />
                        )}
                        <div
                            className={`rbc-button-link ${
                                !isExternalCalendar &&
                                currentEvent &&
                                currentEvent.status === PropertyAvailabilityStatus.booked
                                    ? 'rbc-button-link_green'
                                    : ''
                            } ${
                                !isExternalCalendar &&
                                currentEvent &&
                                currentEvent.status === PropertyAvailabilityStatus.block
                                    ? 'rbc-button-link_blocked'
                                    : ''
                            }
                            ${!isExternalCalendar && !currentEvent ? 'rbc-button-link_blocked' : ''}
                            
                            `}
                            disabled={currentEvent?.status === PropertyAvailabilityStatus.block}
                        >
                            <span className={'m'}>{label}</span>
                        </div>
                    </div>
                ) : (
                    <div {...props} className={`${className}`} style={{ opacity: 0 }}></div>
                )}
            </>
        );
    };

    renderHeaders(row) {
        let { localizer, components } = this.props;
        let HeaderComponent = components.header || Header;

        return row.map((day, idx) => (
            <div key={'header_' + idx} className="rbc-header">
                <HeaderComponent date={day} localizer={localizer} label={day} />
            </div>
        ));
    }

    handleSelectSlot = (range, slotInfo, monthIndex) => {
        this._pendingSelection = this._pendingSelection.concat(
            range.filter((date) => {
                return Number(format(date, 'M')) === monthIndex + 1;
            })
        );
        clearTimeout(this._selectTimer);
        this._selectTimer = setTimeout(() => this.selectDates(slotInfo));
    };

    selectDates(slotInfo) {
        const slots = this._pendingSelection.slice();
        this._pendingSelection = [];
        if (slots.length > 0) {
            slots.sort((a, b) => +a - +b);
            const start = new Date(slots[0]);
            const end = new Date(slots[slots.length - 1]);
            end.setDate(slots[slots.length - 1].getDate() + 1);
            notify(this.props.onSelectSlot, {
                slots,
                start,
                end,
                action: slotInfo.action,
                bounds: slotInfo.bounds,
                box: slotInfo.box,
            });
        }
    }

    clearSelection() {
        clearTimeout(this._selectTimer);
        this._pendingSelection = [];
    }
}

YearView.propTypes = {
    events: PropTypes.array.isRequired,
    date: PropTypes.instanceOf(Date),

    min: PropTypes.instanceOf(Date),
    max: PropTypes.instanceOf(Date),

    step: PropTypes.number,
    getNow: PropTypes.func.isRequired,

    scrollToTime: PropTypes.instanceOf(Date),
    enableAutoScroll: PropTypes.bool,
    rtl: PropTypes.bool,
    resizable: PropTypes.bool,
    width: PropTypes.number,

    accessors: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,
    localizer: PropTypes.object.isRequired,

    selected: PropTypes.object,
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
    longPressThreshold: PropTypes.number,

    onNavigate: PropTypes.func,
    onSelectSlot: PropTypes.func,
    onSelectEvent: PropTypes.func,
    onDoubleClickEvent: PropTypes.func,
    onKeyPressEvent: PropTypes.func,
    onShowMore: PropTypes.func,
    showAllEvents: PropTypes.bool,
    doShowMoreDrillDown: PropTypes.bool,
    onDrillDown: PropTypes.func,
    getDrilldownView: PropTypes.func.isRequired,

    popup: PropTypes.bool,
    handleDragStart: PropTypes.func,

    popupOffset: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        }),
    ]),
};

YearView.title = (date, { localizer }) => localizer.format(date, 'monthHeaderFormat');

export default YearView;
