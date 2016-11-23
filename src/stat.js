/**
 * @see http://wiki.baidu.com/pages/viewpage.action?pageId=137571109
 * da_src 商超最好以wmcommodity.开头
 */
import {ready, device, location, network, appPlat} from './index';

function serialize(object) {
    let output = [];
    if (object !== undefined && object !== null) {
        for (let key in object) {
            if (object.hasOwnProperty(key) && object[key] !== undefined) {
                output.push(encodeURIComponent(key) + '=' + encodeURIComponent(object[key]));
            }
        }
    }
    return output.join('&');
};

// let params = (function () {
//     let search = window.location.search.replace(/^\?/, '');
//     let params = {};
//     if (search) {
//         search.split('&').forEach(function (v) {
//             let param = v.split('=');
//             params[param[0]] = decodeURIComponent(param[1] || '');
//         });
//     }
//     return params;
// })();

let DEFAULT = {
    da_src: 'default',
    da_act: 'ready',
    baiduid: document.cookie.replace(/(?:(?:^|.*;\s*)BAIDUID=\s*([^;]*).*$)|^.*$/, '$1'),
    da_refer: '',
    da_trace: ''
};

function send(stat) {
    let query = serialize(Object.assign({da_time: Date.now()}, DEFAULT, stat));
    let image = new Image();
    image.onload = image.onerror = function () {
        image = null;
    };
    image.src = 'http://log.waimai.baidu.com/static/transparent.gif?' + query;
}

let isReady = false;
let quene = [];
function proxy(stat) {
    if (isReady) {
        send(stat);
    }
    else {
        quene.push(send.bind(null, stat));
    }
}

Promise.all([ready(), device(), location(), network()])
    .then(([pageData, device, location, network]) => {
        Object.assign(DEFAULT, {
            cuid: device.cuid,
            from: device.from,
            app_plat: appPlat,
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
        quene.forEach(v => {
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

export default {pv, click, show, send: proxy};
