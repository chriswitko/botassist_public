(function () {
  var BotAssist = function () {
    var options = {}
    var leadboxes = {}
    var background = null
    var icon_iframe;
    var content_iframe;

    function addEvent (object, type, handler) {
      var method
      if (object && type && handler) {
        method = object.addEventListener ? 'addEventListener' : object.attachEvent ? 'attachEvent' : ''
        type = method === 'addEventListener' ? type : 'on' + type
        if (method) {
          object[method](type, function (event) {
            event = event || window.event
            handler.apply(object, [event])
          })
          return true
        }
      }
      return false
    }

    function hide (id) {
      id = id || (getToolByType('signup') || getToolByType('coupon'))
      if (options.demo) {
        id = getToolByType('reminder') || id
      }
      if (!id) return

      // hide frame
      if (icon_iframe) {
        icon_iframe.style.display = 'none'
        delete icon_iframe
      }

      if (background) {
        background.style.display = 'none'
      }

      if (options.events && options.events.onClose) {
        options.events.onClose()
      }
    }

    function initTool (params) {
      var id = params.bot_id || options.bot_id;

      var url = 'https://s3.amazonaws.com/popupdelivery/apps/' + params.bot_id + '.html?cookie_id=' + getCookie('pd_pixel') + '&site_id=' + params.site_id + '&ts=' + new Date().valueOf()
      if (options.demo && options.bot_id) {
        url = (options.env === 'dev' ? 'http://localhost:3000' : 'https://api.popupdelivery.com') + '/botassi.st.html?bot_id=' + options.bot_id + '&demo=1' + (options.demo_open ? '&demo_open=' + options.demo_open : '') + (options.language ? '&language=' + options.language : '') + (options.env === 'dev' ? '&env=dev' : '')
      }

      icon_iframe = document.createElement('iframe')
      icon_iframe.src = '/botassi.st.html'
      icon_iframe.scrolling = 'no'
      icon_iframe.style.position = 'fixed'
      icon_iframe.style.overflow = 'hidden'
      icon_iframe.style.width = '95px'
      icon_iframe.style.height = '95px'
      icon_iframe.style.display = 'block'
      icon_iframe.style.border = 'none'
      icon_iframe.style.zIndex = '2147483647'

      icon_iframe.onload = function () {
        icon_iframe.onload = null
        if (options.events && options.events.onLoad) {
          options.events.onLoad()
        }
      }

      content_iframe = document.createElement('iframe')
      // content_iframe.src = '/botassi.st.content.html'
      content_iframe.scrolling = 'no'
      content_iframe.style.position = 'fixed'
      content_iframe.style.overflow = 'hidden'
      content_iframe.style.width = '0px'
      content_iframe.style.height = '0px'
      content_iframe.style.display = 'none'
      content_iframe.style.border = 'none'
      content_iframe.style.zIndex = '2147483647'

      content_iframe.onload = function () {
        content_iframe.onload = null
        if (options.events && options.events.onLoad) {
          options.events.onLoad()
        }
      }

      var container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.width = 0;
      container.style.height = 0;
      container.style.bottom = 0;
      container.style.zIndex = 2147483647;

      container.appendChild(content_iframe);
      container.appendChild(icon_iframe);

      document.body.appendChild(container)
    }

    // generates a v4 uuid
    function uuid () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = ((new Date())
          .getTime() + Math.random() * 16) % 16 | 0
        return (c === 'x' ? r : (r & 0x7 | 0x8))
          .toString(16)
      })
    }

    function tinyLeadGetSize (callback) {
      var body = options.anchor ? document.getElementById(options.anchor) : window.document.body
      var doc = window.document.documentElement
      var documentWidth = Math.max(body.scrollWidth, doc.scrollWidth, body.offsetWidth, doc.offsetWidth, doc.clientWidth)
      var documentHeight = Math.max(body.scrollHeight, doc.scrollHeight, body.offsetHeight, doc.offsetHeight, doc.clientHeight)
      var viewportWidth = window.innerWidth || doc.clientWidth || body.clientWidth
      var viewportHeight = window.innerHeight || doc.clientWidth || body.clientWidth
      if (options.anchor) {
        viewportWidth = body.clientWidth
      }

      var workaround = window.setTimeout(function () {
        workaround = null
        window.clearTimeout(workaround)
        callback(documentWidth, documentHeight, viewportWidth, viewportHeight)
      }, 100)
    }

    function setupPixel () {
      // call analytics
      var pixelName = 'pd_pixel'
      var uid = uuid()

      if (!getCookie(pixelName)) {
        setCookie(pixelName, uid, {
          path: '/',
          expires: 730
        })
      }
    }

    function getCookie (key) {
      if (!key) {
        return
      }
      var cs = document.cookie.split(';')
      var holder = {}
      var c, name, value, result, i, l
      for (i = 0, l = cs.length; i < l; i++) {
        c = cs[i].replace(/ /g, '').split('=')
        name = c[0]
        value = c[1]
        holder[name] = value
      }
      switch (true) {
        case key instanceof RegExp:
          result = {}
          for (i in holder) {
            if (holder.hasOwnProperty(i) && key.test(i)) {
              result[i] = holder[i]
            }
          }
          break
        case typeof key === 'string':
          result = holder[key]
          break
        default:
          result = null
      }
      return result
    }

    function setCookie (key, value, opt) {
      if (!key || value === undefined) {
        return
      }
      var expires
      opt = opt || {}
      if (typeof opt.expires === 'number') {
        var days = opt.expires
        var time = new Date()
        time.setDate(time.getDate() + days)
        expires = time.toUTCString()
      }
      value = value.toString()
      return (document.cookie = [
        encodeURIComponent(key), '=', encodeURIComponent(value),
        expires ? '; expires=' + expires : '',
        opt.path ? '; path=' + opt.path : '',
        opt.domain ? '; domain=' + opt.domain : '',
        opt.secure ? '; secure' : ''
      ].join(''))
    }

    function uuidFs () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = ((new Date())
          .getTime() + Math.random() * 16) % 16 | 0
        return (c === 'x' ? r : (r & 0x7 | 0x8))
          .toString(16)
      })
    }

    function setUpCookie () {
      if (!getCookie('pd_pixel')) {
        setCookie('pd_pixel', uuidFs(), {
          path: '/',
          expires: 730
        })
      }
    }

    function serialize (obj) {
      var str = []
      obj = obj || {}
      for (var p in obj) {
        if (obj.hasOwnProperty(p) && (obj[p] || '').toString() !== '') {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
        }
      }
      return str.join('&')
    }

    function apiCall () {
      var safetyUrl = (options.env === 'dev' ? 'http://localhost:3000' : 'https://api.popupdelivery.com') + '/api/delivery'

      var isMobile = navigator.userAgent.match(/(iPhone)|(iPad)|(android)|(webOS)/i)
      var lang = window.navigator.languages ? window.navigator.languages[0] : null
      lang = lang || window.navigator.language || window.navigator.browserLanguage || window.navigator.userLanguage

      if (lang.indexOf('-') !== -1) {
        lang = lang.split('-')[0]
      }

      if (lang.indexOf('_') !== -1) {
        lang = lang.split('_')[0]
      }

      var attrs = {
        cookie_id: getCookie('pd_pixel'),
        site_id: options.site_id,
        referer: document.referrer,
        is_mobile: options.isMobile || isMobile ? 1 : 0,
        language: options.language || lang,
        email: options.email || ''
      }

      var skip = ['events']

      for (var i in options) {
        if (skip.indexOf(i) < 0 && !attrs.hasOwnProperty(i)) {
          attrs[i] = options[i]
        }
      }

      if (attrs.demo && !attrs.bot_id) {
        return
      }

      safetyUrl += '?' + serialize(attrs)

      var script = document.createElement('script')
      script.src = safetyUrl
      // console.log('options.bot_id', options.bot_id);
      show({bot_id: options.bot_id});
      // document.getElementsByTagName('head')[0].appendChild(script)
    }

    function extendOptions (o) {
      for (var i in o) {
        options[i] = o[i]
      }
    }

    function show (o) {
      setupPixel()
      initTool(o)
    }

    function sendMessage (action, o) {
      try {
        if (icon_iframe) {
          icon_iframe.contentWindow.postMessage({type: action, value: o}, '*')
        }
      } catch (e) {
        if (icon_iframe) {
          icon_iframe.contentWindow.postMessage({type: action, value: o}, '*')
        }
      }
    }

    this.getVisitorId = function () {
      return getCookie('pd_pixel')
    }

    this.run = function (action, o) {
      extendOptions(o)
      options.action = action
      switch (action) {
        case 'loaded':
          sendMessage(action, o)
          break
        case 'loading':
          sendMessage(action, o)
          break
        case 'reload':
          sendMessage(action, o)
          break
        case 'close_messages':
          sendMessage(action, o)
          closeMessages();
          if (options.events && options.events.onClose) {
            options.events.onClose()
          }
          break
        case 'open_messages':
          sendMessage(action, o)
          openMessages();
          if (options.events && options.events.onOpen) {
            options.events.onOpen()
          }
          break
        case 'hide':
          hide(o.bot_id)
          break
        case 'show':
          show(o)
          break
        case 'update':
          apiCall()
          break
        case 'boot':
          apiCall()
          break
        default:
          return
      }
    }

    this.tinyLeadGetPosition = function (e, cb) {
      var posx = 0
      var posy = 0

      e = e || window.event

      if (e.pageX || e.pageY) {
        posx = e.pageX
        posy = e.pageY - document.body.scrollTop - document.documentElement.scrollTop
      } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
      }

      if (posy < 100) {
        return cb()
      }

      return {
        x: posx,
        y: posy
      }
    }

    this.resize = function () {
      tinyLeadGetSize(function (documentWidth, documentHeight, width, height) {
        resizeTool(icon_iframe)
      })
    }

    this.hide = hide

    this.boot = function () {
      setUpCookie()

      this.run('boot', window.botAssistSettings || {})
    }

    function resizeTool (o) {
      // console.log('resizeTool', o);
      icon_iframe.style.width = '75px'
      icon_iframe.style.height = '75px'
      icon_iframe.style.bottom = '20px';
      icon_iframe.style.right = '20px';

      content_iframe.style.width = o.width + 'px'
      content_iframe.style.height = o.height + 'px'
      content_iframe.style.bottom = '95px';
      content_iframe.style.right = '20px';
    }

    function openMessages() {
      content_iframe.src = '/botassi.st.content.html'
      content_iframe.style.display = 'block';
    }

    function closeMessages() {
      content_iframe.src = ''
      content_iframe.style.display = 'none';
    }

    var onMessageHandler = function (event) {
      // console.log('main event', event.data);
      
      if (event.data && event.data.type === 'toggle_messages') {
        if(content_iframe.style.display === 'none') {
          openMessages(event.data.value)
        } else {
          closeMessages(event.data.value)
        }
      }
      if (event.data && event.data.type === 'bot_loading') {
        sendMessage('bot_loading', event.data)
      }
      if (event.data && event.data.type === 'bot_loaded') {
        sendMessage('bot_loaded', event.data)
      }
      if (event.data && event.data.type === 'open_messages') {
        openMessages(event.data.value)
      }
      if (event.data && event.data.type === 'close_messages') {
        closeMessages(event.data.value)
      }
      if (event.data && event.data.type === 'load_icon') {
        resizeTool(event.data.value)
      }
      if (event.data && event.data.type === 'loaded') {
        resizeTool(event.data.value)
        sendMessage('bot_loaded', event.data)
      }
      if (event.data && event.data.type === 'hide') {
        hide(event.data.value.bot_id)
      }
      if (event.data && event.data.type === 'submited') {
        if (options.events && options.events.onSubmit) {
          options.events.onSubmit()
        }
      }
    }

    // setup window handlers
    addEvent(window, 'message', onMessageHandler)
  }

  function resized () {
    if (window.BotAssist) {
      window.BotAssist.resize()
    }
  }

  if (window.addEventListener) {
    window.addEventListener('resize', resized)
  } else if (window.attachEvent) {
    // tender love & care for internet explorer
    window.attachEvent('onresize', resized)
  } else {
    var oldResize = window.onresize

    window.onresize = function (e) {
      resized()
      if (typeof oldResize === 'function') {
        oldResize(e)
      }
    }
  }

  if (!window.BotAssist) {
    window.BotAssist = new BotAssist()
    window.BotAssist.boot()
  }
})()
