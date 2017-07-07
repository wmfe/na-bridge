'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webview = exports.account = exports.shop = exports.share = exports.network = exports.ui = exports.page = exports.http = exports.removeOrderTraceItem = exports.sendOnlineStat = exports.location = exports.device = exports.ready = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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
      window.wmlog && window.wmlog('exception.send', e);
      innerP = {};
    }
    (0, _objectAssign2.default)(params, innerP);
  }
  delete params.from;
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

function removeOrderTraceItem() {}

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
  }).catch(function (error) {
    window.wmlog && window.wmlog('exception.send', new Error(error));
    return {
      net_type: 'unreachable'
    };
  });
}

var online = 'https://waimai.baidu.com';


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

          onSuccess: function onSuccess(r) {
            resolve(r);
            setTimeout(function () {}, 0);
          },
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

          onSuccess: function onSuccess(r) {
            resolve(r);
            setTimeout(function () {}, 0);
          },
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
  locationCache = ready().then(function (pageData) {
    return new _promise2.default(function (resolve, reject) {
      var _ref = pageData || {},
          lat = _ref.lat,
          lng = _ref.lng,
          address = _ref.address,
          cityId = _ref.cityId;

      if (lat && lng && address && cityId) {
        window.localStorage.setItem('WM_SUPERMARKET_ADDR', (0, _stringify2.default)({
          lat: lat,
          lng: lng,
          address: address,
          cityId: cityId
        }));
        window.localStorage.setItem('WM_SUPERMARKET_ADDR$$time', Date.now());
        resolve({
          lat: lat,
          lng: lng,
          address: address,
          cityId: cityId
        });
      } else {
        reject(new Error('数据不完整'));
      }
    });
  }).catch(function (e) {
    return new _promise2.default(function (resolve, reject) {
      var time = parseInt(window.localStorage.getItem('WM_SUPERMARKET_ADDR$$time'), 10);
      time = isNaN(time) ? 0 : time;
      if (Date.now() - time > 1000 * 60 * 60) {
        return resolve();
      }
      var addr = window.localStorage.getItem('WM_SUPERMARKET_ADDR');
      try {
        addr = JSON.parse(addr);
      } catch (e) {
        window.wmlog && window.wmlog('exception.send', e);
      }
      resolve(addr);
    });
  }).then(function (addr) {
    var _ref2 = addr || {},
        lat = _ref2.lat,
        lng = _ref2.lng,
        address = _ref2.address,
        cityId = _ref2.cityId;

    if (window.BNJS && window.BNJS.location && window.BNJS.location.hasLocation) {
      var conver = _coordService2.default.convertLL2MC([window.BNJS.location.longitude, window.BNJS.location.latitude]);
      var locLng = conver[0];
      var locLat = conver[1];
      var cityCode = window.BNJS.location.cityCode || window.BNJS.location.city_code;
      return {
        locLng: locLng,

        locLat: locLat,

        lng: lng || locLng,

        lat: lat || locLat,

        cityCode: cityCode,
        cityId: cityId,

        address: address || window.BNJS.location.address,

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
          var _locLng = _conver[0];
          var _locLat = _conver[1];
          var _cityCode = res.data.cityCode || res.data.city_code;
          resolve({
            locLng: _locLng,
            locLat: _locLat,
            lng: lng || _locLng,
            lat: lat || _locLat,
            cityCode: _cityCode,
            cityId: cityId,
            address: address || res.data.address,
            addressId: ''
          });
        } else {
          reject(new Error('定位失败'));
        }
      });
    });
  }).then(function (location) {
    if (location.cityId) {
      return location;
    }

    return http.get('/mobile/waimai', {
      qt: 'convertcitycode',
      source: 'BNCode',
      display: 'json',
      sourceCode: location.cityCode
    }).then(function (res) {
      if (res.error_no === 0) {
        location.cityId = res.result.cityCode || 'null';
      }
      return location;
    });
  });
  return locationCache;
}

