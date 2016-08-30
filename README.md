# bridge规范

1. 所有接口基于promise封装
2. 异步接口必须有超时时间，如果没有特殊情况超时时间为10s
3. promise都需要catch
4. 兼容平台：糯米、手百、地图、钱包、度秘


User-Agent:
地图
android  BDNuomiAppAndroid
    iOS  BDNuomiAppIOS

钱包
android  BDNuomiAppAndroid
    iOS  BDNuomiAppIOS


## 用法

还没想好用什么名字发布到npm
```javascript
import { device, location } from 'path/to/na-bridge'

device()
	.then((device) => {
	    console.log(device)
	})
	.catch((error) => {
	    console.log(error)
	})

// 需要依赖多个api的时候
Promise.all([device(), location()])
	.then(([device, location]) => {
	    console.log(device, location)
	})
	.catch((error) => {
	    console.log(error)
	})
```

开发的时候可以通过加载`path/to/na-bridge/na-env.js`来模拟na环境,如果用webpack可以在config中这么写
```javascript
module.exports = {
    entry: {
        app: [
            './src/main.js',
            'path/to/na-bridge/na-env.js'
        ]
    }
}
```