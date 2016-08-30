// import assign from 'object-assign';
import coord from './coordService';

// ready.then().catch()
function ready() {
    // 已经测试
    return new Promise(function (resolve, reject) {
        setTimeout(reject, 10000, 'BNJSReady timeout')
        if (window.BNJS && typeof window.BNJS === 'object' && BNJS._isAllReady) {
            resolve();
        } else {
            document.addEventListener('BNJSReady', resolve, false);
        }
    })
}

// ready.then(device=>{console.log(device)})
function device() {
    // 已经测试
    return ready()
        .then(function () {
            return {
                client: 'bainuo',
                // 设备唯一标识（百度cuid）
                cuid: BNJS.env.cuid,
                // 组件运行APP版本(组件在百糯运行获取百糯版本/在手百运行获取手百的APP版本etc)
                sv: BNJS.env.appVersion,
                // SDK使用方标识，APP包名，组件方用于区分渠道，默认值：com.nuomi
                channel: BNJS.env.packageName,
                // 屏幕的宽 * 高
                screen: BNJS.device.screenWidth + '*' + BNJS.device.screenHeight,
                // 设备系统平台(Android/ios)
                from: BNJS.device.platform,
                // 设备系统版本
                os: BNJS.device.os,
                // 设备型号名称
                model: BNJS.device.name,
                // 支付平台?
                payPlats: '',
                //
                refer: ''
            }
        })
}

// 是否要转成墨卡托
function location() {
    return ready()
        .then(() => {
            if (BNJS.location.hasLocation) {
                // 该分支已经测试
                // 有定位数据
                // 通过经纬度拿墨卡托坐标
                var conver = coord.convertLL2MC([BNJS.location.longitude, BNJS.location.latitude]);
                var lat = conver[1];
                var lng = conver[0];
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
                    cityId: BNJS.location.cityCode,
                    // 定位地址
                    address: BNJS.location.address,
                    // 地址ID
                    addressId: ''
                }
            } else {
                // 没有定位数据 调用获取实时定位接口获取经纬度数据
                return new Promise(function (resolve, reject) {
                    // 待测试
                    BNJS.location.requestRealTimeLocation(function (res) {
                        BNJS.location.getLocation();
                        var latitude = res.data.latitude;
                        var longitude = res.data.longitude;
                        if (latitude && longitude) {
                            // 通过经纬度拿墨卡托坐标
                            var conver = coord.convertLL2MC([longitude, latitude]);
                            var lat = conver[1];
                            var lng = conver[0];
                            resolve({
                                locLng: lng,
                                locLat: lat,
                                lng: lng,
                                lat: lat,
                                cityId: res.data.cityCode,
                                address: res.data.address,
                                addressId: ''
                            })
                        } else {
                            reject('定位失败');
                        }
                    });
                });
            }
        })
}

// var online = 'http://waimai.baidu.com';
// var fgz = 'http://cp01-fgz.epc.baidu.com:8086';
// var online = 'http://cp01-fuguozheng.epc.baidu.com:8086';
var online = 'http://waimai.baidu.com';
// var lc = 'http://cq01-newdev.epc.baidu.com:8086';

