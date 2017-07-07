import objectAssign from 'object-assign'
import 'es6-promise/auto'
import coord from './coordService'
// let isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
let pageData = (function () {
  let search = window.location.search.replace(/^\?/, '')
  let params = {}
  if (search) {
    search.split('&').forEach(v => {
      let param = v.split('=')
      params[param[0]] = param[1] || ''
    })
  }
  if (params.pageData) {
    params.pageData = decodeURIComponent(params.pageData)
    let innerP
    try {
      innerP = JSON.parse(params.pageData)
    } catch (e) {
      // window.wmErrorReport && window.wmErrorReport(e)
      window.wmlog && window.wmlog('exception.send', e)
      innerP = {}
    }
    objectAssign(params, innerP)
  }
  delete params.from
  return params
})()

function ready () {
  return new Promise(function (resolve, reject) {
    setTimeout(reject, 10000, 'BNJSReady timeout')
    document.addEventListener(
      'BNJSReady',
      function () {
        window.BNJS.page.enableBounce(false)
        resolve(pageData)
      },
      false
    )
    if (
      window.BNJS &&
      typeof window.BNJS === 'object' &&
      window.BNJS._isAllReady
    ) {
      window.BNJS.page.enableBounce(false)
      resolve(pageData)
    }
  })
}

function device () {
  // 已经测试
  return ready().then(function () {
    return {
      client: 'bainuo',
      // 设备唯一标识（百度cuid）
      cuid: window.BNJS.env.cuid,
      // 组件运行APP版本(组件在百糯运行获取百糯版本/在手百运行获取手百的APP版本etc)
      sv: window.BNJS.env.appVersion,
      // SDK使用方标识，APP包名，组件方用于区分渠道，默认值：com.nuomi
      channel: window.BNJS.env.packageName,
      // 屏幕的宽 * 高
      screen: window.BNJS.device.screenWidth +
        '*' +
        window.BNJS.device.screenHeight,
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
    }
  })
}

/**
 * 写的匆忙，未对回调参数类型测试
 * @return {[type]} [description]
 */
function network () {
  return ready()
    .then(function () {
      return new Promise(function (resolve, reject) {
        window.BNJS.env.network(function (data) {
          let type = 'mobile'
          if (data.network === 'wifi') {
            type = 'wifi'
          } else if (data.network === 'non') {
            type = 'unreachable'
          }
          resolve({
            net_type: type
          })
        })
        setTimeout(reject, 10000)
      })
    })
    .catch(function (error) {
      // window.wmErrorReport && window.wmErrorReport(new Error(error))
      window.wmlog && window.wmlog('exception.send', new Error(error))
      return {
        net_type: 'unreachable'
      }
    })
}

let online = 'https://waimai.baidu.com'
// online = 'http://gzns-waimai-dcloud31.gzns.iwm.name:8309';

let http = {
  get: (url, data) =>
    ready().then(function () {
      // 此分支已经测试
      return new Promise(function (resolve, reject) {
        if (data.address) {
          data.address = decodeURIComponent(data.address)
        }
        window.BNJS.http.get({
          url: online + url,
          params: data,
          // success返回的数据格式
          // {error_code: 0, reason: "successed", result: obj}
          onSuccess: function (r) {
            resolve(r)
            setTimeout(function () {}, 0)
          },
          onFail: reject
        })
      })
    }),
  post: (url, data) =>
    ready().then(function () {
      // 待测试
      return new Promise(function (resolve, reject) {
        window.BNJS.http.post({
          url: online + url,
          params: data,
          // success返回的数据格式
          // {error_code: 0, reason: "successed", result: obj}
          onSuccess: function (r) {
            resolve(r)
            setTimeout(function () {}, 0)
          },
          onFail: reject
        })
      })
    })
}

// 涉及耗时ajax请求，加cache
let locationCache

