import objectAssign from 'object-assign';
import 'es6-promise/auto';
import coord from './coordService';
let isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
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

// ready.then().catch()
function ready() {
    // console.log('ready');
    return new Promise(function (resolve, reject) {
        setTimeout(reject, 10000, 'BNJSReady timeout');
        document.addEventListener('BNJSReady', function () {
            window.BNJS.page.enableBounce(false);
            resolve(pageData);
        }, false);
        if (window.BNJS && typeof window.BNJS === 'object' && window.BNJS._isAllReady) {
            window.BNJS.page.enableBounce(false);
            resolve(pageData);
        }
    });
}

// ready.then(device=>{console.info(device)})
function device() {
    // 已经测试
    return ready()
        .then(function () {
            return {
                client: 'bainuo',
                // 设备唯一标识（百度cuid）
                cuid: window.BNJS.env.cuid,
                // 组件运行APP版本(组件在百糯运行获取百糯版本/在手百运行获取手百的APP版本etc)
                sv: window.BNJS.env.appVersion,
                // SDK使用方标识，APP包名，组件方用于区分渠道，默认值：com.nuomi
                channel: window.BNJS.env.packageName,
                // 屏幕的宽 * 高
                screen: window.BNJS.device.screenWidth + '*' + window.BNJS.device.screenHeight,
                // 设备系统平台(Android/ios)
                from: 'bn-' + String(window.BNJS.device.platform).toLowerCase(),
                // 设备系统版本
                os: window.BNJS.device.os,
                // 设备型号名称
                model: window.BNJS.device.name,
                // 支付平台?
                payPlats: '',
                //
                refer: ''
            };
        });
}

/**
 * 写的匆忙，未对回调参数类型测试
 * @return {[type]} [description]
 */
function network() {
    return ready().then(function () {
        return new Promise(function (resolve, reject) {
            window.BNJS.env.network(function (data) {
                let type = 'mobile';
                if (data.network === 'wifi') {
                    type = 'wifi';
                }
                else if (data.network === 'non') {
                    type = 'unreachable';
                }
                resolve({
                    net_type: type
                });
            });
            setTimeout(reject, 10000);
        });
    })
    .catch(function () {
        return {
            net_type: 'unreachable'
        };
    });
};

// let online = 'http://waimai.baidu.com';
// let fgz = 'http://cp01-fgz.epc.baidu.com:8086';
// let online = 'http://cp01-fuguozheng.epc.baidu.com:8086';
let online = 'http://waimai.baidu.com';
// let lc = 'http://cq01-newdev.epc.baidu.com:8086';

let http = {
    get: (url, data) => ready()
        .then(function () {
            // 此分支已经测试
            return new Promise(function (resolve, reject) {
                if (data.address) {
                    data.address = decodeURIComponent(data.address);
                }
                window.BNJS.http.get({
                    url: online + url,
                    params: data,
                    // success返回的数据格式
                    // {error_code: 0, reason: "successed", result: obj}
                    onSuccess: resolve,
                    onFail: reject
                });
            });
        }),
    post: (url, data) => ready()
        .then(function () {
            // 待测试
            return new Promise(function (resolve, reject) {
                if (data.address) {
                    data.address = decodeURIComponent(data.address);
                }
                window.BNJS.http.post({
                    url: online + url,
                    params: data,
                    // success返回的数据格式
                    // {error_code: 0, reason: "successed", result: obj}
                    onSuccess: resolve,
                    onFail: reject
                });
            });
        })
};

// 涉及耗时ajax请求，加cache
let locationCache;
function location() {
    if (locationCache) {
        return locationCache;
    }
    locationCache = ready()
        .then(() => {
            if (window.BNJS.location.hasLocation) {
                // 该分支已经测试
                // 有定位数据
                // 通过经纬度拿墨卡托坐标
                let conver = coord.convertLL2MC([window.BNJS.location.longitude, window.BNJS.location.latitude]);
                let lat = conver[1];
                let lng = conver[0];
                return {
                    // 定位经度
                    locLng: lng,
                    // 定位纬度
                    locLat: lat,
                    // 召回经度
                    lng: lng,
                    // 召回纬度
                    lat: lat,
                    // 定位城市code
                    cityCode: window.BNJS.location.cityCode,
                    cityId: 0,
                    // 定位地址
                    address: window.BNJS.location.address,
                    // 地址ID
                    addressId: ''
                };
            }
            // 没有定位数据 调用获取实时定位接口获取经纬度数据
            return new Promise(function (resolve, reject) {
                // 待测试
                window.BNJS.location.requestRealTimeLocation(function (res) {
                    window.BNJS.location.getLocation();
                    let latitude = res.data.latitude;
                    let longitude = res.data.longitude;
                    if (latitude && longitude) {
                        // 通过经纬度拿墨卡托坐标
                        let conver = coord.convertLL2MC([longitude, latitude]);
                        let lat = conver[1];
                        let lng = conver[0];
                        resolve({
                            locLng: lng,
                            locLat: lat,
                            lng: lng,
                            lat: lat,
                            cityCode: res.data.cityCode,
                            cityId: 0,
                            address: res.data.address,
                            addressId: ''
                        });
                    }
                    else {
                        reject('定位失败');
                    }
                });
            });
        })
        .then(location => {
            return http
                .get('/mobile/waimai', {
                    qt: 'convertcitycode',
                    source: 'BNCode',
                    display: 'json',
                    sourceCode: location.cityCode
                })
                .then(res => {
                    if (res.error_no === 0) {
                        location.cityId = res.result.cityCode;
                    }
                    return location;
                });
        });
    return locationCache;
}

