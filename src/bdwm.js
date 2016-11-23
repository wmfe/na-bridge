// ready.then().catch()
let isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
import objectAssign from 'object-assign';
import 'es6-promise/auto';

let pageData = (function () {
    let search = window.location.search.replace(/^\?/, '');
    let params = {};
    if (search) {
        search.split('&').forEach(v => {
            let param = v.split('=');
            params[param[0]] = param[1] || '';
        });
    }
    if (params.pageData) {
        // params.pageData = params.pageData.replace(/%22/g, '"');
        params.pageData = decodeURIComponent(params.pageData);
        let innerP;
        try {
            innerP = JSON.parse(params.pageData);
        }
        catch (e) {
            innerP = {};
        }
        objectAssign(params, innerP);
    }
    return params;
})();

function ready() {
    return new Promise(function (resolve, reject) {
        setTimeout(reject, 10000, 'WMAppReady timeout');
        if (window.WMApp && window.WMAppReady) {
            resolve(pageData);
            setTimeout(function () { }, 0);
        }
        else {
            let WMAppReady = function (data) {
                if (data.pageData) {
                    objectAssign(pageData, data.pageData);
                }
                document.removeEventListener('WMAppReady', WMAppReady);
                resolve(pageData);
                setTimeout(function () { }, 0);
            };
            document.addEventListener('WMAppReady', WMAppReady);
        }
    });
}

