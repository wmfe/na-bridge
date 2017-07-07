import ajax from './ajax'

window.BNJS = {}

let logOutput = []
let length = 1000
while (length--) {
  logOutput.push('color: #1f74e6')
  logOutput.push('color: #ccc')
}

function log (...arg) {
  // let str = '%c' + JSON.stringify(arg, null, '%c|%c   ')
  // console.log(str, ...logOutput.slice(0, str.match(/%c/g).length))
}

// device mock
window.BNJS.env = {
  cuid: '2AD442BA33F809FD94289E05FCEBACC4|36515060005553',
  appVersion: '3.9.1',
  packageName: 'com.yingyongbao'
}

window.BNJS.device = {
  screenWidth: 1440,
  screenHeight: 2392,
  platform: 'na-android',
  os: '6.0.1',
  name: 'XT1570'
}

// location mock
window.BNJS.location = {
  'districtId': '392',
  'hasLocation': true,
  'cityName': '北京市',
  'shortCityName': '北京',
  'longitude': '116.31454',
  'latitude': '40.04472',
  'showCityCode': '392',
  'cityCode': '100010000',
  'address': '北京市海淀区开拓路',
  'isAuthorized': true,
  'selectShortCityName': '北京',
  'selectCityUrl': '',
  'showCityName': '海淀区',
  'districtName': '海淀区',
  'selectCityName': '北京市',
  'cityUrl': 'beijing',
  'selectCityCode': '100010000',
  // 这里是经纬度而不是墨卡托
  getLocation: function () {},
  requestRealTimeLocation (callback) {
    let location = {
      data: {
        longitude: '116.31454',
        latitude: '40.04472',
        cityCode: '100010000',
        address: '北京市海淀区开拓路'
      }
    }
    callback(location)
  }
}

// http mock
window.BNJS.http = {
  get: function (paramObj) {
    // paramObj {url: 'url', params: paramsObj, onSuccess: func, onFail: func}
    ajax().get(paramObj.url, paramObj.params).then(paramObj.onSuccess)
  },
  post: function (paramObj) {
    // paramObj {url: 'url', params: paramsObj, onSuccess: func, onFail: func}
    ajax().post(paramObj.url, paramObj.params).then(paramObj.onSuccess)
  }
}

// page mock
window.BNJS.page = {
  back: log.bind(this, {
    back: 'nuomi call back'
  }),
  start: log.bind(this, {
    start: 'nuomi call start'
  }),
  onBtnBackClick: log.bind(this, {
    onBtnBackClick: 'nuomi call onBtnBackClick'
  }),
  enableBounce: log
}

if (!window.BNJS.ui) {
  window.BNJS.ui = {}
}
window.BNJS.ui.title = {
  addActionButton: log.bind(this, {
    addActionButton: 'nuomi call addActionButton'
  }),
  setClickableTitle: log.bind(this, {
    setClickableTitle: 'nuomi call setClickableTitle'
  }),
  setTitle: log.bind(this, {
    setTitle: 'nuomi call setTitle'
  })
}

// ui mock
window.BNJS.ui.dialog = {
  showLoadingPage: log.bind(this, {
    showLoadingPage: 'nuomi call showLoadingPage'
  }),
  hideLoadingPage: log.bind(this, {
    hideLoadingPage: 'nuomi call hideLoadingPage'
  }),
  show: log.bind(this, {
    show: 'nuomi call show'
  })
}
window.BNJS.ui.share = log

window.BNJS.account = {
  isLogin: true,
  uid: '1',
  uName: 'xiaoming',
  displayName: '小明',
  bduss: 'bduss',
  login (params) {
    params.onSuccess()
  }
}

let event = new window.Event('BNJSReady')
document.dispatchEvent(event)
window.BNJS._isAllReady = true
