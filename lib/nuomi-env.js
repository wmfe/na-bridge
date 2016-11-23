'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _ajax = require('./ajax');

var _ajax2 = _interopRequireDefault(_ajax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.BNJS = {};

window.BNJS._isAllReady = true;

var logOutput = [];
var length = 1000;
while (length--) {
    logOutput.push('color: #1f74e6');
    logOutput.push('color: #ccc');
}

function log() {
    var _console;

    for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
        arg[_key] = arguments[_key];
    }

    var str = '%c' + (0, _stringify2.default)(arg, null, '%c|%c   ');
    (_console = console).log.apply(_console, [str].concat((0, _toConsumableArray3.default)(logOutput.slice(0, str.match(/%c/g).length))));
}

window.BNJS.env = {
    cuid: '2AD442BA33F809FD94289E05FCEBACC4|36515060005553',
    appVersion: '3.9.1',
    packageName: 'com.yingyongbao'
};

window.BNJS.device = {
    screenWidth: 1440,
    screenHeight: 2392,
    platform: 'na-android',
    os: '6.0.1',
    name: 'XT1570'
};

window.BNJS.location = {
    longitude: 116.314605,
    latitude: 40.044787,
    cityCode: '100010000',
    address: '彩虹大厦',
    hasLocation: true,
    getLocation: function getLocation() {}
};

window.BNJS.http = {
    get: function get(paramObj) {
        (0, _ajax2.default)().get(paramObj.url, paramObj.params).then(paramObj.onSuccess);
    },
    post: function post(paramObj) {
        (0, _ajax2.default)().post(paramObj.url, paramObj.params).then(paramObj.onSuccess);
    }
};

window.BNJS.page = {
    back: log.bind(undefined, { back: 'nuomi call back' }),
    start: log.bind(undefined, { start: 'nuomi call start' }),
    onBtnBackClick: log.bind(undefined, { onBtnBackClick: 'nuomi call onBtnBackClick' })
};

if (!window.BNJS.ui) {
    window.BNJS.ui = {};
}
window.BNJS.ui.title = {
    addActionButton: log.bind(undefined, { addActionButton: 'nuomi call addActionButton' }),
    setClickableTitle: log.bind(undefined, { setClickableTitle: 'nuomi call setClickableTitle' }),
    setTitle: log.bind(undefined, { setTitle: 'nuomi call setTitle' })
};

window.BNJS.ui.dialog = {
    showLoadingPage: log.bind(undefined, { showLoadingPage: 'nuomi call showLoadingPage' }),
    hideLoadingPage: log.bind(undefined, { hideLoadingPage: 'nuomi call hideLoadingPage' }),
    show: log.bind(undefined, { show: 'nuomi call show' })
};

var event = new Event('BNJSReady');
document.dispatchEvent(event);