function is(ua) {
    return new RegExp(ua, 'i').test(navigator.userAgent);
}
// var isWeixin = is('micromessenger');
var isBdwm = is('wmapp');
// 糯米      BDNuomiAppAndroid BDNuomiAppIOS
// 糯米渠道  BDNuomiAppAndroid BDNuomiAppIOS
var isBainuo = is('BDNuomiApp');

import * as bdwm from './bdwm';
import * as bainuo from './bainuo';

var env;
if (isBdwm) {
    env = bdwm;
} else if (isBainuo) {
    env = bainuo;
} else {
    env = bdwm;
}

var { ready, device, location, http, page, ui } = env;
export { ready, device, location, http, page, ui }