function location () {
  if (locationCache) {
    return locationCache
  }
  locationCache = ready()
    .then(
      pageData =>
      new Promise(function (resolve, reject) {
        let { lat, lng, address, cityId } = pageData || {}
        if (lat && lng && address && cityId) {
          window.localStorage.setItem(
            'WM_SUPERMARKET_ADDR',
            JSON.stringify({ lat, lng, address, cityId })
          )
          window.localStorage.setItem(
            'WM_SUPERMARKET_ADDR$$time',
            Date.now()
          )
          resolve({ lat, lng, address, cityId })
        } else {
          reject(new Error('数据不完整'))
        }
      })
    )
    .catch(
      e =>
      new Promise(function (resolve, reject) {
        let time = parseInt(
          window.localStorage.getItem(
            'WM_SUPERMARKET_ADDR$$time'
          ),
          10
        )
        time = isNaN(time) ? 0 : time
        if (Date.now() - time > 1000 * 60 * 60) {
          return resolve()
        }
        let addr = window.localStorage.getItem(
          'WM_SUPERMARKET_ADDR'
        )
        try {
          addr = JSON.parse(addr)
        } catch (e) {
          // do nothing;
          // window.wmErrorReport && window.wmErrorReport(e)
          window.wmlog && window.wmlog('exception.send', e)
        }
        resolve(addr)
      })
    )
    .then(addr => {
      let {
        lat,
        lng,
        address,
        cityId
      } = addr || {}
      if (window.BNJS && window.BNJS.location && window.BNJS.location.hasLocation) {
        // 该分支已经测试
        // 有定位数据
        // 通过经纬度拿墨卡托坐标
        let conver = coord.convertLL2MC([
          window.BNJS.location.longitude,
          window.BNJS.location.latitude
        ])
        let locLng = conver[0]
        let locLat = conver[1]
        let cityCode = window.BNJS.location.cityCode ||
          window.BNJS.location.city_code
        return {
          // 定位经度
          locLng: locLng,
          // 定位纬度
          locLat: locLat,
          // 召回经度
          lng: lng || locLng,
          // 召回纬度
          lat: lat || locLat,
          // 定位城市code
          cityCode: cityCode,
          cityId: cityId,
          // 定位地址
          address: address || window.BNJS.location.address,
          // 地址ID
          addressId: ''
        }
      }
      // 没有定位数据 调用获取实时定位接口获取经纬度数据
      return new Promise(function (resolve, reject) {
        // 待测试
        window.BNJS.location.requestRealTimeLocation(function (res) {
          window.BNJS.location.getLocation()
          let latitude = res.data.latitude
          let longitude = res.data.longitude
          if (latitude && longitude) {
            // 通过经纬度拿墨卡托坐标
            let conver = coord.convertLL2MC([longitude, latitude])
            let locLng = conver[0]
            let locLat = conver[1]
            let cityCode = res.data.cityCode || res.data.city_code
            resolve({
              locLng: locLng,
              locLat: locLat,
              lng: lng || locLng,
              lat: lat || locLat,
              cityCode: cityCode,
              cityId: cityId,
              address: address || res.data.address,
              addressId: ''
            })
          } else {
            reject(new Error('定位失败'))
          }
        })
      })
    })
    .then(location => {
      if (location.cityId) {
        return location
      }
      return http
        .get('/mobile/waimai', {
          qt: 'convertcitycode',
          source: 'BNCode',
          display: 'json',
          sourceCode: location.cityCode
        })
        .then(res => {
          if (res.error_no === 0) {
            location.cityId = res.result.cityCode || 'null'
          }
          return location
        })
        .catch(e => {
          console.info('err', e)
        })
    })
  return locationCache
}

let ui = {
  startLoading () {
    document.getElementById('loading').style.display = ''
  },
  endLoading () {
    document.getElementById('loading').style.display = 'none'
  },
  /**
   * ui.confirm(title, content)
   * .then(function(){
   * // 确认操作
   * }).catch(function(){
   * // 取消操作
   * })
   */
  confirm (title, content) {
    return ready().then(function () {
      return new Promise(function (resolve, reject) {
        let params = {
          title: title,
          message: content,
          cancel: '取消',
          ok: '确认',
          onConfirm: resolve,
          onCancel: reject
        }
        window.BNJS.ui.dialog.show(params)
      })
    })
  },
  toast (text, duration = 'short') {
    let length = duration === 'short' ? 0 : 1
    return ready().then(function () {
      window.BNJS.ui.toast.show(text, length)
      setTimeout(function () {}, 0)
    })
  }
}

function share (params) {
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
    let shareType = params.linkUrl ? 1 : 2
    window.BNJS.ui.share({
      type: shareType,
      title: params.title,
      content: params.description,
      imgUrl: params.imageUrl,
      imageList: [params.imageUrl],
      url: params.linkUrl,
      platforms: ['weixin_session', 'weixin_timeline']
    })
    setTimeout(function () {}, 0)
  })
}

