'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function serialize(object) {
    var output = [];
    if (object !== undefined && object !== null) {
        for (var key in object) {
            if (object.hasOwnProperty(key) && object[key] !== undefined) {
                output.push(encodeURIComponent(key) + '=' + encodeURIComponent(object[key]));
            }
        }
    }
    return output.join('&');
};

var DEFAULT = {
    da_src: 'default',
    da_act: 'ready',
    baiduid: document.cookie.replace(/(?:(?:^|.*;\s*)BAIDUID=\s*([^;]*).*$)|^.*$/, '$1'),
    da_refer: '',
    da_trace: ''
};

function send(stat) {
    var query = serialize((0, _assign2.default)({ da_time: Date.now() }, DEFAULT, stat));
    var image = new Image();
    image.onload = image.onerror = function () {
        image = null;
    };
    image.src = 'http://log.waimai.baidu.com/static/transparent.gif?' + query;
}

var isReady = false;
var quene = [];
function proxy(stat) {
    if (isReady) {
        send(stat);
    } else {
        quene.push(send.bind(null, stat));
    }
}

_promise2.default.all([(0, _index.ready)(), (0, _index.device)(), (0, _index.location)(), (0, _index.network)()]).then(function (_ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 4),
        pageData = _ref2[0],
        device = _ref2[1],
        location = _ref2[2],
        network = _ref2[3];

    (0, _assign2.default)(DEFAULT, {
        cuid: device.cuid,
        from: device.from,
        app_plat: _index.appPlat,
        channel: device.channel,
        sv: device.sv,
        os: device.os,
        model: device.model,
        screen: device.screen,
        city_id: location.cityId,
        loc_lat: location.locLat,
        loc_lng: location.locLng,
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        nettype: network.net_type
    });
    isReady = true;
    quene.forEach(function (v) {
        v();
    });
});

function pv(src) {
    proxy({
        da_src: src,
        da_act: 'ready'
    });
};

function click(src) {
    proxy({
        da_src: src,
        da_act: 'click'
    });
};

function show(src) {
    proxy({
        da_src: src,
        da_act: 'collect'
    });
};

exports.default = { pv: pv, click: click, show: show, send: proxy };