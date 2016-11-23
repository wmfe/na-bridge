'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.webview = exports.account = exports.shop = exports.share = exports.network = exports.ui = exports.page = exports.http = exports.location = exports.device = exports.ready = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

require('es6-promise/auto');

var _coordService = require('./coordService');

var _coordService2 = _interopRequireDefault(_coordService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
var pageData = function () {
    var search = window.location.search.replace(/^\?/, '');
    var params = {};
    if (search) {
        search.split('&').forEach(function (v) {
            var param = v.split('=');
            params[param[0]] = param[1] || '';
        });
    }
    if (params.pageData) {
        params.pageData = decodeURIComponent(params.pageData);
        var innerP = void 0;
        try {
            innerP = JSON.parse(params.pageData);
        } catch (e) {
            innerP = {};
        }
        (0, _objectAssign2.default)(params, innerP);
    }
    return params;
}();

function ready() {
    return new _promise2.default(function (resolve, reject) {
        setTimeout(reject, 10000, 'BNJSReady timeout');
        document.addEventListener('BNJSReady', function () {
            window.BNJS.page.enableBounce(false);
            resolve(pageData);
        }, false);
        if (window.BNJS && (0, _typeof3.default)(window.BNJS) === 'object' && window.BNJS._isAllReady) {
            window.BNJS.page.enableBounce(false);
            resolve(pageData);
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

            from: 'bn-' + String(window.BNJS.device.platform).toLowerCase(),

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
                if (data.address) {
                    data.address = decodeURIComponent(data.address);
                }
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
                if (data.address) {
                    data.address = decodeURIComponent(data.address);
                }
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

var locationCache = void 0;
function location() {
    if (locationCache) {
        return locationCache;
    }
    locationCache = ready().then(function () {
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
                cityId: 0,

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
                        cityId: 0,
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
    return locationCache;
}

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
    },
    toast: function toast(text) {
        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'short';

        var length = duration === 'short' ? 0 : 1;
        return ready().then(function () {
            window.BNJS.ui.toast.show(text, length);
            setTimeout(function () {}, 0);
        });
    }
};

function share(params) {
    return ready().then(function () {
        var shareType = params.linkUrl ? 1 : 2;
        window.BNJS.ui.share({
            type: shareType,
            title: params.title,
            content: params.description,
            imgUrl: params.imageUrl,
            imageList: [params.imageUrl],
            url: params.linkUrl,
            platforms: ['weixin_session', 'weixin_timeline']
        });
        setTimeout(function () {}, 0);
    });
}

var account = {
    login: function login() {
        return ready().then(function () {
            return new _promise2.default(function (resolve, reject) {
                window.BNJS.account.login({
                    type: '0',
                    onSuccess: function onSuccess(data) {
                        resolve('登录成功');
                        setTimeout(function () {}, 0);
                    },
                    onFail: function onFail(data) {
                        reject(data.errmsg || '登录取消');
                        setTimeout(function () {}, 0);
                    }
                });
            });
        });
    },
    getInfo: function getInfo() {
        return ready().then(function () {
            return {
                uid: window.BNJS.account.uid,
                username: window.BNJS.account.uName,
                displayname: window.BNJS.account.displayName,
                bduss: window.BNJS.account.bduss
            };
        });
    }
};

var shop = {
    addFavorite: function addFavorite(shopId, f) {
        return http.get('/h5ui/favoriteadd', { shop_id: shopId, from: f }).catch(function (e) {
            setTimeout(function () {}, 0);
            return _promise2.default.reject('加载失败，请重试');
        }).then(function (res) {
            return new _promise2.default(function (resolve, reject) {
                if (res.error_no === 0) {
                    resolve('收藏成功');
                } else if (res.error_no === 102) {
                    account.login();
                    reject('');
                } else {
                    reject('加载失败，请重试');
                }
                setTimeout(function () {}, 0);
            });
        });
    },
    delFavorite: function delFavorite(shopId, f) {
        return http.get('/h5ui/favoritedel', { shop_id: shopId, from: f }).catch(function (e) {
            setTimeout(function () {}, 0);
            return _promise2.default.reject('加载失败，请重试');
        }).then(function (res) {
            return new _promise2.default(function (resolve, reject) {
                if (res.error_no === 0) {
                    resolve('取消收藏成功');
                } else {
                    reject('取消收藏失败');
                }
                setTimeout(function () {}, 0);
            });
        });
    }
};

var webview = {
    startLoading: function startLoading() {
        document.getElementById('loading').style.display = '';
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
    home: function home() {
        window.BNJS.page.start('bainuo://component?compid=waimai&comppage=shoplist', undefined, 0);
    },
    search: function search() {
        window.BNJS.page.start('bainuo://component?compid=waimai&comppage=shopsearch', undefined, 0);
    },
    index: function index() {
        var cid = pageData.cid || '';
        var url = 'http://waimai.baidu.com/static/supermarket/index.html?cid=' + cid;
        url = 'bainuo://component?url=' + encodeURIComponent(url);
        window.BNJS.page.start(url, undefined, 0);
        setTimeout(function () {}, 0);
        return _promise2.default.resolve();
    },
    cart: function cart() {
        var cid = pageData.cid || '';
        var url = 'http://waimai.baidu.com/static/supermarket/cart.html?cid=' + cid;
        url = 'bainuo://component?url=' + encodeURIComponent(url);
        window.BNJS.page.start(url, undefined, 0);
        setTimeout(function () {}, 0);
        return _promise2.default.resolve();
    },
    shop: function shop(_ref) {
        var shopId = _ref.shopId,
            _ref$itemId = _ref.itemId,
            itemId = _ref$itemId === undefined ? '' : _ref$itemId,
            _ref$addToCart = _ref.addToCart,
            addToCart = _ref$addToCart === undefined ? 0 : _ref$addToCart,
            _ref$isStore = _ref.isStore,
            isStore = _ref$isStore === undefined ? 1 : _ref$isStore;

        return ready().then(function () {
            if (!shopId) {
                return _promise2.default.reject('shopId不能为空');
            }
            var cid = pageData.cid || '';
            var url = void 0;
            if (isStore) {
                url = 'http://waimai.baidu.com/static/supermarket/shop.html?shopId=' + shopId + '&itemId=' + itemId + '&addToCart=' + addToCart + '&cid=' + cid;
                url = 'bainuo://component?url=' + encodeURIComponent(url);
            } else {
                url = 'bainuo://component?compid=waimai&comppage=shopinfo&shop_id=' + shopId + '&android_cid=' + cid + '&ios_cid=' + cid;
                if (itemId) {
                    url += '&dish_id=' + itemId;
                    if (addToCart) {
                        url += '&wm_action=put';
                    }
                }
            }

            window.BNJS.page.start(url, undefined, 0);
            setTimeout(function () {}, 0);
            return _promise2.default.resolve();
        });
    },
    shopSearch: function shopSearch(shopId) {
        var cid = pageData.cid || '';
        var url = 'http://waimai.baidu.com/static/supermarket/search.html?shopId=' + shopId + '&cid=' + cid;
        url = 'bainuo://component?url=' + encodeURIComponent(url);
        window.BNJS.page.start(url, undefined, 0);
        setTimeout(function () {}, 0);
        return _promise2.default.resolve();
    },
    item: function item(shopId, itemId) {
        var addToCart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        var cid = pageData.cid || '';
        var url = 'http://waimai.baidu.com/static/supermarket/item.html?shopId=' + shopId + '&itemId=' + itemId + '&addToCart=' + addToCart + '&cid=' + cid;
        url = 'bainuo://component?url=' + encodeURIComponent(url);
        window.BNJS.page.start(url, undefined, 0);
        setTimeout(function () {}, 0);
        return _promise2.default.resolve();
    },
    shopDetail: function shopDetail(shopId) {
        console.warn('糯米里没有单独的商户详情页面');
        return _promise2.default.reject('方法未实现');
    },
    shopComment: function shopComment(shopid) {
        console.warn('糯米里没有单独的商户评价页面');
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
    confirmOrder: function confirmOrder(shopId, products) {
        return ready().then(account.getInfo).catch(account.login).then(function () {
            var scheme = 'bainuo://component?compid=waimai&comppage=orderconfirm';
            scheme += '?source_from=_supermarket_';
            scheme += '&shopId=' + shopId;
            scheme += '&dishItems=' + encodeURIComponent(products);
            window.BNJS.page.start(scheme, undefined, 0);
            setTimeout(function () {}, 0);
        });
    },
    closePushRefresh: function closePushRefresh() {
        return;
    }
};

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