var ui = {
  startLoading: function startLoading() {
    document.getElementById('loading').style.display = '';
  },
  endLoading: function endLoading() {
    document.getElementById('loading').style.display = 'none';
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
      if (!window.BNJS.account.isLogin) {
        return _promise2.default.reject(new Error('未登录'));
      }
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
    return http.get('/h5ui/favoriteadd', {
      shop_id: shopId,
      from: f
    }).catch(function (e) {
      window.wmlog && window.wmlog('exception.send', new Error(e));
      setTimeout(function () {}, 0);
      return _promise2.default.reject(new Error('加载失败，请重试'));
    }).then(function (res) {
      return new _promise2.default(function (resolve, reject) {
        if (res.error_no === 0) {
          resolve('收藏成功');
        } else if (res.error_no === 102) {
          account.login();
          reject(new Error());
        } else {
          reject(new Error('加载失败，请重试'));
        }
        setTimeout(function () {}, 0);
      });
    });
  },
  delFavorite: function delFavorite(shopId, f) {
    return http.get('/h5ui/favoritedel', {
      shop_id: shopId,
      from: f
    }).catch(function (e) {
      window.wmlog && window.wmlog('exception.send', new Error(e));
      setTimeout(function () {}, 0);
      return _promise2.default.reject(new Error('加载失败，请重试'));
    }).then(function (res) {
      return new _promise2.default(function (resolve, reject) {
        if (res.error_no === 0) {
          resolve(new Error('取消收藏成功'));
        } else {
          reject(new Error('取消收藏失败'));
        }
        setTimeout(function () {}, 0);
      });
    });
  }
};

