'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault').default;

var _interopRequireWildcard = require('@babel/runtime/helpers/interopRequireWildcard').default;

Object.defineProperty(exports, '__esModule', {
    value: true,
});

var _objectWithoutProperties2 = _interopRequireDefault(require('@babel/runtime/helpers/objectWithoutProperties'));

var _classCallCheck2 = _interopRequireDefault(require('@babel/runtime/helpers/classCallCheck'));

var _createClass2 = _interopRequireDefault(require('@babel/runtime/helpers/createClass'));

var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

var _createSuper2 = _interopRequireDefault(require('@babel/runtime/helpers/createSuper'));

var _react = _interopRequireWildcard(require('react'));

var _clsx = _interopRequireDefault(require('clsx'));

var TimeSlotUtils = _interopRequireWildcard(require('./utils/TimeSlots'));

const { PropertyAvailabilityStatus } = require('../../../../models/api/property');
const React = require('react');

var _DayColumnWrapper = _interopRequireDefault(require('./DayColumnWrapper'));

var _excluded = ['dayProp'],
    _excluded2 = ['eventContainerWrapper'];

var DayColumn = /*#__PURE__*/ (function (_React$Component) {
    (0, _inherits2.default)(DayColumn, _React$Component);

    var _super = (0, _createSuper2.default)(DayColumn);

    function DayColumn() {
        var _this;

        (0, _classCallCheck2.default)(this, DayColumn);

        for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
            _args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(_args));
        _this.state = {
            selecting: false,
            timeIndicatorPosition: null,
        };
        _this.intervalTriggered = false;

        _this.renderEvents = function (_ref) {
            var events = _ref.events;
            var _this$props = _this.props,
                localizer = _this$props.localizer,
                date = _this$props.date,
                obEvents = _this$props.obEvents,
                resources = _this$props.resources;

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
            if (currentEvent && !currentResource && currentEvent.status === PropertyAvailabilityStatus.booked) {
                backgroundColor = '#EFFFEB';
            }

            const { nightlyPrice, minNightBidPrice } = { ...currentEvent };
            return (
                <div
                    className={`rbc-date-cell ${
                        currentEvent?.status === PropertyAvailabilityStatus.block ? 'currentEvent' : ''
                    }`}
                    style={{ backgroundColor: backgroundColor }}
                >
                    <div className="rbc-date-cell__info">
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
                        <span className={'m'}></span>
                    </div>
                </div>
            );
        };

        _this.slotMetrics = TimeSlotUtils.getSlotMetrics(_this.props);
        _this.containerRef = /*#__PURE__*/ (0, _react.createRef)();
        return _this;
    }

    (0, _createClass2.default)(DayColumn, [
        {
            key: 'componentDidMount',
            value: function componentDidMount() {
                if (this.props.isNow) {
                    this.setTimeIndicatorPositionUpdateInterval();
                }
            },
        },
        {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this.clearTimeIndicatorInterval();
            },
        },
        {
            key: 'componentDidUpdate',
            value: function componentDidUpdate(prevProps, prevState) {
                var _this$props3 = this.props,
                    getNow = _this$props3.getNow,
                    isNow = _this$props3.isNow,
                    localizer = _this$props3.localizer,
                    date = _this$props3.date,
                    min = _this$props3.min,
                    max = _this$props3.max;
                var getNowChanged = localizer.neq(prevProps.getNow(), getNow(), 'minutes');

                if (prevProps.isNow !== isNow || getNowChanged) {
                    this.clearTimeIndicatorInterval();

                    if (isNow) {
                        var tail =
                            !getNowChanged &&
                            localizer.eq(prevProps.date, date, 'minutes') &&
                            prevState.timeIndicatorPosition === this.state.timeIndicatorPosition;
                        this.setTimeIndicatorPositionUpdateInterval(tail);
                    }
                } else if (
                    isNow &&
                    (localizer.neq(prevProps.min, min, 'minutes') || localizer.neq(prevProps.max, max, 'minutes'))
                ) {
                    this.positionTimeIndicator();
                }
            },
            /**
             * @param tail {Boolean} - whether `positionTimeIndicator` call should be
             *   deferred or called upon setting interval (`true` - if deferred);
             */
        },
        {
            key: 'setTimeIndicatorPositionUpdateInterval',
            value: function setTimeIndicatorPositionUpdateInterval() {
                var _this2 = this;

                var tail = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                if (!this.intervalTriggered && !tail) {
                    this.positionTimeIndicator();
                }

                this._timeIndicatorTimeout = window.setTimeout(function () {
                    _this2.intervalTriggered = true;

                    _this2.positionTimeIndicator();

                    _this2.setTimeIndicatorPositionUpdateInterval();
                }, 60000);
            },
        },
        {
            key: 'clearTimeIndicatorInterval',
            value: function clearTimeIndicatorInterval() {
                this.intervalTriggered = false;
                window.clearTimeout(this._timeIndicatorTimeout);
            },
        },
        {
            key: 'positionTimeIndicator',
            value: function positionTimeIndicator() {
                var _this$props4 = this.props,
                    min = _this$props4.min,
                    max = _this$props4.max,
                    getNow = _this$props4.getNow;
                var current = getNow();

                if (current >= min && current <= max) {
                    var top = this.slotMetrics.getCurrentTimePosition(current);
                    this.intervalTriggered = true;
                    this.setState({
                        timeIndicatorPosition: top,
                    });
                } else {
                    this.clearTimeIndicatorInterval();
                }
            },
        },
        {
            key: 'render',
            value: function render() {
                var _this$props5 = this.props,
                    date = _this$props5.date,
                    max = _this$props5.max,
                    rtl = _this$props5.rtl,
                    isNow = _this$props5.isNow,
                    resource = _this$props5.resource,
                    accessors = _this$props5.accessors,
                    localizer = _this$props5.localizer,
                    _this$props5$getters = _this$props5.getters,
                    dayProp = _this$props5$getters.dayProp,
                    getters = (0, _objectWithoutProperties2.default)(_this$props5$getters, _excluded),
                    _this$props5$componen = _this$props5.components,
                    EventContainer = _this$props5$componen.eventContainerWrapper,
                    components = (0, _objectWithoutProperties2.default)(_this$props5$componen, _excluded2);
                var slotMetrics = this.slotMetrics;
                var _this$state = this.state,
                    selecting = _this$state.selecting,
                    top = _this$state.top,
                    height = _this$state.height,
                    startDate = _this$state.startDate,
                    endDate = _this$state.endDate;
                var selectDates = {
                    start: startDate,
                    end: endDate,
                };

                var _dayProp = dayProp(max),
                    className = _dayProp.className,
                    style = _dayProp.style;

                var DayColumnWrapperComponent = components.dayColumnWrapper || _DayColumnWrapper.default;
                return /*#__PURE__*/ _react.default.createElement(
                    DayColumnWrapperComponent,
                    {
                        ref: this.containerRef,
                        date: date,
                        style: style,
                        className: (0, _clsx.default)(
                            className,
                            'rbc-day-slot',
                            'rbc-time-column',
                            isNow && 'rbc-now',
                            isNow && 'rbc-today',
                            selecting && 'rbc-slot-selecting'
                        ),
                        slotMetrics: slotMetrics,
                    },
                    /*#__PURE__*/ _react.default.createElement(
                        EventContainer,
                        {
                            localizer: localizer,
                            resource: resource,
                            accessors: accessors,
                            getters: getters,
                            components: components,
                            slotMetrics: slotMetrics,
                        },
                        /*#__PURE__*/ _react.default.createElement(
                            'div',
                            {
                                className: (0, _clsx.default)('rbc-events-container', rtl && 'rtl'),
                            },
                            this.renderEvents({
                                events: this.props.events,
                            })
                        )
                    ),
                    selecting &&
                        /*#__PURE__*/ _react.default.createElement(
                            'div',
                            {
                                className: 'rbc-slot-selection',
                                style: {
                                    top: top,
                                    height: height,
                                },
                            },
                            /*#__PURE__*/ _react.default.createElement(
                                'span',
                                null,
                                localizer.format(selectDates, 'selectRangeFormat')
                            )
                        )
                );
            },
        },
    ]);
    return DayColumn;
})(_react.default.Component);

DayColumn.defaultProps = {
    dragThroughEvents: true,
    timeslots: 2,
};
export default DayColumn;