function device() {
    return ready()
        .then(function () {
            let deviceInfo = window.WMApp.device.getDevice();
            setTimeout(function () { }, 0);
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
    return ready()
        .then(function () {
            let loc = window.WMApp.location.getSyncLocation();
            setTimeout(function () { }, 0);
            if (loc.lng && loc.lat) {
                return loc;
            }
            return new Promise(function (resolve, reject) {
                window.WMApp.location.getAsyncLocation(function (locAsync) {
                    resolve(locAsync);
                });
            });
        });
}

function network() {
    return ready()
        .then(function () {
            return new Promise(function (resolve, reject) {
                window.WMApp.network.getNetwork(function (data) {
                    // result里面有wifi、mobile、unreachable三种返回值
                    // mobile表示移动网络，unreachable表法当前网络不可用
                    if (data.status) {
                        resolve({
                            net_type: data.result.network
                        });
                    }
                });
                setTimeout(function () { }, 0);
            });
        })
        .catch(function () {
            setTimeout(function () { }, 0);
            return {
                net_type: 'unreachable'
            };
        });
}

// let online = 'http://waimai.baidu.com';
// let fgz = 'http://cp01-fgz.epc.baidu.com:8086';
let online = 'http://waimai.baidu.com';
// let online = 'http://cp01-fuguozheng.epc.baidu.com:8086';

let boundary = '-WaimaiAjaxBoundary-';
let http = {
    get: (url, data) => ready()
        .then(function () {
            let params = {
                url: online + url,
                data: data
            };
            return new Promise(function (resolve, reject) {
                window.WMApp.network.getRequest(params, function (data) {
                    if (data.status && data.result && parseInt(data.result.statusCode, 10) === 200) {
                        let r = data.result.responseBody;
                        if (r.indexOf(boundary) === 0) {
                            r = r.split(boundary)[1];
                        }
                        let response;
                        try {
                            response = JSON.parse(r);
                        }
                        catch (e) {
                            response = r;
                        }
                        console.info(response);
                        resolve(response);
                        setTimeout(function () { }, 0);
                    }
                    else {
                        let info = '数据传输失败，请重试';
                        console.info(info);
                        reject(info);
                    }
                });
            });
        }),
    post: (url, data) => ready()
        .then(function () {
            return new Promise(function (resolve, reject) {
                resolve('post');
                setTimeout(function () { }, 0);
            });
        })
};

let account = {
    login: () => ready().then(function () {
        return new Promise((resolve, reject) => {
            window.WMApp.account.login(function (data) {
                if (data.status) { // 1表示成功，0表示登录取消，登录失败NA会处理
                    resolve('登录成功');
                }
                else {
                    reject('登录取消');
                }
                setTimeout(function () { }, 0);
            });
        });
    }),
    getInfo: () => ready().then(function () {
        return new Promise((resolve, reject) => {
            window.WMApp.account.getUserInfo(function (data) {
                let r = data.result || {};
                setTimeout(function () { }, 0);
                if (!data.status) {
                    return reject(r.errorInfo);
                }
                resolve(r.userInfo);
            });
        });
    })
};

let ui = {
    startLoading() {
        return ready().then(function () {
            window.WMApp.nui.loading({
                show: 1
            });
            setTimeout(function () { }, 0);
        });
    },
    endLoading() {
        return ready().then(function () {
            window.WMApp.nui.loading({
                show: 0
            });
            setTimeout(function () { }, 0);
        });
    },
    /**
     * ui.confirm(title, content)
     * .then(function(){
     * // 确认操作
     * }).catch(function(){
     * // 取消操作
     * })
     */
    confirm(title, content) {
        return ready().then(function () {
            return new Promise(function (resolve, reject) {
                let params = {
                    title: title,
                    content: content,
                    cancelBtnText: '取消',
                    confirmBtnText: '确认'
                };
                window.WMApp.nui.dialog(params, function (data) {
                    if (data.status) {
                        resolve();
                    }
                    else {
                        reject();
                    }
                });
                setTimeout(function () { }, 0);
            });
        });
    },
    toast(text, duration = 'short') {
        return ready().then(function () {
            window.WMApp.nui.toast({
                text: text,
                duration: duration // short或long，short是2秒，long是3.5秒
            });
            setTimeout(function () { }, 0);
        });
    }
};

function share(params) {
    /**
     * params demo
     * {
     *     imageUrl: '',    // 图片
     *     title: '',       // 分享标题
     *     description: '', // 分享描述
     *     linkUrl: ''      // 链接, 如果为空则是大图分享，否则链接分享
     * }
     * @return {[promise]}
     */
    return ready().then(function () {
        // 0表示链接分享, 1表示大图分享
        let shareType = params.linkUrl ? 0 : 1;
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
        setTimeout(function () { }, 0);
    });
}

let shop = {
    addFavorite(shopId, f) {
        return http
            .get('/h5ui/favoriteadd', {shop_id: shopId, from: f})
            .catch(function (e) {
                setTimeout(function () { }, 0);
                return Promise.reject('加载失败，请重试');
            })
            .then(res => new Promise((resolve, reject) => {
                if (res.error_no === 0) {
                    resolve('收藏成功');
                    // ui.toast('收藏成功 error_no === 0')
                }
                else if (res.error_no === 102) {
                    // ui.toast('收藏成功 error_no === 102')
                    account.login();
                    reject('');
                }
                else {
                    reject('加载失败，请重试');
                }
                setTimeout(function () { }, 0);
            }));
    },
    delFavorite(shopId, f) {
        return http
            .get('/h5ui/favoritedel', {shop_id: shopId, from: f})
            .catch(function (e) {
                setTimeout(function () { }, 0);
                return Promise.reject('加载失败，请重试');
            })
            .then(res => new Promise(function (resolve, reject) {
                if (res.error_no === 0) {
                    resolve('取消收藏成功');
                }
                else {
                    reject('取消收藏失败');
                }
                setTimeout(function () { }, 0);
            }));
    }
};

const webview = {
    startLoading() {
        document.getElementById('loading').style.display = '';
    },
    endLoading() {
        document.getElementById('loading').style.display = 'none';
    },
    open(url, pageData) {
        if (process.env.NODE_ENV !== 'production') {
            let urlData = (function () {
                let search = url.replace(/^[^?]*\?/, '');
                let params = {};
                if (search) {
                    search.split('&').forEach(v => {
                        let param = v.split('=');
                        params[param[0]] = param[1] || '';
                    });
                }
                return params;
            })();
            let path = urlData.pageName ? urlData.pageName + '.html?' : 'index.html?';
            let data = objectAssign({}, JSON.parse(decodeURIComponent(urlData.pageData || 0)), pageData);
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    path += key + '=' + data[key] + '&';
                }
            }
            path = path.slice(0, -1);
            window.location.href = path;
        }
        else {
            if (Object.prototype.toString.call(pageData) === '[object Object]') {
                url += '&pageData=' + encodeURIComponent(JSON.stringify(pageData));
            }
            window.location.href = url;
        }
    },
    close(data) {
        return ready().then(window.WMApp.page.closePage);
    },
    pageshow(callback) {
        // callback 需要触发多次所以不能用 promise 了
        if (typeof callback !== 'function') {
            return;
        }
        if (isIOS) {
            document.addEventListener('visibilitychange', function () {
                if (!document.hidden) {
                    callback();
                }
            });
        }
        else {
            // android
            device().then(function (d) {
                if (d.sv >= '4.0.1') {
                    // 4.0.1+ 支持
                    window.WMApp && window.WMApp.kernel && window.WMApp.kernel.addListener('onPageResume', callback);
                    setTimeout(function () { }, 0);
                }
                else {
                    // 只能轮询了,shit
                    (function loop() {
                        callback();
                        setTimeout(loop, 600);
                    })();
                }
            });
        }
    }
};

