'use strict';
/**
  * 目标，提供一个日志打点的框架
  *
 */
;(function (ctx, name, defination) {
  ctx[name] = defination(ctx);
})(window, 'Tracker', function(win) {
  var doc = win.document;
  var encode = win.encodeURIComponent;
  var decode = win.decodeURIComponent;

  function each(obj, callback) {
    if (typeOf(obj) === 'array') {
      for (var i = 0, max = obj.length; i < max; i++) {
        callback.call(obj, obj[i], i);
      }
    } else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          callback.call(obj, obj[key], key);
        }
      }
    }
  }
  function typeOf(obj) {
    return Object.prototype.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
  }
  function toArray(obj) {
    return [].slice.call(obj, 0);
  }
  function trim(str) {
    if (str) {
      return str.trim ? str.trim() : str.toString().replace(/^\s+|\s+$/g, '');
    }
    return '';
  }
  function extend(obj) {
    var args = toArray(arguments);
    var obj = args.shift();
    each(args, function(sour) {
      each(sour, function(val, key) {
        obj[key] = val;
      });
    });
    return obj;
  }
  function toQueryString(obj, isListMode) {
    var params = [];
    each(obj, function(val, key) {
      var type = typeOf(val);
      switch (type) {
        case 'object':
          var str = toQueryString(val).replace(/([^=&]?)=/g, key + '%5B$1%5D=');
          params.push(str);
          break;
        case 'array':
          var res = [];
          each(val, function(v) {
            res.push(key + (isListMode ? '' : '%5B%5D') + '=' + encode(v));
          });
          params.push(res.join('&'));
          break;
        default:
          params.push(key + '=' + encode(val));
      }
    });
    return params.join('&');
  }
  function addEvent(el, evt, fn, isBubble) {
    if (el.addEventListener) {
      el.addEventListener(evt, fn, !!isBubble);
    } else {
      el.attachEvent('on' + evt, fn);
    }
  }
  function removeEvent(el, evt, fn, isBubble) {
    if (el.removeEventListener) {
      el.removeEventListener(evt, fn, !!isBubble);
    } else {
      el.detachEvent('on' + evt, fn);
    }
  }
  function getParentByAttr(elem, attr) {
    var parent = elem;
    while (parent) {
      var attributes = parent.attributes;
      if (!attributes) {
        break;
      }
      if (attr in attributes) {
        return parent;
      }
      parent = parent.parentNode;
    }
    return null;
  }
  var Cookie = {
    read: function(key) {
      var res = doc.cookie.match(new RegExp(encode(key) + '=([^;]+)'));
      return res ? decode(res[1]) : '';
    },
    write: function(key, val, day) {
      var expires = '';
      if (day) {
        var date = new Date;
        date.setDate(date.getDate() + day);
        expires = 'expires=' + date.toGMTString();
      }
      doc.cookie = key + '=' + encode(val) + ';' + expires;
    },
    remove: function(key) {
      this.write(key, null, -1);
    }
  };

  // 统计属性转换 map
  var StatAttributeMap = {
    'EA': function(adapter, options) {
      // params = ['.xxx', 'serverid']
      var elem = options.root;
      var params = options.params;
      var selector = params[0];
      if (selector) {
        elem = adapter.queryChild(options.root, selector);
      }
      return elem && elem.getAttribute(params[1]) || '';
    },
    'ET': function(adapter, options) {
      var elem = options.root;
      var params = options.params;
      var selector = params[0];
      if (selector) {
        elem = adapter.queryChild(options.root, selector);
      }
      return elem && adapter.getText(elem) || '';
    },
    'G': function(adapter, options) {
      var val = '';
      try {
        var expr = options.params[0];
        val = eval(expr);
      } catch (e) { }
      return val;
    }
  };

  // 元素选择适配器
  var Adapter = {
    // 请返回单个dom元素
    querySelector: function(selector) {
      return document.querySelector(selector);
    },
    // 请返回单个dom元素
    queryChild: function(root, selector) {
      return root.querySelector(selector);
    },
    getAttribute: function(ele, attr) {
      return ele.getAttribute(attr);
    },
    getHtml: function(ele) {
      return ele.innerHTML;
    },
    getText: function(ele) {
      return ele.innerText;
    }
  };

  function Tracker(options, adapter) {
    var ctx = this;
    options = extend({
      url: '',
      // 统计属性
      statAttr: 'stat',
      // 统计的参数
      statParam: 'statparam',
      // 停止统计的标志
      stopAttr: 'stopstate',
      // 是否需要指纹
      fingerprint: false,
      // 特殊属性切割符号，如 G_EquipInfo.xxx
      splitTag: '_',
      // 如果没有值，默认返回神马?
      defaultValue: '-',
      data: {}
    }, options);

    ctx.url = options.url;
    ctx.dataSend = options.data;
    ctx.splitTag = options.splitTag;
    ctx.statAttr = options.statAttr;
    ctx.stopAttr = options.stopAttr;
    ctx.statParam = options.statParam;
    ctx.fingerprint = options.fingerprint;
    ctx.defaultValue = options.defaultValue;
    ctx.isDebug = false;
  }

  Tracker.prototype = {
    _log: function() {
      var args = arguments;
      this.isDebug && window.console && console.log.apply(console, args);
    },

    getFingerprint: function() {
      var ctx = this;
      if (!ctx.fingerprintValue) {
        ctx.fingerprintValue = (new Fingerprint()).get();
      }
      return ctx.fingerprintValue;
    },

    bindClick: function(elRoot, defaultOptions) {
      var ctx = this;
      var options = extend({
        data: '',
        event: 'click',
        statAttr: ctx.statAttr,
        stopAttr: ctx.stopAttr,
        statParam: ctx.statParam,
        fingerprint: ctx.fingerprint,
        isListModeSend: false
      }, defaultOptions || {});

      var statAttr = options.statAttr;
      var stopAttr = options.stopAttr;
      var statParam = options.statParam;

      elRoot = elRoot || doc;
      elRoot.setAttribute && elRoot.setAttribute(stopAttr, '');

      function clickHandler(e) {
        var target = e.target || e.srcElement;
        var attributes = target.attributes;

        // 元素没有统计属性，而且父元素也没有，则不统计
        if ((!attributes || !(statAttr in attributes))) {
          target = getParentByAttr(target, statAttr);
          if (!target) {
            return;
          }
        }

        // 从当前元素，网上寻找的所有属性
        var allAttr = ctx.getAllStat(target, statParam, stopAttr);
        // 当前元素的属性
        var currentStatAttr = ctx.compileStat(target, target.getAttribute(statAttr)) || {};

        // 默认数据 = Tracker 默认数据 + bindClick 的默认数据
        var dataDefault = extend(
          ctx.compileStat(elRoot, ctx.dataSend) || {},
          ctx.compileStat(elRoot, options.data) || {}
        );
        // 是否需要指纹 + 默认数据 + 当前 stat属性 + statparam属性
        var data = extend(options.fingerprint ? { fingerprint: ctx.getFingerprint() } : {}, dataDefault, currentStatAttr, allAttr);

        ctx._log(data);
        ctx.sendLog(data, options.isListModeSend);
      }

      if (elRoot.addEventListener) {
        addEvent(elRoot, options.event, clickHandler, true);
      } else {
        elRoot.attachEvent('onmouseup', clickHandler);
      }
    },

    getAllStat: function(elem, statParam, stopAttr) {
      // <div stat="ip: ET_#client_ip; version: 100" />
      // equip_serverid: EA_a img, data_serverid;  从当前元素开始选择， Element Attribute
      // ip: ET_#client_ip 子元素的文本，Element Text
      // serverid: G_ServerInfo.serverid 全局变量，如果是 function，则传入当前元素与tracker，并且运行, Global
      // ver: 100 静态字段

      var ctx = this;
      var list = [];
      var parent = elem;

      // 一直寻找到根目录或拥有停止属性的元素，找到所有的需要配置的元素
      var shouldStop = false;
      while (parent && parent != doc) {
        var attr = parent.getAttribute(statParam);
        if (attr) {
          list.push({
            elem: parent,
            attr: attr
          });
        }
        parent = parent.parentNode;

        if (shouldStop) {
          break;
        }
        var attributes = parent.attributes;
        if (stopAttr && (!attributes || stopAttr in attributes)) {
          shouldStop = true;
        }
      }
      // 将数据倒转，越外层，应该优先级更低
      list.reverse();

      // 以分号间隔，是每个独立的表达式
      var res = {};
      each(list, function (item) {
        extend(res, ctx.compileStat(item.elem, item.attr) || {});
      });

      return res;
    },

    compileStat: function(elem, stat) {
      if (typeOf(elem) === 'string') {
        stat = elem;
        elem = null;
      }
      if (!stat) {
        return;
      }

      var ctx = this;
      var type = typeOf(stat);
      var res = {};
      var root = elem;
      var TAG = ctx.splitTag;
      var DEF = ctx.defaultValue;

      switch (type) {
        case 'string':
          // ip: ET_#client_ip; type: web;
          // 以分号间隔表达式，冒号为key/value间隔
          var attrs = stat.split(';');
          each(attrs, function(str) {
            var idx = str.indexOf(':');
            if (idx < 0) {
              idx = 0;
            }
            var key = trim(str.slice(0, idx));
            var val = trim(str.slice(idx + 1));
            if (!key) {
              return;
            }

            // TAG = '_'
            idx = val.indexOf(TAG);
            // 从 ip: ET_#client_ip 中，找到 ET 和 #client_ip
            var type = '';
            if (idx > 0) {
              // 非 TAG 开头，并且 TAG 存在，则获取相关的 type 和 val
              type = val.slice(0, idx);
              val = val.slice(idx + 1);
            } else if (idx == 0){
              // 以 TAG 开头，后面的内容，不做任何处理
              val = val.slice(1);
              return res[key] = val || DEF;
            }

            // 以逗号间隔，是函数要运行的参数
            var params = val.split(',');
            each(params, function (v, i) { params[i] = trim(v); });

            // 属性转换，如果在属性 MAP 中不存在，则原值返回
            if (type) {
              if (StatAttributeMap[type]) {
                val = StatAttributeMap[type].call(ctx, Adapter, {
                  root: root,
                  params: params,
                  key: key,
                  value: val,
                  type: type
                });
              } else {
                val = type + TAG + val;
              }
            }
            return res[key] = val || DEF;
          });
          break;
        case 'object':
          each(stat, function(val, key) {
            var typeVal = typeOf(val);
            switch (typeVal) {
              case 'string':
                extend(res, ctx.compileStat(root, key + ':' + val));
                break;
              case 'object':
                var obj = (res[key] || {});
                res[key] = extend(obj, ctx.compileStat(root, val));
                break;
              case 'function':
                res[key] = val.call(ctx, Adapter, { root: root, key: key });
                break;
              default:
                res[key] = val || DEF;
            }
          });
          break;
      }

      return res;
    },

    sendLog: function(params, callback, isListMode) {
      var ctx = this;
      var url = ctx.url;
      var typeCallback = typeOf(callback);

      switch (typeCallback) {
        case 'function':
          break;
        case 'object':
          var options = callback;
          isListMode = !!options.isListMode;
          callback = options.callback;
          url = options.url;
          break;
        default:
          isListMode = !!callback;
          callback = null;
      }

      var img = new Image();
      img.onload = img.onerror = function() {
        callback && callback();
        img.onload = img.onerror = null;
      };

      var qs = toQueryString(extend({v: Math.random()}, params || {}), isListMode);
      img.src = url + (url.indexOf('?') >= 0 ? '' : '?') + qs;
    }
  };

  Tracker.StatAttributeMap = StatAttributeMap;
  Tracker.addConverter = function(key, fn) {
    StatAttributeMap[key] = typeOf(fn) === 'string' ? StatAttributeMap[fn] : fn;
    return this;
  };

  Tracker.setAdapter = function(adapter) {
    extend(Adapter, adapter || {});
  };

  return Tracker;
});


