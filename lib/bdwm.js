'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webview = exports.account = exports.shop = exports.share = exports.network = exports.ui = exports.page = exports.http = exports.removeOrderTraceItem = exports.sendOnlineStat = exports.location = exports.device = exports.ready = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

require('es6-promise/auto');

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
    setTimeout(reject, 10000, 'WMAppReady timeout');
    if (window.WMApp && window.WMAppReady) {
      resolve(pageData);
      setTimeout(function () {}, 0);
    } else {
      var WMAppReady = function WMAppReady(data) {
        if (data.pageData) {
          (0, _objectAssign2.default)(pageData, data.pageData);
        }
        document.removeEventListener('WMAppReady', WMAppReady);
        resolve(pageData);
        setTimeout(function () {}, 0);
      };
      document.addEventListener('WMAppReady', WMAppReady);
    }
  });
}

function device() {
  return ready().then(function () {
    var deviceInfo = window.WMApp.device.getDevice();
    setTimeout(function () {}, 0);

    return {
      client: 'bdwm',
      cuid: deviceInfo.cuid,
      sv: deviceInfo.sv,
      channel: deviceInfo.channel,
      screen: deviceInfo.screen,
      from: deviceInfo.from,
      os: deviceInfo.os,
      model: deviceInfo.model,
      payPlats: deviceInfo.payPlats,
      refer: deviceInfo.refer
    };
  });
}

function location() {
  return ready().then(function () {
    var loc = window.WMApp.location.getSyncLocation();
    setTimeout(function () {}, 0);
    if (loc.lng && loc.lat) {
      loc.cityId = loc.cityId || 'null';
      return loc;
    }
    return new _promise2.default(function (resolve, reject) {
      window.WMApp.location.getAsyncLocation(function (locAsync) {
        loc.cityId = loc.cityId || 'null';
        resolve(locAsync);
      });
    });
  });
}

function sendOnlineStat(params) {
  return ready().then(function () {
    if (params.daRefer === undefined) {
      params.daRefer = '';
    }
    window.WMApp.stat.sendOnlineStat(params);
  });
}

function removeOrderTraceItem(params) {
  return ready().then(function () {
    window.WMApp.stat.removeOrderTraceItem(params);
  });
}

function network() {
  return {
    net_type: 'wifi'
  };
}

var online = 'https://waimai.baidu.com';


var boundary = '-WaimaiAjaxBoundary-';
var http = {
  get: function get(url, data) {
    return ready().then(function () {
      if (isIOS) {
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            data[key] = encodeURIComponent(data[key]);
          }
        }
      }
      var params = {
        url: online + url,
        data: data
      };
      return new _promise2.default(function (resolve, reject) {
        var start = new Date();
        window.WMApp.network.getRequest(params, function (data) {
          if (window.wmlog && new Date() - start > 2000) {
            window.wmlog('exception.send', new Error('请求耗时大于1s:' + (0, _stringify2.default)(params)), 'warning');
          }
          if (data.status && data.result && parseInt(data.result.statusCode, 10) === 200) {
            var r = data.result.responseBody;
            if (r.indexOf(boundary) === 0) {
              r = r.split(boundary)[1];
            }
            var response = void 0;
            try {
              response = JSON.parse(r);
            } catch (e) {
              window.wmlog && window.wmlog('exception.send', e);

              response = r;
            }

            resolve(response);
            setTimeout(function () {}, 0);
          } else {
            var info = '数据传输失败，请重试';

            reject(new Error(info));
          }
        });
      });
    });
  },
  post: function post(url, data) {
    return ready().then(function () {
      var query = [];
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          query.push(key + '=' + encodeURIComponent(data[key]));
        }
      }
      var params = {
        url: online + url,
        contentType: 'application/x-www-form-urlencoded',
        data: query.join('&')
      };
      return new _promise2.default(function (resolve, reject) {
        var start = new Date();
        window.WMApp.network.postRawRequest(params, function (data) {
          if (window.wmlog && new Date() - start > 2000) {
            window.wmlog('exception.send', new Error('请求耗时大于1s:' + (0, _stringify2.default)(params)), 'warning');
          }
          if (data.status && data.result && parseInt(data.result.statusCode, 10) === 200) {
            var r = data.result.responseBody;
            if (r.indexOf(boundary) === 0) {
              r = r.split(boundary)[1];
            }
            var response = void 0;
            try {
              response = JSON.parse(r);
            } catch (e) {
              window.wmlog && window.wmlog('exception.send', e);

              response = r;
            }

            resolve(response);
            setTimeout(function () {}, 0);
          } else {
            var info = '数据传输失败，请重试';

            reject(new Error(info));
          }
        });
      });
    });
  }
};

