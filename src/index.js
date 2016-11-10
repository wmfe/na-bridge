function is(ua) {
    return new RegExp(ua, 'i').test(navigator.userAgent);
}
// let isWeixin = is('micromessenger');
let isBdwm = is('wmapp');
// 糯米      BDNuomiAppAndroid BDNuomiAppIOS
// 糯米渠道  BDNuomiAppAndroid BDNuomiAppIOS
let isBainuo = is('BDNuomiApp') || window.location.search.indexOf('env=nuomi') >= 0;

import * as bdwm from './bdwm';
import * as bainuo from './bainuo';

let env;
let envName;
if (isBdwm) {
    env = bdwm;
    envName = 'bdwm';
}
else if (isBainuo) {
    env = bainuo;
    envName = 'bainuo';
}
else {
    env = bdwm;
    envName = 'bdwm';
}

let {ready, device, location, http, page, ui, network, share, shop, account, webview} = env;

export {ready, device, location, http, page, ui, network, share, shop, account, webview, envName};
