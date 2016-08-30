import ajax from './ajax'

window.WMApp = {};

var logOutput = [];
var length = 1000;
while (length--) {
    logOutput.push('color: #1f74e6');
    logOutput.push('color: #ccc');
}

function log(...arg) {
    var str = '%c' + JSON.stringify(arg, null, '%c|%c   ');
    console.log(str, ...logOutput.slice(0, str.match(/%c/g).length))
}
window.WMApp.nui = {
    toast: log,
    loading: log
};

window.WMApp.page = {
    changePage: log,
    setTitleBar: log,
    closePage: log
};

window.WMApp.entry = {
    setPageAction: log
};

window.WMApp.console = {
    debug: log,
    log: log
};

window.WMApp.location = {
    getAsyncLocation: function (callback) {
        callback({
            cityId: '131',
            address: '彩虹大厦',
            locLng: '12948233.408314',
            locLat: '4844694.74816',
            lng: '1.2948232959996E7',
            lat: '4844695.33793'
        })
    },
    getSyncLocation: function () {
        return {
            locLng: 12948240.305863,
            locLat: 4844702.756684,
            lng: '1.294825299E7',
            lat: '4844765.42',
            cityId: '131',
            address: '彩虹大厦',
            addressId: '57421251'
        }
    }
};

window.WMApp.device = {
    getDevice: function () {
        return {
            cuid: '2AD442BA33F809FD94289E05FCEBACC4|36515060005553',
            sv: '3.9.1',
            channel: 'com.yingyongbao',
            screen: '1440*2392',
            from: 'na-android',
            os: '6.0.1',
            model: 'XT1570',
            payPlats: '0,1,2,3,4,6',
            refer: 'waimai.homepg'
        }
    }
}
window.WMApp.network = {
    getRequest(params, callback) {
        var url = params.url;
        if (url.indexOf('http://') === 0) {
            url = url.slice(url.indexOf('/', 7))
        }
        ajax()
            .get(url, params.data)
            .then(res => {
                callback({
                    status: 1,
                    result: {
                        statusCode: 200,
                        responseBody: res
                    }
                })
            })
    }
}

var event = new CustomEvent('WMAppReady');
document.dispatchEvent(event);