let account = {
  login: () =>
    ready().then(function () {
      return new Promise((resolve, reject) => {
        window.BNJS.account.login({
          type: '0',
          onSuccess: function (data) {
            resolve('登录成功')
            setTimeout(function () {}, 0)
          },
          onFail: function (data) {
            reject(data.errmsg || '登录取消')
            setTimeout(function () {}, 0)
          }
        })
      })
    }),
  getInfo: () =>
    ready().then(function () {
      if (!window.BNJS.account.isLogin) {
        return Promise.reject(new Error('未登录'))
      }
      return {
        uid: window.BNJS.account.uid,
        username: window.BNJS.account.uName,
        displayname: window.BNJS.account.displayName,
        bduss: window.BNJS.account.bduss
      }
    })
}

let shop = {
  /**
   * shopId: 商户id,
   * f: device 里的from
   */
  addFavorite (shopId, f) {
    return http
      .get('/h5ui/favoriteadd', {
        shop_id: shopId,
        from: f
      })
      .catch(function (e) {
        // window.wmErrorReport && window.wmErrorReport(new Error(e))
        window.wmlog && window.wmlog('exception.send', new Error(e))
        setTimeout(function () {}, 0)
        return Promise.reject(new Error('加载失败，请重试'))
      })
      .then(
        res =>
        new Promise((resolve, reject) => {
          if (res.error_no === 0) {
            resolve('收藏成功')
            // ui.toast('收藏成功 error_no === 0')
          } else if (res.error_no === 102) {
            // ui.toast('收藏成功 error_no === 102')
            account.login()
            reject(new Error())
          } else {
            reject(new Error('加载失败，请重试'))
          }
          setTimeout(function () {}, 0)
        })
      )
  },
  delFavorite (shopId, f) {
    return http
      .get('/h5ui/favoritedel', {
        shop_id: shopId,
        from: f
      })
      .catch(function (e) {
        // window.wmErrorReport && window.wmErrorReport(new Error(e))
        window.wmlog && window.wmlog('exception.send', new Error(e))
        setTimeout(function () {}, 0)
        return Promise.reject(new Error('加载失败，请重试'))
      })
      .then(
        res =>
        new Promise(function (resolve, reject) {
          if (res.error_no === 0) {
            resolve(new Error('取消收藏成功'))
          } else {
            reject(new Error('取消收藏失败'))
          }
          setTimeout(function () {}, 0)
        })
      )
  }
}

const webview = {
  startLoading () {
    return ready().then(function () {
      window.BNJS.ui.showLoadingPage()
    })
  },
  endLoading () {
    return ready().then(function () {
      window.BNJS.ui.hideLoadingPage()
    })
  },
  close () {
    // 返回上一页，之前页面会被销毁 已经测试
    return ready().then(function () {
      window.BNJS.page.back()
    })
  },
  open (url, option) {
    // option {params: obj, action: 0新页面打开 | 1当前页面打开, direction: rtl：从右往左 | btt从下往上}
    // 已测试 'bainuo://component?compid=waimai&comppage=shopsearch'
    return ready().then(function () {
      // 这里只encode参数部分, 使用encodeURI接口 待测试
      if (url.indexOf('bainuo://') !== 0) {
        if (url.indexOf('?') >= 0) {
          url = url.replace('?', '?env=nuomi&')
        } else {
          url = url + '?env=nuomi'
        }
        url = 'bainuo://component?url=' + encodeURIComponent(url)
      }
      window.BNJS.page.start(url, undefined, 0)
    })
  },
  pageshow (callback) {
    // callback 需要触发多次所以不能用 promise 了
    if (typeof callback !== 'function') {
      return
    }
    return ready().then(function () {
      window.BNJS.page.reShow(callback)
    })
  }
}