var http = {
    get: (url, data) => ready()
        .then(function () {
            // 此分支已经测试
            return new Promise(function (resolve, reject) {
                BNJS.http.get({
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
                BNJS.http.post({
                    url: online + url,
                    params: data,
                    // success返回的数据格式
                    // {error_code: 0, reason: "successed", result: obj}
                    onSuccess: resolve,
                    onFail: reject
                });
            });
        })
}

var page = {
    close() {
        // 返回上一页，之前页面会被销毁 已经测试
        return ready().then(BNJS.page.back)
    },
    open(url, option) {
        // option {params: obj, action: 0新页面打开 | 1当前页面打开, direction: rtl：从右往左 | btt从下往上}
        // 已测试 'bainuo://component?compid=waimai&comppage=shopsearch'
        return ready()
            .then(function () {
                var finalUrl = '';
                if (url.indexOf('bainuo://') === 0) {
                    finalUrl = url;
                } else {
                    // 这里只encode参数部分, 使用encodeURI接口 待测试
                    finalUrl = 'bainuo://component?url=' + encodeURI(url)
                }
                if (url === 'bdwm://native?pageName=search') {
                    finalUrl = 'bainuo://component?compid=waimai&comppage=shopsearch';
                }
                // 默认从新页面打开
                BNJS.page.start(finalUrl, undefined, 0);
            })
    },
    onBack(onBackHandler) {
        return ready().then(function () {
            // bdwm 接口逻辑
            // 回退事件，返回1表示关闭，返回0表示不关闭，返回2表示使用浏览器的历史返回（v3.8.1+支持） 默认返回1，客户端直接关闭
            // 已经测试
            BNJS.page.onBtnBackClick({
                callback: function () {
                    var cbResult = onBackHandler();
                    if (cbResult === 0) {
                        // do nothing
                    } else if (cbResult === 1) {
                        BNJS.page.back();
                    } else if (cbResult === 2) {
                        // 返回上一页 待测试
                        window.history.go(-1)
                    } else {
                        // 默认行为是客户端直接关闭
                        BNJS.page.back();
                    }
                }
            });
        })
    },
    shop({ shopId, itemId, addToCart = 0, isStore = 1 }) {
        // 糯米打开商户链接
        // 待测试
        return ready().then(function () {
            // 商超页面和菜品页面都是使用下面的参数 不做区分
            if (!shopId) {
                return Promise.reject('shopId不能为空')
            }
            var url = 'bainuo://component?compid=waimai&comppage=shopinfo&shop_id=' + shopId;
            if (itemId) {
                url += '&dish_id=' + itemId;
                if (addToCart) {
                    url += '&wm_action=put';
                }
            }
            // 默认从当前页面打开
            BNJS.page.start(url, undefined, 0);
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
                    id: 'search', // search,close,collection,location,scan,share,collected,arrowdown_red,more,camera,delete 其中之一
                    onClick: ()=>0 //点击 action 的回调，没有回调传false
                }]
         * }
         * @param  titleText
         * @return {[type]}   [description]
         */
        return ready().then(function () {
            var titleText = barConfig.title === undefined ? document.title : barConfig.title;
            var iconArr = ['search', 'close', 'collection', 'location', 'scan', 'share', 'collected', 'arrowdown_red', 'more', 'camera', 'delete'];
            // 直接设置titlebar
            BNJS.ui.title.setTitle(titleText);
            if (barConfig.onTitleClick) {
                // 设置可以点击的titlebar 待测试
                BNJS.ui.title.setClickableTitle(titleText, barConfig.onTitleClick);
            }
            if (barConfig.actionList && barConfig.actionList.length && barConfig.actionList.length > 0) {
                // 调用addActionButton接口
                // 该分支没有设置onClick的情况已经测试
                barConfig.actionList.forEach((value, index) => {
                    // 设置titleBar
                    BNJS.ui.title.addActionButton({
                        // TODO style(是否同时显示图文) 暂时没有给出配置
                        // id 不重复 作为tag传递
                        tag: index + 1, // tag只能是数字
                        text: value.title,
                        callback: value.onClick || function () {},
                        // 注意这里不是http url需要根据糯米文档进行配置, 如果值在白名单里就取id的值
                        icon: iconArr.indexOf(value.id) === -1 ? null : value.id
                    });
                })
            }
        })
    }
}

var ui = {
    startLoading() {
        return ready().then(function () {
            // 显示加载中页面 已经测试
            BNJS.ui.dialog.showLoadingPage();
        })
    },
    endLoading() {
        return ready().then(function () {
            // 关闭加载中页面 已经测试
            BNJS.ui.dialog.hideLoadingPage();
        })
    }
}

export { ready, device, location, http, page, ui }
