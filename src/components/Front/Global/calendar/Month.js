import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import chunk from 'lodash/chunk';
import { navigate } from './utils/constants';
import { notify } from './utils/helpers';
import * as animationFrame from 'dom-helpers/animationFrame';
import DateContentRow from './DateContentRow';
import Header from './Header';

import { inRange, sortEvents } from './utils/eventLevels';
import { PropertyAvailabilityStatus } from '../../../../models/api/property';

let eventsForWeek = (evts, start, end, accessors, localizer) =>
    evts.filter((e) => inRange(e, start, end, accessors, localizer));

class MonthView extends React.Component {
    constructor(...args) {
        super(...args);

        this.state = {
            rowLimit: 5,
            needLimitMeasure: true,
            date: null,
        };
        this.containerRef = createRef();
        this.slotRowRef = createRef();

        this._bgRows = [];
        this._pendingSelection = [];
    }

    static getDerivedStateFromProps({ date, localizer }, state) {
        return {
            date,
            needLimitMeasure: localizer.neq(date, state.date, 'month'),
        };
    }

    componentDidMount() {
        let running;
        window.addEventListener(
            'resize',
            (this._resizeListener = () => {
                if (!running) {
                    animationFrame.request(() => {
                        running = false;
                        this.setState({ needLimitMeasure: true }); //eslint-disable-line
                    });
                }
            }),
            false
        );
    }

    componentDidUpdate() {}

    componentWillUnmount() {
        window.removeEventListener('resize', this._resizeListener, false);
    }

    getContainer = () => {
        return this.containerRef.current;
    };

    render() {
        let { date, localizer, className } = this.props,
            month = localizer.visibleDays(date, localizer),
            weeks = chunk(month, 7);
        this._weekCount = weeks.length;

        return (
            <div
                className={clsx('rbc-month-view', className)}
                role="table"
                aria-label="Month View"
                ref={this.containerRef}
            >
                <div className="rbc-row rbc-month-header" role="row">
                    {this.renderHeaders(weeks[0])}
                </div>
                {weeks.map(this.renderWeek)}
            </div>
        );
    }

    renderWeek = (week, weekIdx) => {
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
        const { needLimitMeasure, rowLimit } = this.state;
        // let's not mutate props
        const weeksEvents = eventsForWeek([...events], week[0], week[week.length - 1], accessors, localizer);
        weeksEvents.sort((a, b) => sortEvents(a, b, accessors, localizer));
        return (
            <DateContentRow
                key={weekIdx}
                ref={weekIdx === 0 ? this.slotRowRef : undefined}
                container={this.getContainer}
                className="rbc-month-row"
                getNow={getNow}
                date={date}
                range={week}
                weekIdx={weekIdx}
                events={weeksEvents}
                maxRows={showAllEvents ? Infinity : rowLimit}
                selected={selected}
                selectable={selectable}
                components={components}
                accessors={accessors}
                getters={getters}
                localizer={localizer}
                renderHeader={this.readerDateHeading}
                renderForMeasure={needLimitMeasure}
                onShowMore={this.handleShowMore}
                onSelect={this.handleSelectEvent}
                onDoubleClick={this.handleDoubleClickEvent}
                onKeyPress={this.handleKeyPressEvent}
                onSelectSlot={this.handleSelectSlot}
                longPressThreshold={longPressThreshold}
                rtl={this.props.rtl}
                resizable={this.props.resizable}
                showAllEvents={showAllEvents}
            />
        );
    };

    readerDateHeading = ({ date, className, ...props }) => {
        let { date: currentDate, getDrilldownView, localizer, events, resources, obEvents } = this.props;
        let isOffRange = localizer.neq(date, currentDate, 'month');
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

        if (currentEvent && currentEvent.status === PropertyAvailabilityStatus.booked) {
            backgroundColor = '#EFFFEB';
        }
        if (currentResource) {
            isExternalCalendar = true;
            backgroundColor = currentResource?.color;
        }

        const { nightlyPrice, minNightBidPrice } = { ...currentEvent };

        return (
            <div
                {...props}
                className={clsx(
                    className,
                    isOffRange && 'rbc-off-range',
                    isCurrent && 'rbc-current',
                    currentEvent?.status === PropertyAvailabilityStatus.block && 'currentEvent'
                )}
                style={{ backgroundColor: backgroundColor }}
                role="cell"
            >
                <div
                    className={`rbc-date-cell__info ${
                        !isExternalCalendar && currentEvent && currentEvent.status === PropertyAvailabilityStatus.booked
                            ? 'rbc-button-link_green'
                            : ''
                    } ${
                        !isExternalCalendar && currentEvent && currentEvent.status === PropertyAvailabilityStatus.block
                            ? 'rbc-button-link_blocked'
                            : ''
                    }
                    ${!isExternalCalendar && !currentEvent ? 'rbc-button-link_blocked' : ''}
                    `}
                >
                    <span className={'m'}>{label}</span>
                </div>
                {isExternalCalendar && (
                    <img
                        className={'rbc-icon-lock'}
                        src={'/assets/img/i-lock.svg'}
                        width={18}
                        height={18}
                        alt={'Date is blocked'}
                    />
                )}
                <div
                    className={`rbc-button-link`}
                    // disabled={currentEvent?.status === PropertyAvailabilityStatus.block}
                >
                    {nightlyPrice && (
                        <div className="rbc-date-cell__nightly-price">
                            <span className="fas fa-moon" style={{ color: '#B7BECB' }}></span>
                            <span> ${nightlyPrice}</span>
                        </div>
                    )}

                    {nightlyPrice && minNightBidPrice && <span className={'rbc-date-cell__slash'}>/</span>}

                    {minNightBidPrice && (
                        <div className="rbc-date-cell__min-price">
                            <span className="fas fa-arrow-up" style={{ color: '#B7BECB' }}></span>
                            <span> ${minNightBidPrice}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    renderHeaders(row) {
        let { localizer, components } = this.props;
        let first = row[0];
        let last = row[row.length - 1];
        let HeaderComponent = components.header || Header;

        return localizer.range(first, last, 'day').map((day, idx) => (
            <div key={'header_' + idx} className="rbc-header">
                <HeaderComponent date={day} localizer={localizer} label={localizer.format(day, 'EEE')} />
            </div>
        ));
    }

    handleSelectSlot = (range, slotInfo) => {
        this._pendingSelection = this._pendingSelection.concat(range);

        clearTimeout(this._selectTimer);
        this._selectTimer = setTimeout(() => this.selectDates(slotInfo));
    };

    selectDates(slotInfo) {
        let slots = this._pendingSelection.slice();

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

MonthView.propTypes = {
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

MonthView.range = (date, { localizer }) => {
    let start = localizer.firstVisibleDay(date, localizer);
    let end = localizer.lastVisibleDay(date, localizer);
    return { start, end };
};

MonthView.navigate = (date, action, { localizer }) => {
    switch (action) {
        case navigate.PREVIOUS:
            return localizer.add(date, -1, 'month');

        case navigate.NEXT:
            return localizer.add(date, 1, 'month');

        default:
            return date;
    }
};

MonthView.title = (date, { localizer }) => localizer.format(date, 'monthHeaderFormat');

export default MonthView;
