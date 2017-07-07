'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appPlat = exports.envName = exports.webview = exports.account = exports.shop = exports.share = exports.network = exports.ui = exports.page = exports.http = exports.removeOrderTraceItem = exports.sendOnlineStat = exports.location = exports.device = exports.ready = undefined;

var _bdwm = require('./bdwm');

var bdwm = _interopRequireWildcard(_bdwm);

var _bainuo = require('./bainuo');

var bainuo = _interopRequireWildcard(_bainuo);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function is(ua) {
  return new RegExp(ua, 'i').test(navigator.userAgent);
}

var isBdwm = is('wmapp');

var isBainuo = is('BDNuomiApp');
if (!isBdwm && !isBainuo) {
  isBainuo = window.location.search.indexOf('env=nuomi') >= 0 || window.location.search.indexOf('third_party=nuomi') >= 0 || document.cookie.indexOf('env=nuomi') >= 0;
}

if (isBainuo) {
  document.cookie = 'env=nuomi; expires=Thu, 01 Jan 2970 00:00:00 GMT';
}

var env = void 0;
var envName = void 0;
var appPlat = 'waimai';

if (process.env.BUILD_FOR === 'offline' && isBdwm) {
  env = bdwm;
  exports.envName = envName = 'bdwm';
} else if (process.env.BUILD_FOR !== 'offline' && isBainuo) {
  env = bainuo;
  exports.envName = envName = 'bainuo';

  exports.appPlat = appPlat = 'nuomi';
} else if (process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'development') {
  env = bdwm;
  exports.envName = envName = 'bdwm';
}

var _env = env,
    ready = _env.ready,
    device = _env.device,
    location = _env.location,
    sendOnlineStat = _env.sendOnlineStat,
    removeOrderTraceItem = _env.removeOrderTraceItem,
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
exports.sendOnlineStat = sendOnlineStat;
exports.removeOrderTraceItem = removeOrderTraceItem;
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