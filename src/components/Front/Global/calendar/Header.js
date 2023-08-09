'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault').default;

Object.defineProperty(exports, '__esModule', {
    value: true,
});

var _react = _interopRequireDefault(require('react'));

var Header = function Header(_ref) {
    var label = _ref.label;
    return <div dangerouslySetInnerHTML={{ __html: label }}></div>;
};

export default Header;
