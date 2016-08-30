// import assign from 'object-assign';

// ready.then().catch()
function ready() {
    var pageData = {};
    return new Promise(function (resolve, reject) {
        setTimeout(reject, 10000, 'WMAppReady timeout')
        if (window.WMApp) {
            resolve({ pageData });
        } else {
            var WMAppReady = function (data) {
                if (data.pageData) {
                    pageData = data.pageData
                }
                document.removeEventListener('WMAppReady', WMAppReady)
                resolve({ pageData });
            };
            document.addEventListener('WMAppReady', WMAppReady);
        }
    })
}

// ready.then(device=>{console.log(device)})
function device() {
    return ready()
        .then(function () {
            var deviceInfo = WMApp.device.getDevice();
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
            }
        })
}

function location() {
    return ready()
        .then(function () {
            var loc = WMApp.location.getSyncLocation();
            return {
                locLng: loc.locLng,
                locLat: loc.locLat,
                lng: loc.lng,
                lat: loc.lat,
                cityId: loc.cityId,
                address: loc.address,
                addressId: loc.addressId
            }
        })
}

// var online = 'http://waimai.baidu.com';
// var fgz = 'http://cp01-fgz.epc.baidu.com:8086';
var online = 'http://waimai.baidu.com';
// var lc = 'http://cq01-newdev.epc.baidu.com:8086';

var http = {
    get: (url, data) => ready()
        .then(function () {
            return new Promise(function (resolve, reject) {
                var params = {
                    url: online + url,
                    data: data
                };
                WMApp.network.getRequest(params, function (data) {
                    if (data.status && data.result && parseInt(data.result.statusCode, 10) === 200) {
                        var result
                        try {
                            result = JSON.parse(data.result.responseBody)
                        } catch (e) {
                            result = data.result.responseBody
                        }
                        resolve(result);
                    } else {
                        reject('request failed')
                    }
                });
            })
        }),
    post: (url, data) => ready()
        .then(function () {
            return new Promise(function (resolve, reject) {
                resolve('post')
            })
        })

};

// var titleBarConfig = {}

var page = {
    close() {
        return ready().then(WMApp.page.closePage)
    },
    // 打开url或者协议
    open(url, option) {
        if (url.indexOf('bdwm://') !== 0) {
            // header=1 是白色头部，注意兼容
            var header = option.header || 1;
            url = 'bdwm://native?pageName=webview&url=' + encodeURIComponent(url) + '&header=' + header
        }
        window.location.href = url;
    },
    onBack(onBackHandler) {
        return ready().then(function () {
            WMApp.entry.setPageAction('onBack', onBackHandler);
        })
    },
    shop({ shopId, itemId, addToCart = 0, isStore = 1 }) {
        return ready().then(function () {
            if (!shopId) {
                return Promise.reject('shopId不能为空')
            }
            var params;
            if (isStore) {
                params = {
                    pageName: 'superMarket',
                    pageParams: {
                        shopId: shopId
                    }
                };
                itemId && (params.pageParams.itemId = itemId);
                itemId && addToCart && (params.pageParams.addToCart = 1);
            } else {
                params = {
                    pageName: 'shopMenu',
                    pageParams: {
                        shopId: shopId
                    }
                };
                itemId && (params.pageParams.dishId = itemId);
            }
            WMApp.page.changePage(params);
            return Promise.resolve();
        })
    },
    setTitleBar(barConfig) {
        /**
         * barConfig demo
         * {
         *     title: '超市购',
         *     onTitleClick: ()=>0, //点击标题的回调，没有回调传false
         *     actionList: [{
                    title: '搜索',
                    titleColor: '#ffffff',
                    icon: 'http://img.waimai.baidu.com/pb/09e4d72a1253d0934f568cb6cad5074acb',
                    id: 'search',
                    onClick: ()=>0 //点击 action 的回调，没有回调传false
                }]
         * }
         * @param  titleText
         * @return {[type]}   [description]
         */
        return ready().then(function () {
            var titleBarParam = {
                titleText: barConfig.title === undefined ? document.title : barConfig.title,
                titleClickAble: barConfig.onTitleClick ? 1 : 0
            };
            var actionCallbacks = {};
            if (barConfig.actionList && barConfig.actionList.length) {
                // 兼容老版本
                titleBarParam.actionText = barConfig.actionList[0].title
                titleBarParam.actionClickAble = barConfig.actionList[0].onClick ? 1 : 0;
                // 新版本
                titleBarParam.actionList = barConfig.actionList.map(v => {
                    if (v.onClick) {
                        actionCallbacks[v.id] = v.onClick;
                    }
                    return {
                        title: v.title,
                        titleColor: v.titleColor,
                        icon: v.icon,
                        id: v.id
                    }
                })
            }
            WMApp.page.setTitleBar(titleBarParam);
            if (barConfig.onTitleClick) {
                WMApp.entry.setPageAction('onTitleClick', barConfig.onTitleClick);
            }

            WMApp.entry.setPageAction('onActionClick', function (data) {
                if (data && data.result) {
                    if (Object.prototype.toString.call(data.result.id) === '[object String]') {
                        actionCallbacks[data.result.id] && actionCallbacks[data.result.id]();
                    }
                } else if (barConfig.actionList && barConfig.actionList[0] && barConfig.actionList[0].onClick) {
                    // 兼容老版本
                    barConfig.actionList[0].onClick()
                }
            });
        })
    }
};

var ui = {
    startLoading() {
        return ready().then(function () {
            WMApp.nui.loading({
                show: 1
            });
        })
    },
    endLoading() {
        return ready().then(function () {
            WMApp.nui.loading({
                show: 0
            });
        })
    }
};

export { ready, device, location, http, page, ui }
