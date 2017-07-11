// ready.then().catch()
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
const isWeChat = /micromessenger/i.test(window.navigator.userAgent)
import objectAssign from 'object-assign'
import 'es6-promise/auto'

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
    // params.pageData = params.pageData.replace(/%22/g, '"');
    params.pageData = decodeURIComponent(params.pageData)
    let innerP
    try {
      innerP = JSON.parse(params.pageData)
    } catch (e) {
      window.wmErrorReport && window.wmErrorReport(e)
      innerP = {}
    }
    objectAssign(params, innerP)
  }
  delete params.from
  return params
})()

function ready() {
  return new Promise(function (resolve, reject) {
    // setTimeout(reject, 10000, 'WMAppReady timeout')
    resolve(pageData)
  })
}

let cuid = document.cookie.replace(
  /(?:(?:^|.*;\s*)cuid=\s*([^;]*).*$)|^.*$/,
  '$1'
)
if (!cuid) {
  // cuid = Math.random().toString(16).slice(2) + '|' + Math.random().toString(10).slice(2);
  cuid = '2AD442BA33F809FD94289E05FCEBACC4|36515060005553'
  document.cookie = 'cuid=' +
    cuid +
    '; expires=Thu, 01 Jan 2970 00:00:00 GMT'
}

function device() {
  const width = window.innerWidth
  const height = window.innerHeight
  return ready().then(function () {
    setTimeout(function () {
    }, 0)
    return {
      cuid: cuid,
      sv: '4.1.1',
      channel: 'com.yingyongbao',
      screen: `${width}*${height}`,
      from: 'webapp',
      os: '',
      model: 'XT1570',
      payPlats: '0,1,2,3,4,6',
      refer: 'waimai.homepg'
    }
  })
}

function location() {
  return ready().then(function () {
    setTimeout(function () {}, 0)
    return {}
  })
}

function humpToUnderline (params) {
  let result = {}
  Object.keys(params).forEach(k => {
    let newK = k.replace(/([A-Z])/g, '_$1').toLowerCase()
    result[newK] = params[k]
  })
  return result
}

function sendOnlineStat(params) {
  params = humpToUnderline(params)
  Promise.all([ready(), device(), location(), network()]).then(([
                                                                  pageData,
                                                                  device,
                                                                  location,
                                                                  network
                                                                ]) => {
    let result = {}
    objectAssign(result, params, {
      cuid: device.cuid,
      from: device.from,
      app_plat: 'webapp',
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

const DEFAULT = {
  da_src: 'default',
  da_act: 'ready',
  baiduid: document.cookie.replace(/(?:(?:^|.*;\s*)BAIDUID=\s*([^;]*).*$)|^.*$/, '$1'),
  da_refer: '',
  da_trace: ''
}

function send (stat) {
  let query = serialize(objectAssign({ da_time: Date.now() }, DEFAULT, stat))
  console.log(objectAssign({ da_time: Date.now() }, DEFAULT, stat), query)
  let image = new Image()
  image.onload = (image.onerror = function () {
    image = null
  })
  image.src = 'http://log.waimai.baidu.com/static/transparent.gif?' + query
}

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

function removeOrderTraceItem() {
}

function network() {
  return {
    net_type: 'wifi'
  }
  // return ready()
  //     .then(function () {
  //         return new Promise(function (resolve, reject) {
  //             window.WMApp.network.getNetwork(function (data) {
  //                 // result里面有wifi、mobile、unreachable三种返回值
  //                 // mobile表示移动网络，unreachable表法当前网络不可用
  //                 if (data.status) {
  // console.info('network', data);
  //                     resolve({
  //                         net_type: data.result.network
  //                     });
  //                 }
  //                 else {
  //                     reject();
  //                 }
  //             });
  //             setTimeout(function () { }, 0);
  //         });
  //     })
  //     .catch(function () {
  //         setTimeout(function () { }, 0);
  //         return {
  //             net_type: 'unreachable'
  //         };
  //     });
}

const online = 'https://waimai.baidu.com'
// let fgz = 'http://cp01-fgz.epc.baidu.com:8086';
// let online = 'http://waimai.baidu.com';
// let online = 'http://gzns-waimai-dcloud31.gzns.iwm.name:8309'; // 广昱
// online = 'http://gzhxy-waimai-dcloud11.gzhxy.iwm.name:8365'; // 刘刚
// let online = 'http://cp01-fuguozheng.epc.baidu.com:8086';

const boundary = '-WaimaiAjaxBoundary-'
const http = {
  get: (url, data) =>
    ready().then(function () {
      if (isIOS) {
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            data[key] = encodeURIComponent(data[key])
          }
        }
      }
      let params = {
        url: online + url,
        data: data
      }
      return new Promise(function (resolve, reject) {
        window.WMApp.network.getRequest(params, function (data) {
          if (data.status && data.result && parseInt(data.result.statusCode, 10) === 200) {
            let r = data.result.responseBody
            if (r.indexOf(boundary) === 0) {
              r = r.split(boundary)[1]
            }
            let response
            try {
              response = JSON.parse(r)
            } catch (e) {
              window.wmErrorReport && window.wmErrorReport(e)
              response = r
            }
            // console.info(response);
            resolve(response)
            setTimeout(function () {
            }, 0)
          } else {
            let info = '数据传输失败，请重试'
            // console.info(info);
            reject(info)
          }
        })
      })
    }),
  post: (url, data) =>
    ready().then(function () {
      let query = []
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          query.push(key + '=' + encodeURIComponent(data[key]))
        }
      }
      let params = {
        url: online + url,
        contentType: 'application/x-www-form-urlencoded',
        data: query.join('&')
      }
      return new Promise(function (resolve, reject) {
        window.WMApp.network.postRawRequest(params, function (data) {
          if (data.status && data.result && parseInt(data.result.statusCode, 10) === 200) {
            let r = data.result.responseBody
            if (r.indexOf(boundary) === 0) {
              r = r.split(boundary)[1]
            }
            let response
            try {
              response = JSON.parse(r)
            } catch (e) {
              window.wmErrorReport && window.wmErrorReport(e)
              response = r
            }
            // console.info(response);
            resolve(response)
            setTimeout(function () {
            }, 0)
          } else {
            let info = '数据传输失败，请重试'
            // console.info(info);
            reject(info)
          }
        })
      })
    })
}

const account = {
  login: () =>
    ready().then(function () {
      return new Promise((resolve, reject) => {
        resolve('login')
      })
    }),
  getInfo: () =>
    ready().then(function () {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
}

const ui = {
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
        const result = window.confirm(content)
        result ? resolve() : reject()
        setTimeout(function () {
        }, 0)
      })
    })
  },
  toast (text, duration = 'short') {
    return ready().then(function () {
      window.alert(text)
      setTimeout(function () {
      }, 0)
    })
  }
}

