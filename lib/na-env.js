'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _ajax = require('./ajax');

var _ajax2 = _interopRequireDefault(_ajax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.WMApp = {};

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
window.WMApp.nui = {
    toast: log,
    loading: log,
    dialog: function dialog(params, callback) {
        var data = {
            status: confirm(params.title + '' + params.content)
        };
        callback(data);
    }
};

window.WMApp.page = {
    changePage: log,
    setTitleBar: log,
    closePage: log.bind(window.WMApp, 'closePage'),
    openPageRefresh: log,
    closePageRefresh: log,
    hidePageRefresh: log,
    changePageForResult: function changePageForResult(_ref, callback) {
        var openUrl = _ref.openUrl;

        var pageData = function () {
            var search = openUrl.replace(/^[^?]*\?/, '');
            var params = {};
            if (search) {
                search.split('&').forEach(function (v) {
                    var param = v.split('=');
                    params[param[0]] = param[1] || '';
                });
            }
            return params;
        }();
        var path = pageData.pageName ? pageData.pageName + '.html' : 'index.html';
        if (pageData.pageData) {
            path += '?';
            var data = JSON.parse(decodeURIComponent(pageData.pageData));
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    path += key + '=' + data[key] + '&';
                }
            }
            path = path.slice(0, -1);
        }

        window.open(path);
    },

    setPageForResult: function setPageForResult() {
        window.history.back();
    }
};

window.WMApp.entry = {
    setPageAction: log
};

window.WMApp.console = {
    debug: log,
    log: log
};

window.WMApp.location = {
    getAsyncLocation: function getAsyncLocation(callback) {
        callback({
            cityId: '131',
            address: '彩虹大厦',
            locLng: '12948233.408314',
            locLat: '4844694.74816',
            lng: '1.2948232959996E7',
            lat: '4844695.33793'
        });
    },
    getSyncLocation: function getSyncLocation() {
        return {
            locLng: 12948240.305863,
            locLat: 4844702.756684,
            lng: '1.294825299E7',
            lat: '4844765.42',
            cityId: '131',
            address: '彩虹大厦',
            addressId: '57421251'
        };
    }
};

var cuid = document.cookie.replace(/(?:(?:^|.*;\s*)cuid=\s*([^;]*).*$)|^.*$/, '$1');
if (!cuid) {
    cuid = '2AD442BA33F809FD94289E05FCEBACC4|36515060005553';
    document.cookie = 'cuid=' + cuid + '; expires=Thu, 01 Jan 2970 00:00:00 GMT';
};

window.WMApp.device = {
    getDevice: function getDevice() {
        return {
            cuid: cuid,
            sv: '4.1.1',
            channel: 'com.yingyongbao',
            screen: '1440*2392',
            from: 'na-android',
            os: '6.0.1',
            model: 'XT1570',
            payPlats: '0,1,2,3,4,6',
            refer: 'waimai.homepg'
        };
    }
};

window.WMApp.network = {
    getRequest: function getRequest(params, callback) {
        var url = params.url;
        if (url.indexOf('http://') === 0) {
            url = url.slice(url.indexOf('/', 7));
        }
        (0, _ajax2.default)().get(url, params.data).then(function (res) {
            callback({
                status: 1,
                result: {
                    statusCode: 200,
                    responseBody: (0, _stringify2.default)(res)
                }
            });
        });
    },
    getNetwork: function getNetwork(callback) {
        callback({
            status: 1,
            result: {
                network: 'wifi'
            }
        });
    }
};

window.WMApp.share = {
    share: log,
    universalShare: log
};

window.WMApp.account = {
    login: function login(cb) {
        cb({
            status: 1
        });
        if (window.confirm('去登陆？')) {
            location.href = 'http://wappass.baidu.com/passport/?login&tpl=wimn&u=' + encodeURIComponent(location.href);
        }
    },
    getUserInfo: function getUserInfo(cb) {
        cb({
            status: 1
        });
    }
};
setTimeout(function () {
    window.WMAppReady = true;
    var event = new CustomEvent('WMAppReady');
    document.dispatchEvent(event);
}, 600);