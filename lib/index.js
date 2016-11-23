'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.appPlat = exports.envName = exports.webview = exports.account = exports.shop = exports.share = exports.network = exports.ui = exports.page = exports.http = exports.location = exports.device = exports.ready = undefined;

var _bdwm = require('./bdwm');

var bdwm = _interopRequireWildcard(_bdwm);

var _bainuo = require('./bainuo');

var bainuo = _interopRequireWildcard(_bainuo);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function is(ua) {
    return new RegExp(ua, 'i').test(navigator.userAgent);
}

var isBdwm = is('wmapp');

var isBainuo = is('BDNuomiApp') || window.location.search.indexOf('env=nuomi') >= 0;

var env = void 0;
var envName = void 0;
var appPlat = 'waimai';
if (isBdwm) {
    env = bdwm;
    exports.envName = envName = 'bdwm';
} else if (isBainuo) {
    env = bainuo;
    exports.envName = envName = 'bainuo';
    exports.appPlat = appPlat = 'nuomi';
} else {
    env = bdwm;
    exports.envName = envName = 'bdwm';
}

var _env = env,
    ready = _env.ready,
    device = _env.device,
    location = _env.location,
    http = _env.http,
    page = _env.page,
    ui = _env.ui,
    network = _env.network,
    share = _env.share,
    shop = _env.shop,
    account = _env.account,
    webview = _env.webview;
exports.ready = ready;
exports.device = device;
exports.location = location;
exports.http = http;
exports.page = page;
exports.ui = ui;
exports.network = network;
exports.share = share;
exports.shop = shop;
exports.account = account;
exports.webview = webview;
exports.envName = envName;
exports.appPlat = appPlat;