// 官网: http://valve.github.io/fingerprintjs/
;(function (name, context, definition) {
  context[name] = definition();
})('Fingerprint', this, function () {
  'use strict';

  var Fingerprint = function (options) {
    var nativeForEach, nativeMap;
    nativeForEach = Array.prototype.forEach;
    nativeMap = Array.prototype.map;

    this.each = function (obj, iterator, context) {
      if (obj === null) {
        return;
      }
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (iterator.call(context, obj[key], key, obj) === {}) return;
          }
        }
      }
    };

    this.map = function(obj, iterator, context) {
      var results = [];
      // Not using strict equality so that this acts as a
      // shortcut to checking for `null` and `undefined`.
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      this.each(obj, function(value, index, list) {
        results[results.length] = iterator.call(context, value, index, list);
      });
      return results;
    };

    if (typeof options == 'object'){
      this.hasher = options.hasher;
      this.screen_resolution = options.screen_resolution;
      this.screen_orientation = options.screen_orientation;
      this.canvas = options.canvas;
      this.ie_activex = options.ie_activex;
    } else if(typeof options == 'function'){
      this.hasher = options;
    }
  };

  Fingerprint.prototype = {
    get: function(){
      var keys = [];
      keys.push(navigator.userAgent);
      keys.push(navigator.language);
      keys.push(screen.colorDepth);
      if (this.screen_resolution) {
        var resolution = this.getScreenResolution();
        if (typeof resolution !== 'undefined'){ // headless browsers, such as phantomjs
          keys.push(resolution.join('x'));
        }
      }
      keys.push(new Date().getTimezoneOffset());
      keys.push(this.hasSessionStorage());
      keys.push(this.hasLocalStorage());
      keys.push(!!window.indexedDB);
      //body might not be defined at this point or removed programmatically
      if(document.body){
        keys.push(typeof(document.body.addBehavior));
      } else {
        keys.push(typeof undefined);
      }
      keys.push(typeof(window.openDatabase));
      keys.push(navigator.cpuClass);
      keys.push(navigator.platform);
      keys.push(navigator.doNotTrack);
      keys.push(this.getPluginsString());
      if(this.canvas && this.isCanvasSupported()){
        keys.push(this.getCanvasFingerprint());
      }
      if(this.hasher){
        return this.hasher(keys.join('###'), 31);
      } else {
        return this.murmurhash3_32_gc(keys.join('###'), 31);
      }
    },

    /**
     * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
     *
     * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {string} key ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */

    murmurhash3_32_gc: function(key, seed) {
      var remainder, bytes, h1, h1b, c1, c2, k1, i;

      remainder = key.length & 3; // key.length % 4
      bytes = key.length - remainder;
      h1 = seed;
      c1 = 0xcc9e2d51;
      c2 = 0x1b873593;
      i = 0;

      while (i < bytes) {
          k1 =
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
      }

      k1 = 0;

      switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);

        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
      }

      h1 ^= key.length;

      h1 ^= h1 >>> 16;
      h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= h1 >>> 13;
      h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
      h1 ^= h1 >>> 16;

      return h1 >>> 0;
    },

    // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
    hasLocalStorage: function () {
      try{
        return !!window.localStorage;
      } catch(e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    hasSessionStorage: function () {
      try{
        return !!window.sessionStorage;
      } catch(e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    isCanvasSupported: function () {
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    },

    isIE: function () {
      if(navigator.appName === 'Microsoft Internet Explorer') {
        return true;
      } else if(navigator.appName === 'Netscape' && /Trident/.test(navigator.userAgent)){// IE 11
        return true;
      }
      return false;
    },

    getPluginsString: function () {
      if(this.isIE() && this.ie_activex){
        return this.getIEPluginsString();
      } else {
        return this.getRegularPluginsString();
      }
    },

    getRegularPluginsString: function () {
      return this.map(navigator.plugins, function (p) {
        var mimeTypes = this.map(p, function(mt){
          return [mt.type, mt.suffixes].join('~');
        }).join(',');
        return [p.name, p.description, mimeTypes].join('::');
      }, this).join(';');
    },

    getIEPluginsString: function () {
      if(window.ActiveXObject){
        var names = ['ShockwaveFlash.ShockwaveFlash',//flash plugin
          'AcroPDF.PDF', // Adobe PDF reader 7+
          'PDF.PdfCtrl', // Adobe PDF reader 6 and earlier, brrr
          'QuickTime.QuickTime', // QuickTime
          // 5 versions of real players
          'rmocx.RealPlayer G2 Control',
          'rmocx.RealPlayer G2 Control.1',
          'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
          'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
          'RealPlayer',
          'SWCtl.SWCtl', // ShockWave player
          'WMPlayer.OCX', // Windows media player
          'AgControl.AgControl', // Silverlight
          'Skype.Detection'];

        // starting to detect plugins in IE
        return this.map(names, function(name){
          try{
            new ActiveXObject(name);
            return name;
          } catch(e){
            return null;
          }
        }).join(';');
      } else {
        return ""; // behavior prior version 0.5.0, not breaking backwards compat.
      }
    },

    getScreenResolution: function () {
      var resolution;
       if(this.screen_orientation){
         resolution = (screen.height > screen.width) ? [screen.height, screen.width] : [screen.width, screen.height];
       }else{
         resolution = [screen.height, screen.width];
       }
       return resolution;
    },

    getCanvasFingerprint: function () {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      // https://www.browserleaks.com/canvas#how-does-it-work
      var txt = 'http://valve.github.io';
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125,1,62,20);
      ctx.fillStyle = "#069";
      ctx.fillText(txt, 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText(txt, 4, 17);
      return canvas.toDataURL();
    }
  };

  return Fingerprint;
});