let page = {
  close () {
    // 返回上一页，之前页面会被销毁 已经测试
    return ready().then(window.BNJS.page.back)
  },
  open (url, option) {
    // option {params: obj, action: 0新页面打开 | 1当前页面打开, direction: rtl：从右往左 | btt从下往上}
    // 已测试 'bainuo://component?compid=waimai&comppage=shopsearch'
    return ready().then(function () {
      let finalUrl = ''
      if (url.indexOf('bainuo://') === 0) {
        finalUrl = url
      } else {
        // 这里只encode参数部分, 使用encodeURI接口 待测试
        finalUrl = 'bainuo://component?url=' + encodeURI(url)
      }
      if (url === 'bdwm://native?pageName=search') {
        finalUrl = 'bainuo://component?compid=waimai&comppage=shopsearch'
      }
      // 默认从新页面打开
      window.BNJS.page.start(finalUrl)
    })
  },
  onBack (onBackHandler) {
    return ready().then(function () {
      // bdwm 接口逻辑
      // 回退事件，返回1表示关闭，返回0表示不关闭，返回2表示使用浏览器的历史返回（v3.8.1+支持） 默认返回1，客户端直接关闭
      // 已经测试
      window.BNJS.page.onBtnBackClick({
        callback: function () {
          let cbResult = onBackHandler()
          if (cbResult === 0) {
            // do nothing
          } else if (cbResult === 1) {
            window.BNJS.page.back()
          } else if (cbResult === 2) {
            // 返回上一页 待测试
            window.history.go(-1)
          } else {
            // 默认行为是客户端直接关闭
            window.BNJS.page.back()
          }
        }
      })
    })
  },
  setPageId (id) {
    return ready().then(
      () =>
      new Promise(function (resolve, reject) {
        window.BNJS.page.setPageId({
          pageId: id,
          onSuccess: resolve,
          onFail (e) {
            reject(e && e.errmsg)
          }
        })
      })
    )
  },
  home () {
    return ready().then(() => {
      window.BNJS.page.start(
        'bainuo://component?compid=waimai&comppage=shoplist'
      )
    })
  },
  search (taste) {
    return ready().then(() => {
      window.BNJS.page.start(
        'bainuo://component?compid=waimai&comppage=shopsearch'
      )
    })
  },
  index () {
    let cid = pageData.cid || ''
    let url = `https://waimai.baidu.com/static/supermarket/index.html?cid=${cid}`
    url = 'bainuo://component?url=' + encodeURIComponent(url)
    return ready().then(() => {
      window.BNJS.page.start(url)
      setTimeout(function () {}, 0)
    })
  },
  cart () {
    let cid = pageData.cid || ''
    let url = `https://waimai.baidu.com/static/supermarket/cart.html?cid=${cid}`
    url = 'bainuo://component?url=' + encodeURIComponent(url)
    return ready().then(() => {
      window.BNJS.page.start(url)
      setTimeout(function () {}, 0)
    })
  },
  shop ({
    shopId,
    itemId = '',
    addToCart = 0,
    isStore = 1,
    activityId = ''
  }) {
    // 糯米打开商户链接
    return ready().then(function () {
      if (!shopId) {
        return Promise.reject(new Error('shopId不能为空'))
      }
      let cid = pageData.cid || ''
      let url
      // packageName wiki: https://agroup.baidu.com/waimaic/md/article/72141?side=folder
      const packageName = window.BNJS.env.packageName
      const isNuomi = packageName.indexOf('nuomi') >= 0 ||
        packageName === 'com.baidu.searchbox'
      if (isStore && isNuomi) {
        // 增加了activityId 进入页面后，固定促销子分类
        url = `https://waimai.baidu.com/static/supermarket/shop.html?shopId=${shopId}&itemId=${itemId}&addToCart=${addToCart}&activityId=${activityId}&cid=${cid}`
        url = 'bainuo://component?url=' + encodeURIComponent(url)
      } else {
        url = 'bainuo://component?compid=waimai&comppage=shopinfo&shop_id=' +
          shopId +
          '&android_cid=' +
          cid +
          '&ios_cid=' +
          cid
        if (itemId) {
          url += '&dish_id=' + itemId
          if (addToCart) {
            url += '&wm_action=put'
          }
        }
      }
      // 默认从当前页面打开
      window.BNJS.page.start(url)
      setTimeout(function () {}, 0)
      return 1
    })
  },
  shopSearch (shopId) {
    let cid = pageData.cid || ''
    let url = `https://waimai.baidu.com/static/supermarket/search.html?shopId=${shopId}&cid=${cid}`
    url = 'bainuo://component?url=' + encodeURIComponent(url)
    return ready().then(() => {
      window.BNJS.page.start(url)
      setTimeout(function () {}, 0)
    })
  },
  item (shopId, itemId, addToCart = 0) {
    return ready().then(function () {
      if (!shopId) {
        return Promise.reject(new Error('shopId不能为空'))
      }
      let cid = pageData.cid || ''
      let url = `https://waimai.baidu.com/static/supermarket/item.html?shopId=${shopId}&itemId=${itemId}&addToCart=${addToCart}&cid=${cid}`
      url = 'bainuo://component?url=' + encodeURIComponent(url)
      window.BNJS.page.start(url)
      setTimeout(function () {}, 0)
      return 1
    })
  },
  shopDetail (shopId) {
    // do nothing
    console.warn('糯米里没有单独的商户详情页面')
    return Promise.reject(new Error('方法未实现'))
  },
  shopComment (shopid) {
    console.warn('糯米里没有单独的商户评价页面')
    return Promise.reject(new Error('方法未实现'))
  },
  setTitleBar (barConfig) {
    /**
     * barConfig demo
     * {
     *     title: '超市购',
     *     onTitleClick: ()=>0, //点击标题的回调，没有回调传false
     *     actionList: [{
                title: '搜索',
                titleColor: '#ffffff',
                icon: 'https://img.waimai.baidu.com/pb/09e4d72a1253d0934f568cb6cad5074acb',
                id: 'search', // search,close,collection,location,scan,share,collected,arrowdown_red,more,camera,delete 其中之一
                onClick: ()=>0 //点击 action 的回调，没有回调传false
            }]
     * }
     * @param  titleText
     * @return {[type]}   [description]
     */
    return ready().then(function () {
      let titleText = barConfig.title === undefined
        ? document.title
        : barConfig.title
      let iconArr = [
        'search',
        'close',
        'collection',
        'location',
        'scan',
        'share',
        'collected',
        'arrowdown_red',
        'more',
        'camera',
        'delete'
      ]
      // 直接设置titlebar
      window.BNJS.ui.title.setTitle(titleText)
      if (barConfig.onTitleClick) {
        // 设置可以点击的titlebar 待测试
        window.BNJS.ui.title.setClickableTitle(
          titleText,
          barConfig.onTitleClick
        )
      }
      if (
        barConfig.actionList &&
        barConfig.actionList.length &&
        barConfig.actionList.length > 0
      ) {
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
          })
        })
      }
    })
  },
  confirmOrder (shopId, products) {
    return ready()
      .then(account.getInfo)
      .catch(e => account.login)
      .then(() => {
        // 已经登录
        let scheme = 'bainuo://component?compid=waimai&comppage=confirmorder'
        // let scheme = 'bainuo://component?url=http%3A%2F%2F172.16.79.122%3A8080%2Fpage%2Fconfirmorder.html';
        let params = {
          refer: 'supermarket',
          shopId,
          dishItems: encodeURIComponent(products)
        }
        window.BNJS.page.start(scheme, params)
        setTimeout(function () {}, 0)
      })
  },
  closePushRefresh () {

    // ready().then(function () {
    //     WMApp.page.closePageRefresh();
    //     // ui.toast('closed')
    // })
  }
}

