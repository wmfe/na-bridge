'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.network = exports.webview = exports.ui = exports.page = exports.http = exports.location = exports.device = exports.ready = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _coordService = require('./coordService');

var _coordService2 = _interopRequireDefault(_coordService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
var search = window.location.search.replace(/^\?/, '');
var params = {};
if (search) {
    search.split('&').forEach(function (v) {
        var param = v.split('=');
        params[param[0]] = param[1] || '';
    });
}

function ready() {
    return new _promise2.default(function (resolve, reject) {
        setTimeout(reject, 10000, 'window.BNJSReady timeout');
        if (window.window.BNJS && (0, _typeof3.default)(window.window.BNJS) === 'object' && window.BNJS._isAllReady) {
            resolve();
        } else {
            document.addEventListener('window.BNJSReady', resolve, false);
        }
    });
}

function device() {
    return ready().then(function () {
        return {
            client: 'bainuo',

            cuid: window.BNJS.env.cuid,

            sv: window.BNJS.env.appVersion,

            channel: window.BNJS.env.packageName,

            screen: window.BNJS.device.screenWidth + '*' + window.BNJS.device.screenHeight,

            from: window.BNJS.device.platform,

            os: window.BNJS.device.os,

            model: window.BNJS.device.name,

            payPlats: '',

            refer: ''
        };
    });
}

function network() {
    return ready().then(function () {
        return new _promise2.default(function (resolve, reject) {
            window.BNJS.env.network(function (data) {
                var type = 'mobile';
                if (data.network === 'wifi') {
                    type = 'wifi';
                } else if (data.network === 'non') {
                    type = 'unreachable';
                }
                resolve({
                    net_type: type
                });
            });
            setTimeout(reject, 10000);
        });
    }).catch(function () {
        return {
            net_type: 'unreachable'
        };
    });
};

var online = 'http://waimai.baidu.com';


var http = {
    get: function get(url, data) {
        return ready().then(function () {
            return new _promise2.default(function (resolve, reject) {
                window.BNJS.http.get({
                    url: online + url,
                    params: data,

                    onSuccess: resolve,
                    onFail: reject
                });
            });
        });
    },
    post: function post(url, data) {
        return ready().then(function () {
            return new _promise2.default(function (resolve, reject) {
                window.BNJS.http.post({
                    url: online + url,
                    params: data,

                    onSuccess: resolve,
                    onFail: reject
                });
            });
        });
    }
};

function location() {
    return ready().then(function () {
        if (window.BNJS.location.hasLocation) {
            var conver = _coordService2.default.convertLL2MC([window.BNJS.location.longitude, window.BNJS.location.latitude]);
            var lat = conver[1];
            var lng = conver[0];
            return {
                locLng: lng,

                locLat: lat,

                lng: lng,

                lat: lat,

                cityCode: window.BNJS.location.cityCode,
                cityId: 131,

                address: window.BNJS.location.address,

                addressId: ''
            };
        }

        return new _promise2.default(function (resolve, reject) {
            window.BNJS.location.requestRealTimeLocation(function (res) {
                window.BNJS.location.getLocation();
                var latitude = res.data.latitude;
                var longitude = res.data.longitude;
                if (latitude && longitude) {
                    var _conver = _coordService2.default.convertLL2MC([longitude, latitude]);
                    var _lat = _conver[1];
                    var _lng = _conver[0];
                    resolve({
                        locLng: _lng,
                        locLat: _lat,
                        lng: _lng,
                        lat: _lat,
                        cityCode: res.data.cityCode,
                        cityId: 131,
                        address: res.data.address,
                        addressId: ''
                    });
                } else {
                    reject('定位失败');
                }
            });
        });
    }).then(function (location) {
        return http.get('/mobile/waimai', {
            qt: 'convertcitycode',
            source: 'BNCode',
            display: 'json',
            sourceCode: location.cityCode
        }).then(function (res) {
            if (res.error_no === 0) {
                location.cityId = res.result.cityCode;
            }
            return location;
        });
    });
}

var page = {
    close: function close() {
        return ready().then(window.BNJS.page.back);
    },
    open: function open(url, option) {
        return ready().then(function () {
            var finalUrl = '';
            if (url.indexOf('bainuo://') === 0) {
                finalUrl = url;
            } else {
                finalUrl = 'bainuo://component?url=' + encodeURI(url);
            }
            if (url === 'bdwm://native?pageName=search') {
                finalUrl = 'bainuo://component?compid=waimai&comppage=shopsearch';
            }

            window.BNJS.page.start(finalUrl, undefined, 0);
        });
    },
    home: function home() {
        window.BNJS.page.start('bainuo://component?compid=waimai&comppage=shoplist', undefined, 0);
    },
    onBack: function onBack(onBackHandler) {
        return ready().then(function () {
            window.BNJS.page.onBtnBackClick({
                callback: function callback() {
                    var cbResult = onBackHandler();
                    if (cbResult === 0) {} else if (cbResult === 1) {
                        window.BNJS.page.back();
                    } else if (cbResult === 2) {
                        window.history.go(-1);
                    } else {
                        window.BNJS.page.back();
                    }
                }
            });
        });
    },
    shop: function shop(_ref) {
        var shopId = _ref.shopId,
            itemId = _ref.itemId,
            _ref$addToCart = _ref.addToCart,
            addToCart = _ref$addToCart === undefined ? 0 : _ref$addToCart,
            _ref$isStore = _ref.isStore,
            isStore = _ref$isStore === undefined ? 1 : _ref$isStore;

        return ready().then(function () {
            if (!shopId) {
                return _promise2.default.reject('shopId不能为空');
            }
            var cid = params.cid || '';
            var url = 'bainuo://component?compid=waimai&comppage=shopinfo&shop_id=' + shopId + '&android_cid=' + cid + '&ios_cid=' + cid;
            if (itemId) {
                url += '&dish_id=' + itemId;
                if (addToCart) {
                    url += '&wm_action=put';
                }
            }

            window.BNJS.page.start(url, undefined, 0);
            return _promise2.default.resolve();
        });
    },
    shopDetail: function shopDetail(shopId) {
        return _promise2.default.reject('方法未实现');
    },
    setTitleBar: function setTitleBar(barConfig) {
        return ready().then(function () {
            var titleText = barConfig.title === undefined ? document.title : barConfig.title;
            var iconArr = ['search', 'close', 'collection', 'location', 'scan', 'share', 'collected', 'arrowdown_red', 'more', 'camera', 'delete'];

            window.BNJS.ui.title.setTitle(titleText);
            if (barConfig.onTitleClick) {
                window.BNJS.ui.title.setClickableTitle(titleText, barConfig.onTitleClick);
            }
            if (barConfig.actionList && barConfig.actionList.length && barConfig.actionList.length > 0) {
                barConfig.actionList.forEach(function (value, index) {
                    window.BNJS.ui.title.addActionButton({
                        tag: index + 1,
                        text: value.title,
                        callback: value.onClick || function () {},

                        icon: iconArr.indexOf(value.id) === -1 ? null : value.id
                    });
                });
            }
        });
    },
    closePushRefresh: function closePushRefresh() {
        return;
    }
};

var ui = {
    startLoading: function startLoading() {
        return ready().then(function () {
            window.BNJS.ui.dialog.showLoadingPage();
        });
    },
    endLoading: function endLoading() {
        return ready().then(function () {
            window.BNJS.ui.dialog.hideLoadingPage();
        });
    },
    confirm: function confirm(title, content) {
        return ready().then(function () {
            return new _promise2.default(function (resolve, reject) {
                var params = {
                    title: title,
                    message: content,
                    cancel: '取消',
                    ok: '确认',
                    onConfirm: resolve,
                    onCancel: reject
                };
                window.BNJS.ui.dialog.show(params);
            });
        });
    }
};

var webview = {
    startLoading: function startLoading() {
        document.getElementById('loading').style.display = 'block';
    },
    endLoading: function endLoading() {
        document.getElementById('loading').style.display = 'none';
    },
    close: function close() {
        return ready().then(window.BNJS.page.back);
    },
    open: function open(url, option) {
        return ready().then(function () {
            var finalUrl = 'bainuo://component?url=' + encodeURI(url);
            window.BNJS.page.start(finalUrl, undefined, 0);
        });
    },
    pageshow: function pageshow(callback) {
        if (typeof callback !== 'function') {
            return;
        }
        if (isIOS) {
            document.addEventListener('visibilitychange', function () {
                if (!document.hidden) {
                    callback();
                }
            });
        } else {
            device().then(function (d) {
                (function loop() {
                    callback();
                    setTimeout(loop, 600);
                })();
            });
        }
    }
};

exports.ready = ready;
exports.device = device;
exports.location = location;
exports.http = http;
exports.page = page;
exports.ui = ui;
exports.webview = webview;
exports.network = network;