let ui = {
    startLoading() {
        return ready().then(function () {
            // 显示加载中页面 已经测试
            window.BNJS.ui.dialog.showLoadingPage();
        });
    },
    endLoading() {
        return ready().then(function () {
            // 关闭加载中页面 已经测试
            window.BNJS.ui.dialog.hideLoadingPage();
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
    toast(text, duration = 'short') {
        let length = duration === 'short' ? 0 : 1;
        return ready().then(function () {
            window.BNJS.ui.toast.show(text, length);
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
        // 1表示链接分享, 2表示大图分享
        let shareType = params.linkUrl ? 1 : 2;
        window.BNJS.ui.share({
            type: shareType,
            title: params.title,
            content: params.description,
            imgUrl: params.imageUrl,
            imageList: [params.imageUrl],
            url: params.linkUrl,
            platforms: ['weixin_session', 'weixin_timeline']
        });
        setTimeout(function () { }, 0);
    });
}

let account = {
    login: () => ready().then(function () {
        return new Promise((resolve, reject) => {
            window.BNJS.account.login({
                type: '0',
                onSuccess: function (data) {
                    resolve('登录成功');
                    setTimeout(function () { }, 0);
                },
                onFail: function (data) {
                    reject(data.errmsg || '登录取消');
                    setTimeout(function () { }, 0);
                }
            });
        });
    }),
    getInfo: () => ready().then(function () {
        return {
            uid: window.BNJS.account.uid,
            username: window.BNJS.account.uName,
            displayname: window.BNJS.account.displayName,
            bduss: window.BNJS.account.bduss
        };
    })
};

let shop = {
    /**
     * shopId: 商户id,
     * f: device 里的from
     */
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
    close() {
        // 返回上一页，之前页面会被销毁 已经测试
        return ready().then(window.BNJS.page.back);
    },
    open(url, option) {
        // option {params: obj, action: 0新页面打开 | 1当前页面打开, direction: rtl：从右往左 | btt从下往上}
        // 已测试 'bainuo://component?compid=waimai&comppage=shopsearch'
        return ready()
            .then(function () {
                // 这里只encode参数部分, 使用encodeURI接口 待测试
                let finalUrl = 'bainuo://component?url=' + encodeURI(url);
                window.BNJS.page.start(finalUrl, undefined, 0);
            });
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
                // 只能轮询了,shit
                (function loop() {
                    callback();
                    setTimeout(loop, 600);
                })();
            });
        }
    }
};

let page = {
    close() {
        // 返回上一页，之前页面会被销毁 已经测试
        return ready().then(window.BNJS.page.back);
    },
    open(url, option) {
        // option {params: obj, action: 0新页面打开 | 1当前页面打开, direction: rtl：从右往左 | btt从下往上}
        // 已测试 'bainuo://component?compid=waimai&comppage=shopsearch'
        return ready()
            .then(function () {
                let finalUrl = '';
                if (url.indexOf('bainuo://') === 0) {
                    finalUrl = url;
                }
                else {
                    // 这里只encode参数部分, 使用encodeURI接口 待测试
                    finalUrl = 'bainuo://component?url=' + encodeURI(url);
                }
                if (url === 'bdwm://native?pageName=search') {
                    finalUrl = 'bainuo://component?compid=waimai&comppage=shopsearch';
                }
                // 默认从新页面打开
                window.BNJS.page.start(finalUrl, undefined, 0);
            });
    },
    onBack(onBackHandler) {
        return ready().then(function () {
            // bdwm 接口逻辑
            // 回退事件，返回1表示关闭，返回0表示不关闭，返回2表示使用浏览器的历史返回（v3.8.1+支持） 默认返回1，客户端直接关闭
            // 已经测试
            window.BNJS.page.onBtnBackClick({
                callback: function () {
                    let cbResult = onBackHandler();
                    if (cbResult === 0) {
                        // do nothing
                    }
                    else if (cbResult === 1) {
                        window.BNJS.page.back();
                    }
                    else if (cbResult === 2) {
                        // 返回上一页 待测试
                        window.history.go(-1);
                    }
                    else {
                        // 默认行为是客户端直接关闭
                        window.BNJS.page.back();
                    }
                }
            });
        });
    },
    home() {
        window.BNJS.page.start('bainuo://component?compid=waimai&comppage=shoplist', undefined, 0);
    },
    search() {
        window.BNJS.page.start('bainuo://component?compid=waimai&comppage=shopsearch', undefined, 0);
    },
    index() {
        let cid = pageData.cid || '';
        let url = `http://waimai.baidu.com/static/supermarket/index.html?cid=${cid}`;
        url = 'bainuo://component?url=' + encodeURIComponent(url);
        window.BNJS.page.start(url, undefined, 0);
        setTimeout(function () {}, 0);
        return Promise.resolve();
    },
    cart() {
        let cid = pageData.cid || '';
        let url = `http://waimai.baidu.com/static/supermarket/cart.html?cid=${cid}`;
        url = 'bainuo://component?url=' + encodeURIComponent(url);
        window.BNJS.page.start(url, undefined, 0);
        setTimeout(function () {}, 0);
        return Promise.resolve();
    },
    shop({shopId, itemId = '', addToCart = 0, isStore = 1}) {
        // 糯米打开商户链接
        // 待测试
        return ready().then(function () {
            // 商超页面和菜品页面都是使用下面的参数 不做区分
            if (!shopId) {
                return Promise.reject('shopId不能为空');
            }
            let cid = pageData.cid || '';
            let url;
            if (isStore) {
                url = `http://waimai.baidu.com/static/supermarket/shop.html?shopId=${shopId}&itemId=${itemId}&addToCart=${addToCart}&cid=${cid}`;
                url = 'bainuo://component?url=' + encodeURIComponent(url);
            }
            else {
                url = 'bainuo://component?compid=waimai&comppage=shopinfo&shop_id=' + shopId + '&android_cid=' + cid + '&ios_cid=' + cid;
                if (itemId) {
                    url += '&dish_id=' + itemId;
                    if (addToCart) {
                        url += '&wm_action=put';
                    }
                }
            }
            // 默认从当前页面打开
            window.BNJS.page.start(url, undefined, 0);
            setTimeout(function () {}, 0);
            return Promise.resolve();
        });
    },
    shopSearch(shopId) {
        let cid = pageData.cid || '';
        let url = `http://waimai.baidu.com/static/supermarket/search.html?shopId=${shopId}&cid=${cid}`;
        url = 'bainuo://component?url=' + encodeURIComponent(url);
        window.BNJS.page.start(url, undefined, 0);
        setTimeout(function () {}, 0);
        return Promise.resolve();
    },
    item(shopId, itemId, addToCart = 0) {
        let cid = pageData.cid || '';
        let url = `http://waimai.baidu.com/static/supermarket/item.html?shopId=${shopId}&itemId=${itemId}&addToCart=${addToCart}&cid=${cid}`;
        url = 'bainuo://component?url=' + encodeURIComponent(url);
        window.BNJS.page.start(url, undefined, 0);
        setTimeout(function () {}, 0);
        return Promise.resolve();
    },
    shopDetail(shopId) {
        // do nothing
        console.warn('糯米里没有单独的商户详情页面');
        return Promise.reject('方法未实现');
    },
    shopComment(shopid) {
        console.warn('糯米里没有单独的商户评价页面');
        return Promise.reject('方法未实现');
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
                    id: 'search', // search,close,collection,location,scan,share,collected,arrowdown_red,more,camera,delete 其中之一
                    onClick: ()=>0 //点击 action 的回调，没有回调传false
                }]
         * }
         * @param  titleText
         * @return {[type]}   [description]
         */
        return ready().then(function () {
            let titleText = barConfig.title === undefined ? document.title : barConfig.title;
            let iconArr = [
                'search', 'close', 'collection',
                'location', 'scan', 'share', 'collected',
                'arrowdown_red', 'more', 'camera', 'delete'
            ];
            // 直接设置titlebar
            window.BNJS.ui.title.setTitle(titleText);
            if (barConfig.onTitleClick) {
                // 设置可以点击的titlebar 待测试
                window.BNJS.ui.title.setClickableTitle(titleText, barConfig.onTitleClick);
            }
            if (barConfig.actionList && barConfig.actionList.length && barConfig.actionList.length > 0) {
                // 调用addActionButton接口
                // 该分支没有设置onClick的情况已经测试
                barConfig.actionList.forEach((value, index) => {
                    // 设置titleBar
                    window.BNJS.ui.title.addActionButton({
                        // TODO style(是否同时显示图文) 暂时没有给出配置
                        // id 不重复 作为tag传递
                        tag: index + 1, // tag只能是数字
                        text: value.title,
                        callback: value.onClick || function () {},
                        // 注意这里不是http url需要根据糯米文档进行配置, 如果值在白名单里就取id的值
                        icon: iconArr.indexOf(value.id) === -1 ? null : value.id
                    });
                });
            }
        });
    },
    confirmOrder(shopId, products) {
        return ready()
            .then(account.getInfo)
            .catch(account.login)
            .then(() => {
                // 已经登录
                let scheme = 'bainuo://component?compid=waimai&comppage=orderconfirm';
                scheme += '?source_from=_supermarket_';
                scheme += '&shopId=' + shopId;
                scheme += '&dishItems=' + encodeURIComponent(products);
                window.BNJS.page.start(scheme, undefined, 0);
                setTimeout(function () { }, 0);
            });
    },
    closePushRefresh() {
        return;
        // ready().then(function () {
        //     WMApp.page.closePageRefresh();
        //     // ui.toast('closed')
        // })
    }
};

export {ready, device, location, http, page, ui, network, share, shop, account, webview};