// start 糯米bainuo发送统计点
function serialize (object) {
  let output = []
  if (object !== undefined && object !== null) {
    for (let key in object) {
      if (object.hasOwnProperty(key) && object[key] !== undefined) {
        let v = object[key]
        if (object[key] !== null && typeof object[key] === 'object') {
          v = JSON.stringify(object[key])
        }
        output.push(
          encodeURIComponent(key) + '=' + encodeURIComponent(v)
        )
      }
    }
  }
  return output.join('&')
}

let DEFAULT = {
  da_src: 'default',
  da_act: 'ready',
  baiduid: document.cookie.replace(/(?:(?:^|.*;\s*)BAIDUID=\s*([^;]*).*$)|^.*$/, '$1'),
  da_refer: '',
  da_trace: ''
}

function send (stat) {
  let query = serialize(objectAssign({
    da_time: Date.now()
  }, DEFAULT, stat))
  let image = new window.Image()
  image.onload = (image.onerror = function () {
    image = null
  })
  image.src = 'http://log.waimai.baidu.com/static/transparent.gif?' + query
}

function humpToUnderline (params) {
  let result = {}
  Object.keys(params).forEach(k => {
    let newK = k.replace(/([A-Z])/g, '_$1').toLowerCase()
    result[newK] = params[k]
  })
  return result
}

function sendOnlineStat (params) {
  params = humpToUnderline(params)
  return Promise.all([ready(), device(), location(), network()]).then(([
    pageData,
    device,
    location,
    network
  ]) => {
    let result = {}
    objectAssign(result, params, {
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
    })
    send(result)
  })
}

function removeOrderTraceItem () {
  return Promise.resolve()
}

export {
  ready,
  device,
  location,
  sendOnlineStat,
  removeOrderTraceItem,
  http,
  page,
  ui,
  network,
  share,
  shop,
  account,
  webview
}