var account = {
  login: function login() {
    return ready().then(function () {
      return new _promise2.default(function (resolve, reject) {
        window.WMApp.account.login(function (data) {
          if (data.status) {
            resolve('登录成功');
          } else {
            reject(new Error('登录取消'));
          }
          setTimeout(function () {}, 0);
        });
      });
    });
  },
  getInfo: function getInfo() {
    return ready().then(function () {
      return new _promise2.default(function (resolve, reject) {
        window.WMApp.account.getUserInfo(function (data) {
          var r = data.result || {};
          setTimeout(function () {}, 0);
          if (!data.status) {
            return reject(r.errorInfo);
          }
          resolve(r.userInfo);
        });
      });
    });
  }
};

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
          content: content,
          cancelBtnText: '取消',
          confirmBtnText: '确认'
        };
        window.WMApp.nui.dialog(params, function (data) {
          if (data.status) {
            resolve();
          } else {
            reject(new Error(data.status));
          }
        });
        setTimeout(function () {}, 0);
      });
    });
  },
  toast: function toast(text) {
    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'short';

    return ready().then(function () {
      window.WMApp.nui.toast({
        text: text,
        duration: duration });
      setTimeout(function () {}, 0);
    });
  }
};

function share(params) {
  return ready().then(function () {
    var shareType = params.linkUrl ? 0 : 1;
    window.WMApp.share.universalShare({
      WXSessionShare: {
        imageUrl: params.imageUrl,
        title: params.title,
        description: params.description,
        linkUrl: params.linkUrl,
        bigImageUrl: params.imageUrl,
        shareType: shareType
      },
      WXTimelineShare: {
        imageUrl: params.imageUrl,
        title: params.title,
        description: params.description,
        linkUrl: params.linkUrl,
        bigImageUrl: params.imageUrl,
        shareType: shareType
      }
    });
    setTimeout(function () {}, 0);
  });
}

var shop = {
  addFavorite: function addFavorite(shopId, f) {
    return http.get('/h5ui/favoriteadd', {
      shop_id: shopId,
      from: f
    }).catch(function (e) {
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
      setTimeout(function () {}, 0);
      return _promise2.default.reject(new Error('加载失败，请重试'));
    }).then(function (res) {
      return new _promise2.default(function (resolve, reject) {
        if (res.error_no === 0) {
          resolve('取消收藏成功');
        } else {
          reject(new Error('取消收藏失败'));
        }
        setTimeout(function () {}, 0);
      });
    });
  }
};

var pageShowCallback = [];
var webview = {
  startLoading: ui.startLoading,
  endLoading: ui.endLoading,
  open: function open(url, pageData) {
    if (process.env.NODE_ENV !== 'production') {
      var urlData = function () {
        var search = url.replace(/^[^?]*\?/, '');
        var params = {};
        if (search) {
          search.split('&').forEach(function (v) {
            var param = v.split('=');
            params[param[0]] = param[1] || '';
          });
        }
        return params;
      }();
      var path = urlData.pageName ? urlData.pageName + '.html?' : 'index.html?';
      var data = (0, _objectAssign2.default)({}, JSON.parse(decodeURIComponent(urlData.pageData || 0)), pageData);
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          path += key + '=' + data[key] + '&';
        }
      }
      path = path.slice(0, -1);
      window.location.href = path;
    } else {
      if (url.indexOf('bdwm://') !== 0) {
        url = 'bdwm://native?pageName=webview&url=' + encodeURIComponent(url);
      }
      if (Object.prototype.toString.call(pageData) === '[object Object]') {
        url += '&pageData=' + encodeURIComponent((0, _stringify2.default)(pageData));
      }
      window.location.href = url;
    }
  },
  close: function close(data) {
    return ready().then(window.WMApp.page.closePage);
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
        if (d.sv >= '4.0.1') {
          pageShowCallback.push(callback);
          window.WMApp.kernel && window.WMApp.kernel.addListener('onPageResume', function () {
            pageShowCallback.forEach(function (v) {
              return v();
            });
          });
        } else {
          (function loop() {
            callback();
            setTimeout(loop, 600);
          })();
        }
      });
    }
  }
};

