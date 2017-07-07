/* global describe it assert sinon before after */

// 模拟na环境
import '../src/nuomi-env.js'
// 引入外卖bridge
import * as bridge from '../src/bainuo.js'
sinon.assert.expose(assert, { prefix: '' })

describe('bainuo', () => {
  // 'ready', 'device', 'location', 'sendOnlineStat', 'removeOrderTraceItem', 'http', 'page', 'ui', 'network', 'share', 'shop', 'account', 'webview'

  describe('#ready', () => {
    it('promise ready should be resolved', () => {
      return bridge.ready().then(data => {
        assert.isObject(data)
      })
    })
  })

  // 需要获取特定数据的api
  let dataGetterApis = {
    device: ['client', 'cuid', 'sv', 'channel', 'screen', 'from', 'os', 'model', 'payPlats', 'refer'],
    location: ['lat', 'lng', 'address', 'cityId'],
    network: ['net_type']
  }
  Object.keys(dataGetterApis).forEach(api => {
    let properties = dataGetterApis[api]
    describe('#' + api, () => {
      let xhr
      let request
      before(function () {
        if (api === 'location') {
          xhr = sinon.useFakeXMLHttpRequest()
          xhr.onCreate = function (req) {
            request = req
          }
          setTimeout(function () {
            request.respond(
              200,
              { 'Content-Type': 'application/json' },
              '{ "error_no": 0,"result": {"cityCode":"131"} }'
            )
          }, 100)
        }
      })

      after(function () {
        if (api === 'location') {
          // Like before we must clean up when tampering with globals.
          xhr.restore()
        }
      })
      it('all ' + api + ' property has a value', () => {
        return bridge[api]().then(data => {
          properties.forEach(k => {
            assert.isString(data[k])
          })
        })
      })
    })
  })

  // 调用无返回值函数的api
  let noReturnDataApis = {
    sendOnlineStat: {},
    removeOrderTraceItem: {},
    share: {}
  }
  Object.keys(noReturnDataApis).forEach(api => {
    let params = noReturnDataApis[api]
    describe('#' + api, () => {
      it('promise ' + api + ' should be resolved', () => {
        return bridge[api](params).then(data => {
          assert.isOk(true)
        })
      })
    })
  })

  describe('#http.get', () => {
    var xhr, requests

    before(function () {
      xhr = sinon.useFakeXMLHttpRequest()
      requests = []
      xhr.onCreate = function (req) { requests.push(req) }
    })

    after(function () {
      // Like before we must clean up when tampering with globals.
      xhr.restore()
    })

    it('na-env is ok', () => {
      let params = {
        url: 'https://waimai.baidu.com/test-url',
        data: {data: 1}
      }
      let callback = sinon.spy()
      window.WMApp.network.getRequest(params, callback)
      assert.strictEqual(requests.length, 1)
    })
  })

  describe.skip('#page', () => {
    // 页面跳转相关，不好测
  })

  // UI相关的Api
  let UIApi = [
    'startLoading',
    'endLoading',
    'confirm',
    'toast'
  ]
  describe('#ui', () => {
    UIApi.forEach(api => {
      describe('#ui.' + api, () => {
        it('ui.' + api + ' should be a function', () => {
          assert.isFunction(bridge.ui[api])
        })
      })
    })
  })

  // 商户相关的Api
  let shopApi = [
    'addFavorite',
    'delFavorite'
  ]
  describe.skip('#shop', () => {
    shopApi.forEach(api => {
      describe('#shop.' + api, () => {
        let xhr
        before(function () {
          xhr = sinon.useFakeXMLHttpRequest()
          xhr.onCreate = function (req) {
            req.respond(
              200,
              { 'Content-Type': 'application/json' },
              '[{ "error_no": 0 }]'
            )
          }
        })

        after(function () {
          // Like before we must clean up when tampering with globals.
          xhr.restore()
        })
        it('promise shop.' + api + ' should be a resolved', () => {
          return bridge.shop[api]({}).then(data => {
            assert.isOk(true)
          })
        })
      })
    })
  })

  describe('#account', () => {
    describe('#account.login', () => {
      it('should be resolved', () => {
        return bridge.account.login().then(data => {
          assert.isOk(true)
        })
      })
    })
    describe('#account.getInfo', () => {
      it('all account info property has a value', () => {
        return bridge.account.getInfo().then(data => {
          assert.isObject(data)
          let properties = ['uid', 'username', 'displayname', 'bduss']
          properties.forEach(k => {
            assert.isString(data[k])
          })
        })
      })
    })
  })

  // webview相关的Api
  let webviewApi = [
    'startLoading',
    'endLoading',
    'open',
    'close',
    'pageshow'
  ]
  describe('#webview', () => {
    webviewApi.forEach(api => {
      describe('#webview.' + api, () => {
        it('webview.' + api + ' should be a function', () => {
          assert.isFunction(bridge.webview[api])
        })
      })
    })
  })
  // end
})

// assert.strictEqual(true, true, 'these booleans are strictly equal')
