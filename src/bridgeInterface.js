const BridgeInterface = {
  'ready': 'METHOD',
  'device': 'METHOD',
  'location': 'METHOD',
  'sendOnlineStat': 'METHOD',
  'removeOrderTraceItem': 'METHOD',

  'http': 'OBJECT',
  'http.get': 'METHOD',
  'http.post': 'METHOD',

  'page': 'OBJECT',
  'page.close': 'METHOD',
  'page.open': 'METHOD',
  'page.onBack': 'METHOD',
  'page.setPageId': 'METHOD',
  'page.home': 'METHOD',
  'page.search': 'METHOD',
  'page.index': 'METHOD',
  'page.cart': 'METHOD',
  'page.shop': 'METHOD',
  'page.shopSearch': 'METHOD',
  'page.item': 'METHOD',
  'page.shopDetail': 'METHOD',
  'page.shopComment': 'METHOD',
  'page.setTitleBar': 'METHOD',
  'page.confirmOrder': 'METHOD',
  'page.pushRefresh': 'METHOD',
  'page.closePushRefresh': 'METHOD',

  'ui': 'OBJECT',
  'ui.startLoading': 'METHOD',
  'ui.endLoading': 'METHOD',
  'ui.confirm': 'METHOD',
  'ui.toast': 'METHOD',

  'network': 'METHOD',
  'share': 'METHOD',

  'shop': 'OBJECT',
  'shop.addFavorite': 'METHOD',
  'shop.delFavorite': 'METHOD',

  'account': 'OBJECT',
  'account.login': 'METHOD',
  'account.getInfo': 'METHOD',

  'webview': 'OBJECT',
  'webview.startLoading': 'METHOD',
  'webview.endLoading': 'METHOD',
  'webview.open': 'METHOD',
  'webview.close': 'METHOD',
  'webview.pageshow': 'METHOD'
}

const isMethod = validation => validation.indexOf('METHOD') > -1
const isObject = validation => validation.indexOf('OBJECT') > -1

const validateOverride  = bridge => {
  Object.keys(BridgeInterface).forEach(field => {
    const validation = BridgeInterface[field]

    let chain = field.split('.')
    let step
    let path = bridge
    for (let i = 0; i < chain.length; i++) {
      step = chain[i]
      if (step && path && path[step]) {
        path = path[step]
      } else {
        throw new Error(`bridge - ${field} is required`)
      }
      if (i === chain.length - 1) {
        // only check the last field
        // check type
        if (isMethod(validation) && typeof path !== 'function') {
          throw new Error(`bridge - ${field} must be function`)
        } else if (isObject(validation) && typeof path !== 'object') {
          throw new Error(`bridge - ${field} must be object`)
        }
      }
    }
  })
  return true
}

export default validateOverride