var page = {
  close: function close() {
    return ready().then(window.WMApp.page.closePage);
  },
  open: function open(url, onBack) {
    if (url.indexOf('bdwm://') !== 0) {
      var header = 1;
      url = 'bdwm://native?pageName=webview&url=' + encodeURIComponent(url) + '&header=' + header;
    }
    window.location.href = url;
  },
  onBack: function onBack(onBackHandler) {
    return ready().then(function () {
      window.WMApp.entry.setPageAction('onBack', onBackHandler);
      setTimeout(function () {}, 0);
    });
  },
  setPageId: function setPageId(id) {
    return 0;
  },
  home: function home() {
    window.location.href = 'bdwm://native?pageName=home';
  },
  search: function search(taste) {
    webview.open('bdwm://native?pageName=search&id=' + taste);
  },
  index: function index() {
    webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=index&scrollViewBounces=0');
  },
  cart: function cart() {
    webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=cart&scrollViewBounces=0');
  },
  shop: function shop(_ref) {
    var shopId = _ref.shopId,
        _ref$itemId = _ref.itemId,
        itemId = _ref$itemId === undefined ? '' : _ref$itemId,
        _ref$addToCart = _ref.addToCart,
        addToCart = _ref$addToCart === undefined ? 0 : _ref$addToCart,
        _ref$isStore = _ref.isStore,
        isStore = _ref$isStore === undefined ? 1 : _ref$isStore,
        _ref$activityId = _ref.activityId,
        activityId = _ref$activityId === undefined ? '' : _ref$activityId;

    return ready().then(function () {
      if (!shopId) {
        setTimeout(function () {}, 0);
        return _promise2.default.reject(new Error('shopId不能为空'));
      }
      if (isStore) {
        webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=shop&scrollViewBounces=0', {
          shopId: shopId,
          itemId: itemId,
          addToCart: addToCart,
          isStore: isStore,
          activityId: activityId
        });
      } else {
        var params = {
          pageName: 'shopMenu',
          pageParams: {
            shopId: shopId
          }
        };
        itemId && (params.pageParams.dishId = itemId);
        window.WMApp.page.changePage(params);
      }
      setTimeout(function () {}, 0);
    });
  },
  shopSearch: function shopSearch(shopId) {
    webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=search&scrollViewBounces=0', {
      shopId: shopId
    });
  },
  item: function item(shopId, itemId) {
    var addToCart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=item&scrollViewBounces=0', {
      shopId: shopId,
      itemId: itemId,
      addToCart: addToCart
    });
  },
  shopDetail: function shopDetail(shopId) {
    ready().then(function () {
      window.WMApp.page.changePage({
        pageName: 'shopDetail',
        pageParams: {
          shopId: shopId
        }
      });
      setTimeout(function () {}, 0);
    });
  },
  shopComment: function shopComment(shopId) {
    window.WMApp.page.changePage({
      pageName: 'shopComment',
      pageParams: {
        shopId: shopId
      }
    });
    setTimeout(function () {}, 0);
  },
  setTitleBar: function setTitleBar(barConfig) {
    return ready().then(function () {
      var titleBarParam = {
        titleText: barConfig.title === undefined ? document.title : barConfig.title,
        titleClickAble: barConfig.onTitleClick ? 1 : 0
      };
      var actionCallbacks = {};
      var last = void 0;
      if (barConfig.actionList && barConfig.actionList.length) {
        last = barConfig.actionList.length - 1;
        titleBarParam.actionText = barConfig.actionList[last].title;
        titleBarParam.actionClickAble = barConfig.actionList[last].onClick ? 1 : 0;

        titleBarParam.actionList = barConfig.actionList.map(function (v) {
          if (v.onClick) {
            actionCallbacks[v.id] = v.onClick;
          }
          return {
            title: v.title,
            titleColor: v.titleColor,
            icon: v.icon,
            id: v.id
          };
        });
      }
      window.WMApp.page.setTitleBar(titleBarParam);
      if (barConfig.onTitleClick) {
        window.WMApp.entry.setPageAction('onTitleClick', barConfig.onTitleClick);
      }

      window.WMApp.entry.setPageAction('onActionClick', function (data) {
        if (data && data.result) {
          if (Object.prototype.toString.call(data.result.id) === '[object String]') {
            actionCallbacks[data.result.id] && actionCallbacks[data.result.id]();
          }
        } else if (barConfig.actionList && barConfig.actionList[last] && barConfig.actionList[last].onClick) {
          barConfig.actionList[last].onClick();
        }
      });
      setTimeout(function () {}, 0);
    });
  },
  confirmOrder: function confirmOrder(shopId, products) {
    return ready().then(account.getInfo).catch(account.login).then(function () {
      window.WMApp.page.changePage({
        pageName: 'confirmOrder',
        pageParams: {
          shopId: shopId,
          products: encodeURIComponent(products)
        }
      });
      setTimeout(function () {}, 0);
    });
  },
  pushRefresh: function pushRefresh(callback) {},
  closePushRefresh: function closePushRefresh() {}
};

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