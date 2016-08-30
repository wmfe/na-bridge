# bridge规范

1. 所有接口基于promise封装
2. 异步接口必须有超时时间，如果没有特殊情况超时时间为10s
3. promise都需要catch
4. 糯米、手百、地图、钱包、度秘


各个版本（iOS, Android）的糯米 webview 有自定义的 userAgent 吗？是什么？

地图android  User-Agent: BDNuomiAppAndroid
	iOS		 User-Agent: BDNuomiAppIOS

钱包         User-Agent: BDNuomiAppAndroid
	iOS		 User-Agent: BDNuomiAppIOS


## 用法

```javascript
Promise.all([device(), location()])
	.then(([device, location]) => {
	    console.log(device, location)
	})
	.catch((error) => {
	    console.log(error)
	})
```

```javascript
device()
	.then((device) => {
	    console.log(device)
	})
	.catch((error) => {
	    console.log(error)
	})
```