'use strict';

import { appConfig } from '../../../../config/app';

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

import BackgroundCells from './BackgroundCells';

var DateContentRow = /*#__PURE__*/ (function (_React$Component) {
    (0, _inherits2.default)(DateContentRow, _React$Component);

    var _super = (0, _createSuper2.default)(DateContentRow);

    function DateContentRow() {
        var _this;

        (0, _classCallCheck2.default)(this, DateContentRow);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }
        _this = _super.call.apply(_super, [this].concat(args));
        _this.handleSelectSlot = function (slot) {
            var _this$props = _this.props,
                range = _this$props.range,
                monthIndex = _this$props.monthIndex,
                onSelectSlot = _this$props.onSelectSlot;
            onSelectSlot(range.slice(slot.start, slot.end + 1), slot, monthIndex);
        };

        _this.getContainer = function () {
            var container = _this.props.container;
            return container ? container(_this.props.monthIndex) : _this.containerRef.current;
        };

        _this.containerRef = /*#__PURE__*/ (0, _react.createRef)();
        _this.headingRowRef = /*#__PURE__*/ (0, _react.createRef)();
        _this.eventRowRef = /*#__PURE__*/ (0, _react.createRef)();
        return _this;
    }

    (0, _createClass2.default)(DateContentRow, [
        {
            key: 'getRowLimit',
            value: function getRowLimit() {
                return 1;
            },
        },
        {
            key: 'render',
            value: function render() {
                var _this$props5 = this.props,
                    date = _this$props5.date,
                    rtl = _this$props5.rtl,
                    weekIdx = _this$props5.weekIdx,
                    range = _this$props5.range,
                    className = _this$props5.className,
                    selectable = _this$props5.selectable,
                    getters = _this$props5.getters,
                    components = _this$props5.components,
                    getNow = _this$props5.getNow,
                    renderHeader = _this$props5.renderHeader,
                    localizer = _this$props5.localizer,
                    onSelectStart = _this$props5.onSelectStart,
                    onSelectEnd = _this$props5.onSelectEnd,
                    monthIndex = _this$props5.monthIndex,
                    isSelecting = _this$props5.isSelecting,
                    resourceId = _this$props5.resourceId,
                    onlyViewMobile = _this$props5.onlyViewMobile,
                    longPressThreshold = _this$props5.longPressThreshold;
                let renderBackgroundCell = true;
                if (onlyViewMobile && window.innerWidth <= appConfig.mobileScreenWidth) {
                    renderBackgroundCell = false;
                }
                return (
                    <div className={className} ref={this.containerRef}>
                        {renderBackgroundCell && (
                            <BackgroundCells
                                localizer={localizer}
                                date={date}
                                getNow={getNow}
                                rtl={rtl}
                                range={range}
                                weekIdx={weekIdx}
                                monthIndex={monthIndex}
                                selectable={selectable}
                                isSelecting={isSelecting}
                                container={this.getContainer}
                                getters={getters}
                                onSelectStart={onSelectStart}
                                onSelectEnd={onSelectEnd}
                                onSelectSlot={this.handleSelectSlot}
                                components={components}
                                longPressThreshold={longPressThreshold}
                                resourceId={resourceId}
                            />
                        )}
                        <div className={'rbc-row-content'}>
                            <div className={'rbc-row'} ref={this.headingRowRef}>
                                {range.map((date, index) => {
                                    return (
                                        <div className={'wrapper-rbc-date-cell'} key={index}>
                                            {renderHeader({
                                                date,
                                                month_index: monthIndex,
                                                key: index,
                                                className: `rbc-date-cell ${
                                                    localizer.isSameDate(date, getNow()) ? 'rbc-now' : ''
                                                }`,
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            },
        },
    ]);

    return DateContentRow;
})(_react.default.Component);

DateContentRow.defaultProps = {
    minRows: 0,
    maxRows: Infinity,
};
export default DateContentRow;
