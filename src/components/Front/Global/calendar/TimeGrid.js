'use strict';

var _interopRequireWildcard = require('@babel/runtime/helpers/interopRequireWildcard').default;

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault').default;

Object.defineProperty(exports, '__esModule', {
    value: true,
});

var _classCallCheck2 = _interopRequireDefault(require('@babel/runtime/helpers/classCallCheck'));

var _createClass2 = _interopRequireDefault(require('@babel/runtime/helpers/createClass'));

var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

var _createSuper2 = _interopRequireDefault(require('@babel/runtime/helpers/createSuper'));

var _react = _interopRequireWildcard(require('react'));

var _clsx = _interopRequireDefault(require('clsx'));

var animationFrame = _interopRequireWildcard(require('dom-helpers/animationFrame'));

var _memoizeOne = _interopRequireDefault(require('memoize-one'));

var _DayColumn = _interopRequireDefault(require('./DayColumn'));

var _TimeGridHeader = _interopRequireDefault(require('./TimeGridHeader'));

var _helpers = require('./utils/helpers');

var _eventLevels = require('./utils/eventLevels');

var _Resources = _interopRequireDefault(require('./utils/Resources'));

const { notify } = require('./utils/helpers');

var _BackgroundCells = _interopRequireDefault(require('./BackgroundCells'));

