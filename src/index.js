import * as bdwm from './bdwm'
import * as bainuo from './bainuo'
import * as h5 from './h5'
import validateOverride from './bridgeInterface'

if (process.env.NODE_ENV !== 'production') {
  validateOverride(bdwm)
  validateOverride(bainuo)
  validateOverride(h5)
}

function is (ua) {
  return new RegExp(ua, 'i').test(navigator.userAgent)
}
// let isWeixin = is('micromessenger');
let isBdwm = is('wmapp')
// 糯米      BDNuomiAppAndroid BDNuomiAppIOS
// 糯米渠道  BDNuomiAppAndroid BDNuomiAppIOS
let isBainuo = is('BDNuomiApp')
if (!isBdwm && !isBainuo) {
  isBainuo = window.location.search.indexOf('env=nuomi') >= 0 ||
        window.location.search.indexOf('third_party=nuomi') >= 0 ||
        document.cookie.indexOf('env=nuomi') >= 0
}

if (isBainuo) {
  document.cookie = 'env=nuomi; expires=Thu, 01 Jan 2970 00:00:00 GMT'
}

let env
let envName
let appPlat = 'waimai'
// process.env.BUILD_FOR 编译时即可确认平台
if (process.env.BUILD_FOR === 'offline' && isBdwm) {
  env = bdwm
  envName = 'bdwm'
} else if (process.env.BUILD_FOR !== 'offline' && isBainuo) {
  env = bainuo
  envName = 'bainuo'
    // 应该区分nuomi shoubai qianbao ditu，但是暂不区分，https://agroup.baidu.com/waimaic/md/article/72141?side=folder
  appPlat = 'nuomi'
} else if (process.env.BUILD_FOR === 'h5') {
  env = h5
  envName = 'h5'
} else if (
    process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'development'
) {
    // 测试环境和本地开发环境，模拟为外卖bridge
  env = bdwm
  envName = 'bdwm'
}

let {
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
} = env

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
    webview,
    envName,
    appPlat
}
