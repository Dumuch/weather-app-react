'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault').default;

Object.defineProperty(exports, '__esModule', {
    value: true,
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require('@babel/runtime/helpers/classCallCheck'));

var _createClass2 = _interopRequireDefault(require('@babel/runtime/helpers/createClass'));

var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

var _createSuper2 = _interopRequireDefault(require('@babel/runtime/helpers/createSuper'));

var _clsx = _interopRequireDefault(require('clsx'));

var _scrollbarSize = _interopRequireDefault(require('dom-helpers/scrollbarSize'));

var _react = _interopRequireDefault(require('react'));

var _DateContentRow = _interopRequireDefault(require('./DateContentRow'));

var _Header = _interopRequireDefault(require('./Header'));

var _helpers = require('./utils/helpers');
const React = require('react');

var TimeGridHeader = /*#__PURE__*/ (function (_React$Component) {
    (0, _inherits2.default)(TimeGridHeader, _React$Component);

    var _super = (0, _createSuper2.default)(TimeGridHeader);

    function TimeGridHeader() {
        var _this;
        (0, _classCallCheck2.default)(this, TimeGridHeader);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _this.handleHeaderClick = function (date, view, e) {
            e.preventDefault();
            (0, _helpers.notify)(_this.props.onDrillDown, [date, view]);
        };

        _this.renderRow = function (resource) {
            var _this$props = _this.props,
                events = _this$props.events,
                rtl = _this$props.rtl,
                selectable = _this$props.selectable,
                getNow = _this$props.getNow,
                range = _this$props.range,
                getters = _this$props.getters,
                localizer = _this$props.localizer,
                accessors = _this$props.accessors,
                components = _this$props.components,
                resizable = _this$props.resizable;
            var resourceId = accessors.resourceId(resource);
            var eventsToDisplay = resource
                ? events.filter(function (event) {
                      return accessors.resource(event) === resourceId;
                  })
                : events;
            return /*#__PURE__*/ _react.default.createElement(_DateContentRow.default, {
                isAllDay: true,
                rtl: rtl,
                getNow: getNow,
                minRows: 2,
                range: range,
                events: eventsToDisplay,
                resourceId: resourceId,
                className: 'rbc-allday-cell',
                selectable: selectable,
                selected: _this.props.selected,
                components: components,
                accessors: accessors,
                getters: getters,
                localizer: localizer,
                onSelect: _this.props.onSelectEvent,
                onDoubleClick: _this.props.onDoubleClickEvent,
                onKeyPress: _this.props.onKeyPressEvent,
                onSelectSlot: _this.props.onSelectSlot,
                longPressThreshold: _this.props.longPressThreshold,
                resizable: resizable,
            });
        };

        return _this;
    }

    (0, _createClass2.default)(TimeGridHeader, [
        {
            key: 'renderHeaderCells',
            value: function renderHeaderCells(range) {
                var _this2 = this;

                var _this$props2 = this.props,
                    localizer = _this$props2.localizer,
                    getDrilldownView = _this$props2.getDrilldownView,
                    getNow = _this$props2.getNow,
                    dayProp = _this$props2.getters.dayProp,
                    _this$props2$componen = _this$props2.components.header,
                    HeaderComponent = _this$props2$componen === void 0 ? _Header.default : _this$props2$componen;
                var today = getNow();
                return range.map(function (date, i) {
                    var drilldownView = getDrilldownView(date);

                    var _dayProp = dayProp(date),
                        className = _dayProp.className,
                        style = _dayProp.style;

                    var header = /*#__PURE__*/ _react.default.createElement(HeaderComponent, {
                        date: date,
                        label: localizer.format(date, 'iii M/d'),
                        localizer: localizer,
                    });

                    return /*#__PURE__*/ _react.default.createElement(
                        'div',
                        {
                            key: i,
                            style: style,
                            className: (0, _clsx.default)(
                                'rbc-header',
                                className,
                                localizer.isSameDate(date, today) && 'rbc-today'
                            ),
                        },
                        drilldownView
                            ? /*#__PURE__*/ _react.default.createElement(
                                  'button',
                                  {
                                      type: 'button',
                                      className: 'rbc-button-link',
                                      onClick: function onClick(e) {
                                          return _this2.handleHeaderClick(date, drilldownView, e);
                                      },
                                  },
                                  header
                              )
                            : /*#__PURE__*/ _react.default.createElement('span', null, header)
                    );
                });
            },
        },
        {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var _this$props3 = this.props,
                    rtl = _this$props3.rtl,
                    range = _this$props3.range,
                    scrollRef = _this$props3.scrollRef,
                    isOverflowing = _this$props3.isOverflowing;
                var style = {};

                if (isOverflowing) {
                    style[rtl ? 'marginLeft' : 'marginRight'] = ''.concat((0, _scrollbarSize.default)(), 'px');
                }

                return /*#__PURE__*/ _react.default.createElement(
                    'div',
                    {
                        style: style,
                        ref: scrollRef,
                        className: (0, _clsx.default)('rbc-time-header', isOverflowing && 'rbc-overflowing'),
                    },
                    /*#__PURE__*/ _react.default.createElement(
                        'div',
                        {
                            className: 'rbc-row rbc-time-header-cell'.concat(
                                range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''
                            ),
                        },
                        _this3.renderHeaderCells(range)
                    )
                );
            },
        },
    ]);
    return TimeGridHeader;
})(_react.default.Component);

var _default = TimeGridHeader;
exports.default = _default;