var TimeGrid = /*#__PURE__*/ (function (_Component) {
    (0, _inherits2.default)(TimeGrid, _Component);

    var _super = (0, _createSuper2.default)(TimeGrid);

    function TimeGrid(props) {
        var _this;

        (0, _classCallCheck2.default)(this, TimeGrid);
        _this = _super.call(this, props);

        _this.handleScroll = function (e) {
            if (_this.scrollRef.current) {
                _this.scrollRef.current.scrollLeft = e.target.scrollLeft;
            }
        };

        _this.handleResize = function () {
            animationFrame.cancel(_this.rafHandle);
            _this.rafHandle = animationFrame.request(_this.checkOverflow);
        };

        _this.handleSelectAlldayEvent = function () {
            //cancel any pending selections so only the event click goes through.
            _this.clearSelection();

            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            (0, _helpers.notify)(_this.props.onSelectEvent, args);
        };

        _this.getContainer = function () {
            return document.getElementsByClassName('rbc-calendar')[0];
        };

        _this.selectDates = function (slotInfo) {
            let slots = _this.state.pendingSelection.slice();
            _this.state.pendingSelection = [];

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
        };

        _this.onSelectSlot = function (range, slotInfo) {
            _this.state.pendingSelection = _this.state.pendingSelection.concat(range);
            _this.selectDates(slotInfo);
        };

        _this.handleSelectSlot = function (slot) {
            var _this$props = _this.props,
                range = _this$props.range;
            _this.onSelectSlot(range.slice(slot.start, slot.end + 1), slot);
        };

        _this.handleSelectAllDaySlot = function (slots, slotInfo) {
            var onSelectSlot = _this.props.onSelectSlot;
            var start = new Date(slots[0]);
            var end = new Date(slots[slots.length - 1]);
            end.setDate(slots[slots.length - 1].getDate() + 1);
            (0, _helpers.notify)(onSelectSlot, {
                slots: slots,
                start: start,
                end: end,
                action: slotInfo.action,
                resourceId: slotInfo.resourceId,
            });
        };

        _this.checkOverflow = function () {
            if (_this._updatingOverflow) return;
            var content = _this.contentRef.current;
            var isOverflowing = content.scrollHeight > content.clientHeight;

            if (_this.state.isOverflowing !== isOverflowing) {
                _this._updatingOverflow = true;

                _this.setState(
                    {
                        isOverflowing: isOverflowing,
                    },
                    function () {
                        _this._updatingOverflow = false;
                    }
                );
            }
        };

        _this.memoizedResources = (0, _memoizeOne.default)(function (resources, accessors) {
            return (0, _Resources.default)(resources, accessors);
        });
        _this.state = {
            gutterWidth: undefined,
            isOverflowing: null,
            pendingSelection: [],
        };
        _this.scrollRef = /*#__PURE__*/ _react.default.createRef();
        _this.contentRef = /*#__PURE__*/ _react.default.createRef();
        _this._scrollRatio = null;
        _this.gutterRef = /*#__PURE__*/ (0, _react.createRef)();
        return _this;
    }

    (0, _createClass2.default)(TimeGrid, [
        {
            key: 'getSnapshotBeforeUpdate',
            value: function getSnapshotBeforeUpdate() {
                this.checkOverflow();
                return null;
            },
        },
        {
            key: 'componentDidMount',
            value: function componentDidMount() {
                if (this.props.width == null) {
                }

                this.calculateScroll();
                this.applyScroll();
                window.addEventListener('resize', this.handleResize);
            },
        },
        {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                window.removeEventListener('resize', this.handleResize);
                animationFrame.cancel(this.rafHandle);

                if (this.measureGutterAnimationFrameRequest) {
                    window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest);
                }
            },
        },
        {
            key: 'componentDidUpdate',
            value: function componentDidUpdate() {
                this.applyScroll();
            },
        },
        {
            key: 'renderEvents',
            value: function renderEvents(range, events, backgroundEvents, now) {
                var _this2 = this;

                var _this$props = this.props,
                    min = _this$props.min,
                    max = _this$props.max,
                    components = _this$props.components,
                    localizer = _this$props.localizer,
                    dayLayoutAlgorithm = _this$props.dayLayoutAlgorithm;

                return this.props.range.map((date, i) => {
                    return (
                        <div className="rbc-day-slot rbc-time-column" key={i}>
                            {
                                /*#__PURE__*/ _react.default.createElement(
                                    _DayColumn.default,
                                    Object.assign({}, _this2.props, {
                                        localizer: localizer,
                                        min: localizer.merge(date, min),
                                        max: localizer.merge(date, max),
                                        components: components,
                                        isNow: localizer.isSameDate(date, now),
                                        key: i + '-',
                                        date: date,
                                        events: _this$props.events,
                                        backgroundEvents: [],
                                        dayLayoutAlgorithm: dayLayoutAlgorithm,
                                    })
                                )
                            }
                        </div>
                    );
                });
            },
        },
        {
            key: 'render',
            value: function render() {
                var _this$props2 = this.props,
                    events = _this$props2.events,
                    backgroundEvents = _this$props2.backgroundEvents,
                    range = _this$props2.range,
                    width = _this$props2.width,
                    rtl = _this$props2.rtl,
                    selected = _this$props2.selected,
                    getNow = _this$props2.getNow,
                    resources = _this$props2.resources,
                    components = _this$props2.components,
                    accessors = _this$props2.accessors,
                    getters = _this$props2.getters,
                    selectable = _this$props2.selectable,
                    localizer = _this$props2.localizer,
                    onSelectStart = _this$props2.onSelectStart,
                    onSelectEnd = _this$props2.onSelectEnd,
                    date = _this$props2.date,
                    resourceId = _this$props2.resourceId,
                    longPressThreshold = _this$props2.longPressThreshold,
                    resizable = _this$props2.resizable;
                width = width || this.state.gutterWidth;
                var start = range[0],
                    end = range[range.length - 1];
                this.slots = range.length;
                var allDayEvents = [],
                    rangeEvents = [],
                    rangeBackgroundEvents = [];
                events.forEach(function (event) {
                    if ((0, _eventLevels.inRange)(event, start, end, accessors, localizer)) {
                        allDayEvents.push(event);
                    }
                });
                backgroundEvents.forEach(function (event) {
                    if ((0, _eventLevels.inRange)(event, start, end, accessors, localizer)) {
                        rangeBackgroundEvents.push(event);
                    }
                });
                allDayEvents.sort(function (a, b) {
                    return (0, _eventLevels.sortEvents)(a, b, accessors, localizer);
                });
                return /*#__PURE__*/ _react.default.createElement(
                    'div',
                    {
                        className: (0, _clsx.default)('rbc-time-view', resources && 'rbc-time-view-resources'),
                    },
                    /*#__PURE__*/ _react.default.createElement(_TimeGridHeader.default, {
                        range: range,
                        events: allDayEvents,
                        width: width,
                        rtl: rtl,
                        getNow: getNow,
                        localizer: localizer,
                        selected: selected,
                        resources: this.memoizedResources(resources, accessors),
                        selectable: this.props.selectable,
                        accessors: accessors,
                        getters: getters,
                        components: components,
                        scrollRef: this.scrollRef,
                        isOverflowing: this.state.isOverflowing,
                        longPressThreshold: longPressThreshold,
                        onSelectSlot: this.handleSelectAllDaySlot,
                        onSelectEvent: this.handleSelectAlldayEvent,
                        onDoubleClickEvent: this.props.onDoubleClickEvent,
                        onKeyPressEvent: this.props.onKeyPressEvent,
                        onDrillDown: this.props.onDrillDown,
                        getDrilldownView: this.props.getDrilldownView,
                        resizable: resizable,
                    }),
                    /*#__PURE__*/ _react.default.createElement(
                        'div',
                        {
                            ref: this.contentRef,
                            className: 'rbc-time-content',
                            onScroll: this.handleScroll,
                        },
                        /*#__PURE__*/ _react.default.createElement(_BackgroundCells.default, {
                            localizer: localizer,
                            date: date,
                            getNow: getNow,
                            rtl: rtl,
                            range: range,
                            weekIdx: 0,
                            container: this.getContainer,
                            monthIndex: 0,
                            selectable: selectable,
                            getters: getters,
                            onSelectStart: onSelectStart,
                            onSelectEnd: onSelectEnd,
                            onSelectSlot: this.handleSelectSlot,
                            components: components,
                            longPressThreshold: longPressThreshold,
                            resourceId: resourceId,
                        }),
                        this.renderEvents(range, rangeEvents, rangeBackgroundEvents, getNow())
                    )
                );
            },
        },
        {
            key: 'clearSelection',
            value: function clearSelection() {
                clearTimeout(this._selectTimer);
            },
        },
        {
            key: 'applyScroll',
            value: function applyScroll() {
                // If auto-scroll is disabled, we don't actually apply the scroll
                if (this._scrollRatio != null && this.props.enableAutoScroll === true) {
                    var content = this.contentRef.current;
                    content.scrollTop = content.scrollHeight * this._scrollRatio; // Only do this once

                    this._scrollRatio = null;
                }
            },
        },
        {
            key: 'calculateScroll',
            value: function calculateScroll() {
                var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
                var min = props.min,
                    max = props.max,
                    scrollToTime = props.scrollToTime,
                    localizer = props.localizer;
                var diffMillis = scrollToTime - localizer.startOf(scrollToTime, 'day');
                var totalMillis = localizer.diff(min, max, 'milliseconds');
                this._scrollRatio = diffMillis / totalMillis;
            },
        },
    ]);
    return TimeGrid;
})(_react.Component);

TimeGrid.defaultProps = {
    step: 30,
    timeslots: 2,
};

export default TimeGrid;