// let titleBarConfig = {}
let page = {
    close() {
        return ready().then(window.WMApp.page.closePage);
    },
    // 打开url或者协议
    open(url, onBack) {
        if (url.indexOf('bdwm://') !== 0) {
            // header=1 是白色头部，注意兼容
            let header = 1;
            url = 'bdwm://native?pageName=webview&url=' + encodeURIComponent(url) + '&header=' + header;
        }
        window.location.href = url;
        // ready().then(function () {
        //     window.WMApp.page.changePageForResult({ openUrl: url }, function (data) {
        //         ui.toast('back');
        //         onBack && onBack(data)
        //     });
        // })
    },
    onBack(onBackHandler) {
        return ready().then(function () {
            window.WMApp.entry.setPageAction('onBack', onBackHandler);
            setTimeout(function () { }, 0);
        });
    },
    home() {
        console.info('navigate to home');
        window.location.href = 'bdwm://native?pageName=home';
    },
    search() {
        webview.open('bdwm://native?pageName=search&id=10');
    },
    index() {
        webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=index&scrollViewBounces=0');
    },
    cart() {
        webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=cart&scrollViewBounces=0');
    },
    shop({shopId, itemId = '', addToCart = 0, isStore = 1}) {
        return ready().then(function () {
            if (!shopId) {
                setTimeout(function () { }, 0);
                return Promise.reject('shopId不能为空');
            }
            if (isStore) {
                webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=shop&scrollViewBounces=0', {
                    shopId,
                    itemId,
                    addToCart,
                    isStore
                });
            }
            else {
                let params = {
                    pageName: 'shopMenu',
                    pageParams: {
                        shopId: shopId
                    }
                };
                itemId && (params.pageParams.dishId = itemId);
                window.WMApp.page.changePage(params);
            }
            setTimeout(function () { }, 0);
        });
    },
    shopSearch(shopId) {
        webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=search&scrollViewBounces=0', {
            shopId
        });
    },
    item(shopId, itemId, addToCart = 0) {
        webview.open('bdwm://plugin?pluginId=bdwm.plugin.supermarket&pageName=item&scrollViewBounces=0', {
            shopId,
            itemId,
            addToCart
        });
    },
    shopDetail(shopId) {
        ready().then(function () {
            window.WMApp.page.changePage({
                pageName: 'shopDetail',
                pageParams: {
                    shopId: shopId
                }
            });
            setTimeout(function () { }, 0);
        });
    },
    shopComment(shopId) {
        window.WMApp.page.changePage({
            pageName: 'shopComment',
            pageParams: {
                shopId: shopId
            }
        });
        setTimeout(function () { }, 0);
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
            let titleBarParam = {
                titleText: barConfig.title === undefined ? document.title : barConfig.title,
                titleClickAble: barConfig.onTitleClick ? 1 : 0
            };
            let actionCallbacks = {};
            let last;
            if (barConfig.actionList && barConfig.actionList.length) {
                // 兼容老版本
                last = barConfig.actionList.length - 1;
                titleBarParam.actionText = barConfig.actionList[last].title;
                titleBarParam.actionClickAble = barConfig.actionList[last].onClick ? 1 : 0;
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
                }
                else if (barConfig.actionList && barConfig.actionList[last] && barConfig.actionList[last].onClick) {
                    // 兼容老版本
                    barConfig.actionList[last].onClick();
                }
            });
            setTimeout(function () { }, 0);
        });
    },
    confirmOrder(shopId, products) {
        return ready()
            .then(account.getInfo)
            .catch(account.login)
            .then(() => {
                // 已经登录
                window.WMApp.page.changePage({
                    pageName: 'confirmOrder',
                    pageParams: {
                        shopId: shopId,
                        products: encodeURIComponent(products)
                    }
                });
                setTimeout(function () { }, 0);
            });
    },
    pushRefresh(callback) {
        // ios 有bug
        return;
        // if (!callback) {
        //     ui.toast('no callback')
        //     return;
        // }
        // // callback 返回一
        // // 个 promise
        // ready().then(function () {
        //     window.WMApp.page.openPageRefresh();
        //     ui.toast('openPageRefresh bind');
        //     window.WMApp.entry.setPageAction('onPageRefresh', function () {
        //         ui.toast('onPageRefresh');
        //         callback()
        //             .then(function () {
        //                 window.WMApp.page.hidePageRefresh();
        //             })
        //             .catch(function () {
        //                 window.WMApp.page.hidePageRefresh();
        //             })
        //     });
        // })
    },
    closePushRefresh() {
        return;
        // ready().then(function () {
        //     window.WMApp.page.closePageRefresh();
        //     // ui.toast('closed')
        // })
    }
};

export {ready, device, location, http, page, ui, network, share, shop, account, webview};