var webview = {
  startLoading: function startLoading() {
    return ready().then(function () {
      window.BNJS.ui.showLoadingPage();
    });
  },
  endLoading: function endLoading() {
    return ready().then(function () {
      window.BNJS.ui.hideLoadingPage();
    });
  },
  close: function close() {
    return ready().then(function () {
      window.BNJS.page.back();
    });
  },
  open: function open(url, option) {
    return ready().then(function () {
      if (url.indexOf('bainuo://') !== 0) {
        if (url.indexOf('?') >= 0) {
          url = url.replace('?', '?env=nuomi&');
        } else {
          url = url + '?env=nuomi';
        }
        url = 'bainuo://component?url=' + encodeURIComponent(url);
      }
      window.BNJS.page.start(url, undefined, 0);
    });
  },
  pageshow: function pageshow(callback) {
    if (typeof callback !== 'function') {
      return;
    }
    return ready().then(function () {
      window.BNJS.page.reShow(callback);
    });
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

      window.BNJS.page.start(finalUrl);
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
  setPageId: function setPageId(id) {
    return ready().then(function () {
      return new _promise2.default(function (resolve, reject) {
        window.BNJS.page.setPageId({
          pageId: id,
          onSuccess: resolve,
          onFail: function onFail(e) {
            reject(e && e.errmsg);
          }
        });
      });
    });
  },
  home: function home() {
    return ready().then(function () {
      window.BNJS.page.start('bainuo://component?compid=waimai&comppage=shoplist');
    });
  },
  search: function search(taste) {
    return ready().then(function () {
      window.BNJS.page.start('bainuo://component?compid=waimai&comppage=shopsearch');
    });
  },
  index: function index() {
    var cid = pageData.cid || '';
    var url = 'https://waimai.baidu.com/static/supermarket/index.html?cid=' + cid;
    url = 'bainuo://component?url=' + encodeURIComponent(url);
    return ready().then(function () {
      window.BNJS.page.start(url);
      setTimeout(function () {}, 0);
    });
  },
  cart: function cart() {
    var cid = pageData.cid || '';
    var url = 'https://waimai.baidu.com/static/supermarket/cart.html?cid=' + cid;
    url = 'bainuo://component?url=' + encodeURIComponent(url);
    return ready().then(function () {
      window.BNJS.page.start(url);
      setTimeout(function () {}, 0);
    });
  },
  shop: function shop(_ref3) {
    var shopId = _ref3.shopId,
        _ref3$itemId = _ref3.itemId,
        itemId = _ref3$itemId === undefined ? '' : _ref3$itemId,
        _ref3$addToCart = _ref3.addToCart,
        addToCart = _ref3$addToCart === undefined ? 0 : _ref3$addToCart,
        _ref3$isStore = _ref3.isStore,
        isStore = _ref3$isStore === undefined ? 1 : _ref3$isStore,
        _ref3$activityId = _ref3.activityId,
        activityId = _ref3$activityId === undefined ? '' : _ref3$activityId;

    return ready().then(function () {
      if (!shopId) {
        return _promise2.default.reject(new Error('shopId不能为空'));
      }
      var cid = pageData.cid || '';
      var url = void 0;

      var packageName = window.BNJS.env.packageName;
      var isNuomi = packageName.indexOf('nuomi') >= 0 || packageName === 'com.baidu.searchbox';
      if (isStore && isNuomi) {
        url = 'https://waimai.baidu.com/static/supermarket/shop.html?shopId=' + shopId + '&itemId=' + itemId + '&addToCart=' + addToCart + '&activityId=' + activityId + '&cid=' + cid;
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

      window.BNJS.page.start(url);
      setTimeout(function () {}, 0);
      return 1;
    });
  },
  shopSearch: function shopSearch(shopId) {
    var cid = pageData.cid || '';
    var url = 'https://waimai.baidu.com/static/supermarket/search.html?shopId=' + shopId + '&cid=' + cid;
    url = 'bainuo://component?url=' + encodeURIComponent(url);
    return ready().then(function () {
      window.BNJS.page.start(url);
      setTimeout(function () {}, 0);
    });
  },
  item: function item(shopId, itemId) {
    var addToCart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    return ready().then(function () {
      if (!shopId) {
        return _promise2.default.reject(new Error('shopId不能为空'));
      }
      var cid = pageData.cid || '';
      var url = 'https://waimai.baidu.com/static/supermarket/item.html?shopId=' + shopId + '&itemId=' + itemId + '&addToCart=' + addToCart + '&cid=' + cid;
      url = 'bainuo://component?url=' + encodeURIComponent(url);
      window.BNJS.page.start(url);
      setTimeout(function () {}, 0);
      return 1;
    });
  },
  shopDetail: function shopDetail(shopId) {
    console.warn('糯米里没有单独的商户详情页面');
    return _promise2.default.reject(new Error('方法未实现'));
  },
  shopComment: function shopComment(shopid) {
    console.warn('糯米里没有单独的商户评价页面');
    return _promise2.default.reject(new Error('方法未实现'));
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
    return ready().then(account.getInfo).catch(function (e) {
      return account.login;
    }).then(function () {
      var scheme = 'bainuo://component?compid=waimai&comppage=confirmorder';

      var params = {
        refer: 'supermarket',
        shopId: shopId,
        dishItems: encodeURIComponent(products)
      };
      window.BNJS.page.start(scheme, params);
      setTimeout(function () {}, 0);
    });
  },
  closePushRefresh: function closePushRefresh() {}
};

function serialize(object) {
  var output = [];
  if (object !== undefined && object !== null) {
    for (var key in object) {
      if (object.hasOwnProperty(key) && object[key] !== undefined) {
        var v = object[key];
        if (object[key] !== null && (0, _typeof3.default)(object[key]) === 'object') {
          v = (0, _stringify2.default)(object[key]);
        }
        output.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
      }
    }
  }
  return output.join('&');
}

var DEFAULT = {
  da_src: 'default',
  da_act: 'ready',
  baiduid: document.cookie.replace(/(?:(?:^|.*;\s*)BAIDUID=\s*([^;]*).*$)|^.*$/, '$1'),
  da_refer: '',
  da_trace: ''
};

function send(stat) {
  var query = serialize((0, _objectAssign2.default)({
    da_time: Date.now()
  }, DEFAULT, stat));
  console.log((0, _objectAssign2.default)({
    da_time: Date.now()
  }, DEFAULT, stat), query);
  var image = new Image();
  image.onload = image.onerror = function () {
    image = null;
  };
  image.src = 'http://log.waimai.baidu.com/static/transparent.gif?' + query;
}

function humpToUnderline(params) {
  var result = {};
  (0, _keys2.default)(params).forEach(function (k) {
    var newK = k.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[newK] = params[k];
  });
  return result;
}

function sendOnlineStat(params) {
  params = humpToUnderline(params);
  _promise2.default.all([ready(), device(), location(), network()]).then(function (_ref4) {
    var _ref5 = (0, _slicedToArray3.default)(_ref4, 4),
        pageData = _ref5[0],
        device = _ref5[1],
        location = _ref5[2],
        network = _ref5[3];

    var result = {};
    (0, _objectAssign2.default)(result, params, {
      cuid: device.cuid,
      from: device.from,
      app_plat: 'nuomi',
      channel: device.channel,
      sv: device.sv,
      os: device.os,
      model: device.model,
      screen: device.screen,
      city_id: location.cityId,
      aoi_id: location.aoiId,
      loc_lat: location.locLat,
      loc_lng: location.locLng,
      lat: location.lat,
      lng: location.lng,
      address: location.address,
      nettype: network.net_type
    });
    send(result);
  });
}
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