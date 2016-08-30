import ajax from './ajax';

window.BNJS = {};

BNJS._isAllReady = true;

var logOutput = [];
var length = 1000;
while (length--) {
    logOutput.push('color: #1f74e6');
    logOutput.push('color: #ccc');
}

function log(...arg) {
    var str = '%c' + JSON.stringify(arg, null, '%c|%c   ');
    console.log(str, ...logOutput.slice(0, str.match(/%c/g).length));
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
    // 这里是经纬度而不是墨卡托
    longitude: 116.314605,
    latitude: 40.044787,
    cityCode: '131',
    address: '彩虹大厦',
    hasLocation: true,
    getLocation: function () {}
}

// http mock
window.BNJS.http = {
    get: function (paramObj) {
        // paramObj {url: 'url', params: paramsObj, onSuccess: func, onFail: func}
        ajax()
            .get(paramObj.url, paramObj.params)
            .then(paramObj.onSuccess);
    },
    post: function (paramObj) {
        // paramObj {url: 'url', params: paramsObj, onSuccess: func, onFail: func}
        ajax()
            .post(paramObj.url, paramObj.params)
            .then(paramObj.onSuccess);
    }
}

// page mock
window.BNJS.page = {
    back: log.bind(this, { back: 'nuomi call back' }),
    start: log.bind(this, { start: 'nuomi call start' }),
    onBtnBackClick: log.bind(this, { onBtnBackClick: 'nuomi call onBtnBackClick' })
}

if (!window.BNJS.ui) {
    window.BNJS.ui = {};
}
window.BNJS.ui.title = {
    addActionButton: log.bind(this, { addActionButton: 'nuomi call addActionButton' }),
    setClickableTitle: log.bind(this, { setClickableTitle: 'nuomi call setClickableTitle' }),
    setTitle: log.bind(this, { setTitle: 'nuomi call setTitle' })
}

// ui mock
window.BNJS.ui.dialog = {
    showLoadingPage: log.bind(this, { showLoadingPage: 'nuomi call showLoadingPage' }),
    hideLoadingPage: log.bind(this, { hideLoadingPage: 'nuomi call hideLoadingPage' })
}

var event = new Event('BNJSReady');
document.dispatchEvent(event);