function share(params) {}

const shop = {
  addFavorite (shopId, f) {
  },
  delFavorite (shopId, f) {
  }
}

let pageShowCallback = []
const webview = {
  startLoading: ui.startLoading,
  endLoading: ui.endLoading,
  open (url, pageData) {
    if (process.env.NODE_ENV !== 'production') {
      let urlData = (function () {
        let search = url.replace(/^[^?]*\?/, '')
        let params = {}
        if (search) {
          search.split('&').forEach(v => {
            let param = v.split('=')
            params[param[0]] = param[1] || ''
          })
        }
        return params
      })()
      let path = urlData.pageName ? urlData.pageName + '.html?' : 'index.html?'
      let data = objectAssign({}, JSON.parse(decodeURIComponent(urlData.pageData || 0)), pageData)
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          path += key + '=' + data[key] + '&'
        }
      }
      path = path.slice(0, -1)
      window.location.href = path
    } else {
      if (url.indexOf('bdwm://') !== 0) {
        url = 'bdwm://native?pageName=webview&url=' + encodeURIComponent(url)
      }
      if (Object.prototype.toString.call(pageData) === '[object Object]') {
        url += '&pageData=' + encodeURIComponent(JSON.stringify(pageData))
      }
      window.location.href = url
    }
  },
  close (data) {
    return ready().then(window.WMApp.page.closePage)
  },
  pageshow (callback) {
  }
}

// let titleBarConfig = {}
const page = {
  close () {
    return ready().then(window.close())
  },
  // 打开url或者协议
  open (url, onBack) {
    window.location.href = url
    // ready().then(function () {
    //     window.WMApp.page.changePageForResult({ openUrl: url }, function (data) {
    //         ui.toast('back');
    //         onBack && onBack(data)
    //     });
    // })
  },
  onBack (onBackHandler) {
    return ready().then(function () {
    })
  },
  setPageId (id) {
    return 0
  },
  home () {
    // console.info('navigate to home');
    window.location.href = 'bdwm://native?pageName=home'
  },
  search (taste) {
    webview.open('bdwm://native?pageName=search&id=' + taste)
  },
  index () {
  },
  cart () {
  },
  shop ({shopId, itemId = '', addToCart = 0, isStore = 1, activityId = ''}) {
  },
  shopSearch (shopId) {
  },
  item (shopId, itemId, addToCart = 0) {
  },
  shopDetail (shopId) {
  },
  shopComment (shopId) {
  },
  setTitleBar (barConfig) {
    document.title = barConfig.titleText || barConfig.title || '百度外卖';
    if (isWeChat && isIOS) {
      const i = document.createElement('iframe');
      i.src = '//m.baidu.com/favicon.ico';
      i.style.display = 'none';
      i.onload = function () {
        setTimeout(function () {
          i.remove();
        }, 9)
      }
      document.body.appendChild(i);
    }
  },
  confirmOrder (shopId, products) {
  },
  pushRefresh (callback) {
  },
  closePushRefresh () {
  }
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
