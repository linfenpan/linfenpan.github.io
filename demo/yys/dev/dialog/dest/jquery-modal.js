
/**
  @rely: jQuery
  @author: da宗熊
  @version: 1.0.0
  @lastModify: 2017/6/27
*/

+(function($) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MODAL_EVENTS = {
  OPEN: 'open',
  CLOSE: 'close',
  DESTROY: 'destroy'
};

var $body = null;

function getBody() {
  if (!$body) {
    $body = $('body');
  }
  return $body;
}

// 弹层层次管理
var layerCount = 0;
var layerIndex = 1000;

function getLayerIndex() {
  layerCount++;
  return layerIndex += 2;
}

function recoverLayer() {
  layerCount--;
  if (layerCount <= 0) {
    layerIndex = 1000;
  }
}

'use strict';
// @require ./util.js

var Base = function () {
  function Base() {
    _classCallCheck(this, Base);

    var ctx = this;
    ctx.$root = null;
    ctx.isShow = false;
  }

  _createClass(Base, [{
    key: 'fire',
    value: function fire() {
      this.$root.trigger.apply(this.$root, arguments);
      return this;
    }
  }, {
    key: 'on',
    value: function on(evt, fn) {
      if (fn) {
        fn.proxy = $.proxy(function () {
          return fn.apply(this, [].slice.call(arguments, 1));
        }, this);
        this.$root.on(evt, fn.proxy);
      }
      return this;
    }
  }, {
    key: 'off',
    value: function off(evt, fn) {
      if (fn) {
        this.$root.off(evt, fn.proxy || fn);
      } else {
        this.$root.off(evt);
      }
      return this;
    }
  }, {
    key: 'one',
    value: function one(evt, fn) {
      if (fn) {
        fn.proxy = $.proxy(function () {
          return fn.apply(this, [].slice.call(arguments, 1));
        }, this);
        this.$root.one(evt, fn.proxy);
      }
      return this;
    }
  }, {
    key: 'fixPosition',
    value: function fixPosition() {
      var $root = this.$root;
      if (!$root) {
        return;
      }
      var width = $root.outerWidth(),
          height = $root.outerHeight();
      $root.css({ margin: '-' + height / 2 + 'px 0 0 -' + width / 2 + 'px' });
    }
  }, {
    key: 'show',
    value: function show() {
      var ctx = this,
          $root = ctx.$root;
      if (ctx.isShow || !$root) {
        return;
      }

      $root.show();
      ctx.fixPosition();
      ctx.isShow = true;
      ctx.fire(MODAL_EVENTS.OPEN);
      return ctx;
    }
  }, {
    key: 'hide',
    value: function hide(callback) {
      var ctx = this,
          $root = ctx.$root;
      if (!ctx.isShow || !$root) {
        return;
      }

      ctx.isShow = false;
      ctx.fire(MODAL_EVENTS.CLOSE);

      Animate.hide($root, function () {
        $root.hide();
        callback && callback();
      });

      return ctx;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var ctx = this;
      ctx.fire(MODAL_EVENTS.DESTROY);
      if (ctx.$root) {
        ctx.$root.remove();
        ctx.$root = null;
      }
    }
  }]);

  return Base;
}();

'use strict';

$.fn.transitionEnd = function (callback) {
  var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
      i,
      dom = this;

  function fireCallBack(e) {
    if (e.target !== this) return;
    callback.call(this, e);
    for (i = 0; i < events.length; i++) {
      dom.off(events[i], fireCallBack);
    }
  }

  if (callback) {
    for (i = 0; i < events.length; i++) {
      dom.on(events[i], fireCallBack);
    }
  }

  return this;
};

var CLASS_READY = 'animate-ready';
var CLASS_SHOW = 'animate-active';
var CLASS_HIDE = 'animate-out';

var Animate = {
  ready: function ready($root, next) {
    $root.removeClass(CLASS_HIDE).removeClass(CLASS_SHOW).addClass(CLASS_READY);
    // 立刻刷新元素状态
    var clientLeft = $root[0].clientLeft;
    // setTimeout(function() {
    next && next();
    // }, 2000)
  },
  show: function show($root, next) {
    $root.addClass(CLASS_SHOW).transitionEnd(function () {
      next && next();
    });
  },
  hide: function hide($root, next) {
    $root.addClass(CLASS_HIDE).transitionEnd(function () {
      $root.removeClass(CLASS_READY).removeClass(CLASS_SHOW).removeClass(CLASS_HIDE);
      next && next();
    });
  }
};

'use strict';
// @require ./util.js
// @require ./base.js

var modalStack = [];
function removeAllModal() {
  for (var i = 0, max = modalStack.length; i < max; i++) {
    modalStack[i].hide();
  }
  modalStack = [];
}

// 隐藏所有 modal
function hideAllModal() {
  var shouldDestroy = false,
      removeFromStack = false;
  for (var i = 0, max = modalStack.length; i < max; i++) {
    modalStack[i]._hide(shouldDestroy, removeFromStack);
  }
}

// 从当前盏中，删除 modal
function removeModalFormStack(modal) {
  var stacks = [],
      hadRemoved = false;

  for (var i = 0, max = modalStack.length; i < max; i++) {
    var _modal = modalStack[i];
    if (modal === _modal && !hadRemoved) {
      hadRemoved = true;
    } else {
      stacks.push(_modal);
    }
  }

  modalStack = stacks;
}

// 显示第一个 modal
function showFirstModalFromStack() {
  var modal = modalStack[0];
  modal && modal.show();
}

// 关闭满足表达式的 modal
function closeModal(selector) {
  for (var i = 0, max = modalStack.length; i < max; i++) {
    var modal = modalStack[i];
    if (modal && modal.$root && modal.$root.is(selector)) {
      modal.hide();
    }
  }
}

var Modal = function (_Base) {
  _inherits(Modal, _Base);

  function Modal(opts) {
    _classCallCheck(this, Modal);

    var _this = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this));

    var ctx = _this;
    // cls: 弹窗额外的 className
    // title: 标题，如果没有，标题栏隐藏
    // close: 关闭按钮
    // buttons: 按钮组, [ { text: '', cls: 'modal-button', event: '自定义点击事件名称，内置了 close 事件', onClick: 回调事件，与 event 类似 } ]
    // content: 内容
    // appendTo: 插入到什么位置，如果是 body，定位则是 fixed
    // autoDestroy: 是否在 hide 的时候，自动调用 destroy 方法，默认 true
    // closePrevious: 关闭所有打开的 Modal
    // closeByOutside: 点击非窗口位置，是否关闭窗口
    ctx.opts = $.extend({
      cls: '',
      title: '',
      close: false,
      buttons: [],
      content: '',
      appendTo: getBody(),
      autoDestroy: true,
      closePrevious: true,
      closeByOutside: true
    }, opts || {});

    ctx.buildHTML();
    ctx.bindEvent();
    return _this;
  }

  _createClass(Modal, [{
    key: 'getAutoEventId',
    value: function getAutoEventId() {
      // 自动生成事件的 id
      if (!this.eventId) {
        this.eventId = 1;
      }
      return '_auto_event_' + this.eventId++;
    }
  }, {
    key: 'buildHTML',
    value: function buildHTML() {
      var ctx = this,
          opts = ctx.opts;
      var $body = $(opts.appendTo);
      var $root = ctx.$root = $('<div class="modal"></div>').css({ display: 'none' });
      var $layer = ctx.$layer = $('<div class="modal-layer"></div>').css({ display: 'none' });
      opts.cls && $root.addClass(opts.cls);

      var html = [];
      if (opts.title) {
        html.push('<div class="modal-title">' + opts.title);
        if (opts.close) {
          html.push('<a class="modal-close" data-event="close" href="javascript:;" title="关闭">&times;</a>');
        }
        html.push('</div>');
      }

      html.push('<div class="modal-main">');
      html.push('<div class="modal-content"></div>');
      html.push('<div class="modal-operation"></div>');
      html.push('</div>');

      $root.html(html.join(''));

      if (!$body.is('body')) {
        var css = { position: 'absolute' };
        $root.css(css);
        $layer.css(css);
      }

      $body.append($layer);
      $body.append($root);

      ctx.setContent(opts.content);
      ctx.setButtons(opts.buttons);
    }
  }, {
    key: 'setContent',
    value: function setContent(content) {
      var $root = this.$root;
      this.opts.content = content;
      $root.find('.modal-content').html(content);
      return this;
    }
  }, {
    key: 'setButtons',
    value: function setButtons(buttons) {
      var ctx = this,
          html = [];
      var $root = ctx.$root,
          $operation = $root.find('.modal-operation');
      var list = ctx.opts.buttons = buttons || [];

      for (var i = 0, max = list.length; i < max; i++) {
        (function (btn) {
          var events = [],
              text = btn.text,
              cls = btn.cls || 'modal-button';
          if (btn.event) {
            events.push(btn.event);
          }
          if (btn.onClick) {
            event = ctx.getAutoEventId();
            events.push(event);
            ctx.on(event, btn.onClick);
          }
          html.push('<a href="javascript:;" data-event="' + events.join(',') + '" class="' + cls + '">' + text + '</a>');
        })(list[i]);
      }

      if (html.length > 0) {
        $operation.html(html.join('')).show();
      } else {
        $operation.hide();
      }

      return ctx;
    }
  }, {
    key: 'bindEvent',
    value: function bindEvent() {
      var ctx = this,
          $root = ctx.$root;

      $root.on('click', '[data-event]', function (e) {
        var events = $(this).attr('data-event');
        var list = events.split(',');
        for (var i = 0, max = list.length; i < max; i++) {
          var evt = list[i];
          if (evt == 'close') {
            ctx.hide();
          } else {
            ctx.fire(evt, [e]);
          }
        }
      });

      if (ctx.opts.closeByOutside) {
        ctx.$layer.on('click', function () {
          ctx.hide();
        });
      }
    }
  }, {
    key: 'show',
    value: function show() {
      var ctx = this,
          $root = ctx.$root,
          $layer = ctx.$layer;
      if (ctx.isShow || !$root) {
        return;
      }

      if (ctx.opts.closePrevious) {
        // 关闭掉所有的 Modal 类弹窗
        removeAllModal();
      } else {
        // 否则，将当前显示的所有 modal，压盏，并且隐藏
        hideAllModal();
      }
      modalStack.unshift(this);

      var index = getLayerIndex(this);
      var css = { display: 'block', 'z-index': index };
      $layer.css(css);

      css['z-index']++;
      $root.css(css);

      _get(Modal.prototype.__proto__ || Object.getPrototypeOf(Modal.prototype), 'show', this).call(this);

      // 依赖 animate.js
      Animate.ready($layer, function () {
        Animate.show($layer);
      });
      Animate.ready($root, function () {
        Animate.show($root);
      });

      return this;
    }
  }, {
    key: '_hide',
    value: function _hide(shouldDestroy, removeFromStack) {
      var ctx = this,
          $root = ctx.$root,
          $layer = ctx.$layer;
      if (!ctx.isShow || !$root) {
        return;
      }
      var index = recoverLayer(this);

      // 依赖 animate.js
      Animate.hide($layer, function () {
        $layer.hide();
      });
      _get(Modal.prototype.__proto__ || Object.getPrototypeOf(Modal.prototype), 'hide', this).call(this, function () {
        if (shouldDestroy) {
          ctx.opts.autoDestroy && ctx.destroy();
        }
      });

      if (removeFromStack) {
        // 从当前盏，移除当前 modal
        removeModalFormStack(ctx);
        // 尝试打开第一个 modal
        showFirstModalFromStack();
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      this._hide(true, true);
      return this;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var ctx = this;
      if (!ctx.$root) {
        return;
      }

      ctx.fire('destroy');
      ctx.$layer.remove();
      ctx.$root.remove();
      ctx.opts = ctx.isShow = ctx.events = ctx.$layer = ctx.$root = null;
    }
  }]);

  return Modal;
}(Base);

'use strict';

var Popup = function (_Base2) {
  _inherits(Popup, _Base2);

  function Popup(opts) {
    _classCallCheck(this, Popup);

    var _this2 = _possibleConstructorReturn(this, (Popup.__proto__ || Object.getPrototypeOf(Popup)).call(this, opts));

    var ctx = _this2;

    ctx.opts = $.extend({
      cls: '',
      content: '',
      autoDestroy: true,
      closeByOutside: false,
      appendTo: getBody()
    }, opts || {});

    ctx.buildHTML();
    ctx.bindEvent();
    return _this2;
  }

  _createClass(Popup, [{
    key: 'buildHTML',
    value: function buildHTML() {
      var ctx = this,
          opts = this.opts;
      var $body = opts.appendTo;
      var $root = ctx.$root = $('<div class="modal-popup"></div>');
      var $layer = ctx.$layer = $('<div class="modal-popup-layer"></div>');

      $root.html(opts.content);
      $root.addClass(opts.cls);

      if (!$body.is('body')) {
        var css = { position: 'absolute' };
        $root.css(css);
        $layer.css(css);
      }

      $body.append($layer);
      $body.append($root);
    }
  }, {
    key: 'bindEvent',
    value: function bindEvent() {
      var ctx = this;
      ctx.$root.on('click', '.close-popup', function () {
        ctx.hide();
      });

      if (ctx.opts.closeByOutside) {
        ctx.$layer.on('click', function () {
          ctx.hide();
        });
      }
    }
  }, {
    key: 'fixPosition',
    value: function fixPosition() {
      return this;
    }
  }, {
    key: 'show',
    value: function show() {
      var ctx = this,
          $root = ctx.$root,
          $layer = ctx.$layer;
      if (ctx.isShow || !$root) {
        return;
      }

      _get(Popup.prototype.__proto__ || Object.getPrototypeOf(Popup.prototype), 'show', this).call(this);
      $layer.show();

      // 依赖 animate.js
      Animate.ready($layer, function () {
        Animate.show($layer);
      });
      Animate.ready($root, function () {
        Animate.show($root);
      });

      return this;
    }
  }, {
    key: 'hide',
    value: function hide() {
      var ctx = this,
          $root = ctx.$root,
          $layer = ctx.$layer;
      if (!ctx.isShow || !$root) {
        return;
      }

      // 依赖 animate.js
      Animate.hide($layer, function () {
        $layer.hide();
      });
      _get(Popup.prototype.__proto__ || Object.getPrototypeOf(Popup.prototype), 'hide', this).call(this, function () {
        ctx.opts.autoDestroy && ctx.destroy();
      });

      return this;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var ctx = this;
      if (!ctx.$root) {
        return;
      }

      ctx.fire('destroy');
      ctx.$layer.remove();
      ctx.$root.remove();
      ctx.opts = ctx.isShow = ctx.events = ctx.$layer = ctx.$root = null;
    }
  }]);

  return Popup;
}(Base);

var events = { confirm: 'confirm', cancel: 'cancel', close: 'close' };
var defaults = {
  buttonOk: '确定',
  buttonCancel: '取消',
  preloaderTitle: 'Loading...',
  closePrevious: true
};
function toArray() {
  return [].slice.call(arguments, 0);
}
function closeCallback() {
  this.hide();
}

// @param {Object} [opts] 弹窗参数:
//  cls: 弹窗额外的 className
//  title: 标题，如果没有，标题栏隐藏
//  close: 关闭按钮，默认 false
//  buttons: 按钮组, [ { text: '', cls: 'modal-button', event: '自定义点击事件名称，内置了 close 事件', callback: 回调事件，与 event 互斥，优先级低 } ]
//  content: 内容
//  appendTo: 插入到什么位置，如果是 body，定位则是 fixed
//  autoDestroy: 是否在 hide 的时候，自动调用 destroy 方法，默认 true
//  closePrevious: 关闭所有打开的 Modal
//  closeByOutside: 点击非窗口位置，是否关闭窗口
$.modal = function (opts) {
  return new Modal($.extend({
    closePrevious: defaults.closePrevious
  }, opts || {}));
};

$.modal.prototype.defaults = defaults;

$.closeModal = function (selector) {
  closeModal(selector);
};

$.alert = function (content, title, opts) {
  if ((typeof title === 'undefined' ? 'undefined' : _typeof(title)) === 'object') {
    opts = title;
    title = '';
  }

  var modal = $.modal($.extend({
    title: title,
    content: content,
    buttons: [{ text: defaults.buttonOk, event: 'close' }]
  }, opts || {}));

  modal.on(events.close, function () {
    modal.fire(events.confirm);
  });

  return modal.show();
};

$.confirm = function (content, title, opts) {
  if ((typeof title === 'undefined' ? 'undefined' : _typeof(title)) === 'object') {
    opts = title;
    title = '';
  }

  var clicked = false;
  var cancel = function cancel() {
    if (clicked) {
      return;
    }
    clicked = true;
    modal.fire(events.cancel, toArray(arguments));
    modal.hide();
  };
  var confirm = function confirm() {
    if (clicked) {
      return;
    }
    clicked = true;
    modal.fire(events.confirm, toArray(arguments));
    modal.hide();
  };

  var modal = $.modal($.extend({
    title: title, content: content,
    buttons: [{ text: defaults.buttonCancel, onClick: cancel }, { text: defaults.buttonOk, onClick: confirm }]
  }, opts || {}));

  modal.on(events.close, cancel);

  return modal.show();
};

$.prompt = function (content, title, opts) {
  if ((typeof title === 'undefined' ? 'undefined' : _typeof(title)) === 'object') {
    opts = title;
    title = '';
  }

  var clicked = false;
  var cancel = function cancel() {
    if (clicked) {
      return;
    }
    clicked = true;
    modal.fire(events.cancel, toArray(arguments));
    modal.hide();
  };
  var confirm = function confirm() {
    if (clicked) {
      return;
    }
    clicked = true;
    var args = toArray(arguments);
    args.unshift(modal.$root.find('.js-modal-prompt-input').val());
    modal.fire(events.confirm, args);
    modal.hide();
  };

  var modal = $.modal($.extend({
    title: title,
    content: content + '<div class="modal-content-below"><input type="text" class="modal-input js-modal-prompt-input" /></div>',
    buttons: [{ text: defaults.buttonCancel, onClick: cancel }, { text: defaults.buttonOk, onClick: confirm }]
  }, opts || {}));

  modal.on(events.close, cancel);

  return modal.show();
};

$.showPreloader = function (title) {
  return $.modal({
    cls: 'modal-preloader',
    title: title || defaults.preloaderTitle,
    content: '<div class="preloader"></div>',
    closeByOutside: false
  }).show();
};

$.hidePreloader = function () {
  $.closeModal('.modal-preloader');
};

$.showIndicator = function (appendTo) {
  var $body = $(appendTo || getBody());
  var $layer = $('<div class="preloader-indicator-overlay"></div>');
  var $root = $('<div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');

  if (!$body.is('body')) {
    var css = { position: 'absolute' };
    $layer.css(css);
    $root.css(css);
  }
  $body.append($layer);
  $body.append($root);
};

$.hideIndicator = function () {
  $('.preloader-indicator-overlay, .preloader-indicator-modal').remove();
};

$.popup = function (selector, appendTo) {
  var $content = $(selector);
  var opts = {};
  if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object') {
    opts = selector;
  } else {
    opts = {
      cls: $content.length > 0 ? $content[0].className : '',
      content: $content.length ? $content.html() : '',
      appendTo: appendTo || getBody()
    };
  }
  var popup = new Popup(opts);

  return popup.show();
};

$(function () {
  $(document).on('click', '.open-popup', function () {
    var $elem = $(this);
    $.popup($elem.attr('data-popup'), $elem.attr('data-popup-append-to'));
  });
});

//显示一个消息，会在2秒钟后自动消失
$.toast = function (content, time) {
  var toast = new Popup({ cls: 'toast', content: content, closeByOutside: false });
  toast.$layer.hide();
  toast.$root.removeClass('modal-popup');
  // 修正位置
  Base.prototype.fixPosition.call(toast);

  setTimeout(function () {
    toast.hide();
  }, time || 2000);

  return toast.show();
};

// 给外部拓展
$.Popup = Popup;
$.Modal = Modal;

/* global $:true */
+function ($) {
  "use strict";

  //比较一个字符串版本号
  //a > b === 1
  //a = b === 0
  //a < b === -1

  $.compareVersion = function (a, b) {
    var as = a.split('.');
    var bs = b.split('.');
    if (a === b) return 0;

    for (var i = 0; i < as.length; i++) {
      var x = parseInt(as[i]);
      if (!bs[i]) return 1;
      var y = parseInt(bs[i]);
      if (x < y) return -1;
      if (x > y) return 1;
    }
    return 1;
  };

  $.getTouchPosition = function (e) {
    e = e.originalEvent || e; //jquery wrap the originevent
    if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
      return {
        x: e.targetTouches[0].pageX,
        y: e.targetTouches[0].pageY
      };
    } else {
      return {
        x: e.pageX,
        y: e.pageY
      };
    }
  };
}($);

/*===========================
Device/OS Detection
===========================*/
/* global $:true */
;(function ($) {
  "use strict";

  var device = {};
  var ua = navigator.userAgent;

  var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
  var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

  device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;

  // Android
  if (android) {
    device.os = 'android';
    device.osVersion = android[2];
    device.android = true;
    device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
  }
  if (ipad || iphone || ipod) {
    device.os = 'ios';
    device.ios = true;
  }
  // iOS
  if (iphone && !ipod) {
    device.osVersion = iphone[2].replace(/_/g, '.');
    device.iphone = true;
  }
  if (ipad) {
    device.osVersion = ipad[2].replace(/_/g, '.');
    device.ipad = true;
  }
  if (ipod) {
    device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
    device.iphone = true;
  }
  // iOS 8+ changed UA
  if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
    if (device.osVersion.split('.')[0] === '10') {
      device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
    }
  }

  // Webview
  device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

  // Minimal UI
  if (device.os && device.os === 'ios') {
    var osVersionArr = device.osVersion.split('.');
    device.minimalUi = !device.webView && (ipod || iphone) && (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) && $('meta[name="viewport"]').length > 0 && $('meta[name="viewport"]').attr('content').indexOf('minimal-ui') >= 0;
  }

  // Check for status bar and fullscreen app mode
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  device.statusBar = false;
  if (device.webView && windowWidth * windowHeight === screen.width * screen.height) {
    device.statusBar = true;
  } else {
    device.statusBar = false;
  }

  // Classes
  var classNames = [];

  // Pixel Ratio
  device.pixelRatio = window.devicePixelRatio || 1;
  classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
  if (device.pixelRatio >= 2) {
    classNames.push('retina');
  }

  // OS classes
  if (device.os) {
    classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
    if (device.os === 'ios') {
      var major = parseInt(device.osVersion.split('.')[0], 10);
      for (var i = major - 1; i >= 6; i--) {
        classNames.push('ios-gt-' + i);
      }
    }
  }
  // Status bar classes
  if (device.statusBar) {
    classNames.push('with-statusbar-overlay');
  } else {
    $('html').removeClass('with-statusbar-overlay');
  }

  // Add html classes
  if (classNames.length > 0) $('html').addClass(classNames.join(' '));

  $.device = device;
})($);

/* global $:true */
/* global WebKitCSSMatrix:true */

(function ($) {
  "use strict";
  // ['width', 'height'].forEach(function(dimension) {
  //     var  Dimension = dimension.replace(/./, function(m) {
  //         return m[0].toUpperCase();
  //     });
  //     $.fn['outer' + Dimension] = function(margin) {
  //         var elem = this;
  //         if (elem) {
  //             var size = elem[dimension]();
  //             var sides = {
  //                 'width': ['left', 'right'],
  //                 'height': ['top', 'bottom']
  //             };
  //             sides[dimension].forEach(function(side) {
  //                 if (margin) size += parseInt(elem.css('margin-' + side), 10);
  //             });
  //             return size;
  //         } else {
  //             return null;
  //         }
  //     };
  // });
  //
  // $.noop = function() {};

  //support

  $.support = function () {
    var support = {
      touch: !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch)
    };
    return support;
  }();

  $.touchEvents = {
    start: $.support.touch ? 'touchstart' : 'mousedown',
    move: $.support.touch ? 'touchmove' : 'mousemove',
    end: $.support.touch ? 'touchend' : 'mouseup'
  };

  $.getTranslate = function (el, axis) {
    var matrix, curTransform, curStyle, transformMatrix;

    // automatic axis detection
    if (typeof axis === 'undefined') {
      axis = 'x';
    }

    curStyle = window.getComputedStyle(el, null);
    if (window.WebKitCSSMatrix) {
      // Some old versions of Webkit choke when 'none' is passed; pass
      // empty string instead in this case
      transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
    } else {
      transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
      matrix = transformMatrix.toString().split(',');
    }

    if (axis === 'x') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41;
      //Crazy IE10 Matrix
      else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
        //Normal Browsers
        else curTransform = parseFloat(matrix[4]);
    }
    if (axis === 'y') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42;
      //Crazy IE10 Matrix
      else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
        //Normal Browsers
        else curTransform = parseFloat(matrix[5]);
    }

    return curTransform || 0;
  };
  $.requestAnimationFrame = function (callback) {
    if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);else {
      return window.setTimeout(callback, 1000 / 60);
    }
  };

  $.cancelAnimationFrame = function (id) {
    if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);else {
      return window.clearTimeout(id);
    }
  };

  // $.fn.transitionEnd = function(callback) {
  //     var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
  //         i, dom = this;
  //
  //     function fireCallBack(e) {
  //         /*jshint validthis:true */
  //         if (e.target !== this) return;
  //         callback.call(this, e);
  //         for (i = 0; i < events.length; i++) {
  //             dom.off(events[i], fireCallBack);
  //         }
  //     }
  //     if (callback) {
  //         for (i = 0; i < events.length; i++) {
  //             dom.on(events[i], fireCallBack);
  //         }
  //     }
  //     return this;
  // };
  // $.fn.dataset = function() {
  //     var el = this[0];
  //     if (el) {
  //         var dataset = {};
  //         if (el.dataset) {
  //             for (var dataKey in el.dataset) { // jshint ignore:line
  //                 dataset[dataKey] = el.dataset[dataKey];
  //             }
  //         } else {
  //             for (var i = 0; i < el.attributes.length; i++) {
  //                 var attr = el.attributes[i];
  //                 if (attr.name.indexOf('data-') >= 0) {
  //                     dataset[$.toCamelCase(attr.name.split('data-')[1])] = attr.value;
  //                 }
  //             }
  //         }
  //         for (var key in dataset) {
  //             if (dataset[key] === 'false') dataset[key] = false;
  //             else if (dataset[key] === 'true') dataset[key] = true;
  //             else if (parseFloat(dataset[key]) === dataset[key] * 1) dataset[key] = dataset[key] * 1;
  //         }
  //         return dataset;
  //     } else return undefined;
  // };
  $.fn.data = function (key, value) {
    if (typeof value === 'undefined') {
      // Get value
      if (this[0] && this[0].getAttribute) {
        var dataKey = this[0].getAttribute('data-' + key);
        if (dataKey) {
          return dataKey;
        } else if (this[0].smElementDataStorage && key in this[0].smElementDataStorage) {
          return this[0].smElementDataStorage[key];
        } else {
          return undefined;
        }
      } else return undefined;
    } else {
      // Set value
      for (var i = 0; i < this.length; i++) {
        var el = this[i];
        if (!el.smElementDataStorage) el.smElementDataStorage = {};
        el.smElementDataStorage[key] = value;
      }
      return this;
    }
  };
  $.fn.animationEnd = function (callback) {
    var events = ['webkitAnimationEnd', 'OAnimationEnd', 'MSAnimationEnd', 'animationend'],
        i,
        dom = this;

    function fireCallBack(e) {
      callback(e);
      for (i = 0; i < events.length; i++) {
        dom.off(events[i], fireCallBack);
      }
    }
    if (callback) {
      for (i = 0; i < events.length; i++) {
        dom.on(events[i], fireCallBack);
      }
    }
    return this;
  };
  $.fn.transition = function (duration) {
    if (typeof duration !== 'string') {
      duration = duration + 'ms';
    }
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
    }
    return this;
  };
  $.fn.transform = function (transform) {
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
    }
    return this;
  };
  // $.fn.prevAll = function (selector) {
  //   var prevEls = [];
  //   var el = this[0];
  //   if (!el) return $([]);
  //   while (el.previousElementSibling) {
  //     var prev = el.previousElementSibling;
  //     if (selector) {
  //       if($(prev).is(selector)) prevEls.push(prev);
  //     }
  //     else prevEls.push(prev);
  //     el = prev;
  //   }
  //   return $(prevEls);
  // };
  // $.fn.nextAll = function (selector) {
  //   var nextEls = [];
  //   var el = this[0];
  //   if (!el) return $([]);
  //   while (el.nextElementSibling) {
  //     var next = el.nextElementSibling;
  //     if (selector) {
  //       if($(next).is(selector)) nextEls.push(next);
  //     }
  //     else nextEls.push(next);
  //     el = next;
  //   }
  //   return $(nextEls);
  // };
  //
  // //重置zepto的show方法，防止有些人引用的版本中 show 方法操作 opacity 属性影响动画执行
  // $.fn.show = function(){
  //   var elementDisplay = {};
  //   function defaultDisplay(nodeName) {
  //     var element, display;
  //     if (!elementDisplay[nodeName]) {
  //       element = document.createElement(nodeName);
  //       document.body.appendChild(element);
  //       display = getComputedStyle(element, '').getPropertyValue("display");
  //       element.parentNode.removeChild(element);
  //       display === "none" && (display = "block");
  //       elementDisplay[nodeName] = display;
  //     }
  //     return elementDisplay[nodeName];
  //   }
  //
  //   return this.each(function(){
  //     this.style.display === "none" && (this.style.display = '');
  //     if (getComputedStyle(this, '').getPropertyValue("display") === "none");
  //       this.style.display = defaultDisplay(this.nodeName);
  //   });
  // };
  //
  // $.fn.scrollHeight = function() {
  //   return this[0].scrollHeight;
  // };
})($);

'use strict';

var PickerModal = function (_Popup) {
  _inherits(PickerModal, _Popup);

  function PickerModal(opts) {
    _classCallCheck(this, PickerModal);

    return _possibleConstructorReturn(this, (PickerModal.__proto__ || Object.getPrototypeOf(PickerModal)).call(this, $.extend({ layerCls: '', closeByOutside: true }, opts || {})));
  }

  _createClass(PickerModal, [{
    key: 'buildHTML',
    value: function buildHTML() {
      _get(PickerModal.prototype.__proto__ || Object.getPrototypeOf(PickerModal.prototype), 'buildHTML', this).call(this);
      var ctx = this;
      ctx.$root.addClass('modal-picker').removeClass('modal-popup');
      ctx.$layer.addClass('modal-picker-layer').removeClass('modal-popup-layer').addClass(ctx.opts.layerCls);
    }
  }, {
    key: 'bindEvent',
    value: function bindEvent() {
      _get(PickerModal.prototype.__proto__ || Object.getPrototypeOf(PickerModal.prototype), 'bindEvent', this).call(this);
      var ctx = this;
      ctx.$root.off('click').on('click', '.close-picker', function () {
        ctx.hide();
      });
    }
  }]);

  return PickerModal;
}(Popup);

$.pickerModal = function (content, appendTo) {
  var popup = new PickerModal({ cls: 'modal-picker', content: content, appendTo: appendTo || getBody() });
  return popup.show();
};

/*======================================================
************   Picker   ************
======================================================*/
/* global $:true */
/* jshint unused:false */
/* jshint multistr:true */
+function ($) {
  "use strict";

  var Picker = function Picker(params) {
    var p = this;
    var defaults = {
      updateValuesOnMomentum: false,
      updateValuesOnTouchmove: true,
      rotateEffect: false,
      momentumRatio: 7,
      freeMode: false,
      // Common settings
      scrollToInput: true,
      inputReadOnly: true,
      // convertToPopover: true,
      // onlyInPopover: false,
      toolbar: true,
      toolbarCloseText: 'OK',
      toolbarTemplate: '<header class="bar bar-nav">\
          <button class="button button-link pull-right close-picker">OK</button>\
          <h1 class="title"></h1>\
          </header>',
      separator: ' '
    };
    params = params || {};
    for (var def in defaults) {
      if (typeof params[def] === 'undefined') {
        params[def] = defaults[def];
      }
    }
    p.params = params;
    p.cols = [];
    p.initialized = false;

    // Inline flag
    p.inline = p.params.container ? true : false;

    // 3D Transforms origin bug, only on safari
    var originBug = $.device.ios || navigator.userAgent.toLowerCase().indexOf('safari') >= 0 && navigator.userAgent.toLowerCase().indexOf('chrome') < 0 && !$.device.android;

    // Should be converted to popover
    // function isPopover() {
    //     var toPopover = false;
    //     if (!p.params.convertToPopover && !p.params.onlyInPopover) return toPopover;
    //     if (!p.inline && p.params.input) {
    //         if (p.params.onlyInPopover) toPopover = true;
    //         else {
    //             if ($.device.ios) {
    //                 toPopover = $.device.ipad ? true : false;
    //             }
    //             else {
    //                 if ($(window).width() >= 768) toPopover = true;
    //             }
    //         }
    //     }
    //     return toPopover;
    // }
    // function inPopover() {
    //     if (p.opened && p.container && p.container.length > 0 && p.container.parents('.popover').length > 0) return true;
    //     else return false;
    // }

    // Value
    p.setValue = function (arrValues, transition) {
      var valueIndex = 0;
      for (var i = 0; i < p.cols.length; i++) {
        if (p.cols[i] && !p.cols[i].divider) {
          p.cols[i].setValue(arrValues[valueIndex], transition);
          valueIndex++;
        }
      }
    };
    p.updateValue = function () {
      var newValue = [];
      var newDisplayValue = [];
      for (var i = 0; i < p.cols.length; i++) {
        if (!p.cols[i].divider) {
          newValue.push(p.cols[i].value);
          newDisplayValue.push(p.cols[i].displayValue);
        }
      }
      if (newValue.indexOf(undefined) >= 0) {
        return;
      }
      p.value = newValue;
      p.displayValue = newDisplayValue;
      if (p.params.onChange) {
        p.params.onChange(p, p.value, p.displayValue);
      }
      if (p.input && p.input.length > 0) {
        var value;
        if (p.params.formatValue) {
          value = p.params.formatValue(p, p.value, p.displayValue);
        } else {
          value = p.displayValue.join(p.params.separator);
          while (value.endsWith(p.params.separator)) {
            value = value.substr(0, value.length - p.params.separator.length);
          }
        }
        $(p.input).val(value);
        $(p.input).trigger('change');
        if (p.inputTarget) {
          p.inputTarget.val(p.value.join(''));
        }
      }
    };

    // Columns Handlers
    p.initPickerCol = function (colElement, updateItems) {
      var colContainer = $(colElement);
      var colIndex = colContainer.index();
      var col = p.cols[colIndex];
      if (col.divider) return;
      col.container = colContainer;
      col.wrapper = col.container.find('.picker-items-col-wrapper');
      col.items = col.wrapper.find('.picker-item');

      var i, j;
      var wrapperHeight, itemHeight, itemsHeight, minTranslate, maxTranslate;
      col.replaceValues = function (values, displayValues) {
        col.destroyEvents();
        col.values = values;
        col.displayValues = displayValues;
        var newItemsHTML = p.columnHTML(col, true);
        col.wrapper.html(newItemsHTML);
        col.items = col.wrapper.find('.picker-item');
        col.calcSize();
        col.setValue(col.displayValues[0], 0, true);
        col.initEvents();
      };
      col.calcSize = function () {
        if (p.params.rotateEffect) {
          col.container.removeClass('picker-items-col-absolute');
          if (!col.width) col.container.css({ width: '' });
        }
        var colWidth, colHeight;
        colWidth = 0;
        colHeight = col.container[0].offsetHeight;
        wrapperHeight = col.wrapper[0].offsetHeight;
        itemHeight = wrapperHeight / col.items.length;
        itemsHeight = wrapperHeight;
        minTranslate = colHeight / 2 - itemsHeight + itemHeight / 2;
        maxTranslate = colHeight / 2 - itemHeight / 2;
        if (col.width) {
          colWidth = col.width;
          if (parseInt(colWidth, 10) === colWidth) colWidth = colWidth + 'px';
          col.container.css({ width: colWidth });
        }
        if (p.params.rotateEffect) {
          if (!col.width) {
            col.items.each(function () {
              var item = $(this);
              item.css({ width: 'auto' });
              colWidth = Math.max(colWidth, item[0].offsetWidth);
              item.css({ width: '' });
            });
            col.container.css({ width: colWidth + 2 + 'px' });
          }
          col.container.addClass('picker-items-col-absolute');
        }
      };
      col.calcSize();

      col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)').transition(0);

      var activeIndex = 0;
      var animationFrameId;

      // Set Value Function
      col.setValue = function (newValue, transition, valueCallbacks) {
        if (typeof transition === 'undefined') transition = '';
        // var newActiveIndex = col.wrapper.find('.picker-item[data-picker-value="' + newValue + '"]').index();
        var newActiveIndex = col.wrapper.find('.picker-item').filter(function () {
          return this.innerHTML === newValue;
        }).index();
        if (typeof newActiveIndex === 'undefined' || newActiveIndex === -1) {
          return;
        }
        var newTranslate = -newActiveIndex * itemHeight + maxTranslate;
        // Update wrapper
        col.wrapper.transition(transition);
        col.wrapper.transform('translate3d(0,' + newTranslate + 'px,0)');

        // Watch items
        if (p.params.updateValuesOnMomentum && col.activeIndex && col.activeIndex !== newActiveIndex) {
          $.cancelAnimationFrame(animationFrameId);
          col.wrapper.transitionEnd(function () {
            $.cancelAnimationFrame(animationFrameId);
          });
          updateDuringScroll();
        }

        // Update items
        col.updateItems(newActiveIndex, newTranslate, transition, valueCallbacks);
      };

      col.updateItems = function (activeIndex, translate, transition, valueCallbacks) {
        if (typeof translate === 'undefined') {
          translate = $.getTranslate(col.wrapper[0], 'y');
        }
        if (typeof activeIndex === 'undefined') activeIndex = -Math.round((translate - maxTranslate) / itemHeight);
        if (activeIndex < 0) activeIndex = 0;
        if (activeIndex >= col.items.length) activeIndex = col.items.length - 1;
        var previousActiveIndex = col.activeIndex;
        col.activeIndex = activeIndex;
        /*
        col.wrapper.find('.picker-selected, .picker-after-selected, .picker-before-selected').removeClass('picker-selected picker-after-selected picker-before-selected');
          col.items.transition(transition);
        var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');
        var prevItems = selectedItem.prevAll().addClass('picker-before-selected');
        var nextItems = selectedItem.nextAll().addClass('picker-after-selected');
        */
        //去掉 .picker-after-selected, .picker-before-selected 以提高性能
        col.wrapper.find('.picker-selected').removeClass('picker-selected');
        if (p.params.rotateEffect) {
          col.items.transition(transition);
        }
        var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');

        if (valueCallbacks || typeof valueCallbacks === 'undefined') {
          // Update values
          col.value = selectedItem.attr('data-picker-value');
          col.displayValue = col.displayValues ? col.displayValues[activeIndex] : col.value;
          // On change callback
          if (previousActiveIndex !== activeIndex) {
            if (col.onChange) {
              col.onChange(p, col.value, col.displayValue);
            }
            p.updateValue();
          }
        }

        // Set 3D rotate effect
        if (!p.params.rotateEffect) {
          return;
        }
        var percentage = (translate - (Math.floor((translate - maxTranslate) / itemHeight) * itemHeight + maxTranslate)) / itemHeight;

        col.items.each(function () {
          var item = $(this);
          var itemOffsetTop = item.index() * itemHeight;
          var translateOffset = maxTranslate - translate;
          var itemOffset = itemOffsetTop - translateOffset;
          var percentage = itemOffset / itemHeight;

          var itemsFit = Math.ceil(col.height / itemHeight / 2) + 1;

          var angle = -18 * percentage;
          if (angle > 180) angle = 180;
          if (angle < -180) angle = -180;
          // Far class
          if (Math.abs(percentage) > itemsFit) item.addClass('picker-item-far');else item.removeClass('picker-item-far');
          // Set transform
          item.transform('translate3d(0, ' + (-translate + maxTranslate) + 'px, ' + (originBug ? -110 : 0) + 'px) rotateX(' + angle + 'deg)');
        });
      };

      function updateDuringScroll() {
        animationFrameId = $.requestAnimationFrame(function () {
          col.updateItems(undefined, undefined, 0);
          updateDuringScroll();
        });
      }

      // Update items on init
      if (updateItems) col.updateItems(0, maxTranslate, 0);

      var allowItemClick = true;
      var isTouched, isMoved, touchStartY, touchCurrentY, touchStartTime, touchEndTime, startTranslate, returnTo, currentTranslate, prevTranslate, velocityTranslate, velocityTime;
      function handleTouchStart(e) {
        if (isMoved || isTouched) return;
        e.preventDefault();
        isTouched = true;
        var position = $.getTouchPosition(e);
        touchStartY = touchCurrentY = position.y;
        touchStartTime = new Date().getTime();

        allowItemClick = true;
        startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
      }
      function handleTouchMove(e) {
        if (!isTouched) return;
        e.preventDefault();
        allowItemClick = false;
        var position = $.getTouchPosition(e);
        touchCurrentY = position.y;
        if (!isMoved) {
          // First move
          $.cancelAnimationFrame(animationFrameId);
          isMoved = true;
          startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
          col.wrapper.transition(0);
        }
        e.preventDefault();

        var diff = touchCurrentY - touchStartY;
        currentTranslate = startTranslate + diff;
        returnTo = undefined;

        // Normalize translate
        if (currentTranslate < minTranslate) {
          currentTranslate = minTranslate - Math.pow(minTranslate - currentTranslate, 0.8);
          returnTo = 'min';
        }
        if (currentTranslate > maxTranslate) {
          currentTranslate = maxTranslate + Math.pow(currentTranslate - maxTranslate, 0.8);
          returnTo = 'max';
        }
        // Transform wrapper
        col.wrapper.transform('translate3d(0,' + currentTranslate + 'px,0)');

        // Update items
        col.updateItems(undefined, currentTranslate, 0, p.params.updateValuesOnTouchmove);

        // Calc velocity
        velocityTranslate = currentTranslate - prevTranslate || currentTranslate;
        velocityTime = new Date().getTime();
        prevTranslate = currentTranslate;
      }
      function handleTouchEnd(e) {
        if (!isTouched || !isMoved) {
          isTouched = isMoved = false;
          return;
        }
        isTouched = isMoved = false;
        col.wrapper.transition('');
        if (returnTo) {
          if (returnTo === 'min') {
            col.wrapper.transform('translate3d(0,' + minTranslate + 'px,0)');
          } else col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)');
        }
        touchEndTime = new Date().getTime();
        var velocity, newTranslate;
        if (touchEndTime - touchStartTime > 300) {
          newTranslate = currentTranslate;
        } else {
          velocity = Math.abs(velocityTranslate / (touchEndTime - velocityTime));
          newTranslate = currentTranslate + velocityTranslate * p.params.momentumRatio;
        }

        newTranslate = Math.max(Math.min(newTranslate, maxTranslate), minTranslate);

        // Active Index
        var activeIndex = -Math.floor((newTranslate - maxTranslate) / itemHeight);

        // Normalize translate
        if (!p.params.freeMode) newTranslate = -activeIndex * itemHeight + maxTranslate;

        // Transform wrapper
        col.wrapper.transform('translate3d(0,' + parseInt(newTranslate, 10) + 'px,0)');

        // Update items
        col.updateItems(activeIndex, newTranslate, '', true);

        // Watch items
        if (p.params.updateValuesOnMomentum) {
          updateDuringScroll();
          col.wrapper.transitionEnd(function () {
            $.cancelAnimationFrame(animationFrameId);
          });
        }

        // Allow click
        setTimeout(function () {
          allowItemClick = true;
        }, 100);
      }

      function handleClick(e) {
        if (!allowItemClick) return;
        $.cancelAnimationFrame(animationFrameId);
        /*jshint validthis:true */
        var displayValue = this.innerHTML;
        col.setValue(displayValue);
      }

      col.initEvents = function (detach) {
        var method = detach ? 'off' : 'on';
        col.container[method]($.touchEvents.start, handleTouchStart);
        col.container[method]($.touchEvents.move, handleTouchMove);
        col.container[method]($.touchEvents.end, handleTouchEnd);
        col.items[method]('click', handleClick);
      };
      col.destroyEvents = function () {
        col.initEvents(true);
      };

      col.container[0].f7DestroyPickerCol = function () {
        col.destroyEvents();
      };

      col.initEvents();
    };
    p.destroyPickerCol = function (colContainer) {
      colContainer = $(colContainer);
      if ('f7DestroyPickerCol' in colContainer[0]) colContainer[0].f7DestroyPickerCol();
    };
    // Resize cols
    function resizeCols() {
      if (!p.opened) return;
      for (var i = 0; i < p.cols.length; i++) {
        if (!p.cols[i].divider) {
          p.cols[i].calcSize();
          p.cols[i].setValue(p.cols[i].displayValue, 0, false);
        }
      }
    }
    $(window).on('resize', resizeCols);

    // HTML Layout
    p.columnHTML = function (col, onlyItems) {
      var columnItemsHTML;
      var columnHTML;
      if (col.divider) {
        columnHTML = 'div class="picker-items-col picker-items-col-divider ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '">' + col.content + '</div>';
      } else {
        var innerHTML;
        columnItemsHTML = [];
        for (var j = 0; j < col.values.length; j++) {
          innerHTML = col.displayValues ? col.displayValues[j] : col.values[j];
          columnItemsHTML.push(['<div', ' class="picker-item', innerHTML.length > 6 ? ' picker-item-long' : '', '"', ' data-picker-value="', col.values[j], '">', innerHTML, '</div>'].join(''));
        }
        columnItemsHTML = columnItemsHTML.join('');
        columnHTML = ['<div class="picker-items-col ', col.cssClass || '', '">', '<div class="picker-items-col-wrapper">', columnItemsHTML, '</div>', '</div>'].join('');
      }
      return onlyItems ? columnItemsHTML : columnHTML;
    };
    p.layout = function () {
      var pickerHTML = '';
      var pickerClass = '';
      var i;
      p.cols = [];
      var colsHTML = '';
      for (i = 0; i < p.params.cols.length; i++) {
        var col = p.params.cols[i];
        colsHTML += p.columnHTML(p.params.cols[i]);
        p.cols.push(col);
      }
      pickerClass = 'picker-modal picker-columns ' + (p.params.cssClass || '') + (p.params.rotateEffect ? ' picker-3d' : '');
      pickerHTML = '<div class="' + pickerClass + '">' + (p.params.toolbar ? p.params.toolbarTemplate.replace(/{{closeText}}/g, p.params.toolbarCloseText) : '') + '<div class="picker-modal-inner picker-items">' + colsHTML + '<div class="picker-center-highlight"></div>' + '</div>' + '</div>';

      p.pickerHTML = pickerHTML;
    };

    // Input Events
    function openOnInput(e) {
      e.preventDefault();
      if (p.opened) return;
      p.open();
      if (p.params.scrollToInput /* && !isPopover()*/) {
          var pageContent = p.input.parents('.content');
          if (pageContent.length === 0) return;

          var paddingTop = parseInt(pageContent.css('padding-top'), 10),
              paddingBottom = parseInt(pageContent.css('padding-bottom'), 10),
              pageHeight = pageContent[0].offsetHeight - paddingTop - p.container.height(),
              pageScrollHeight = pageContent[0].scrollHeight - paddingTop - p.container.height(),
              newPaddingBottom;
          var inputTop = p.input.offset().top - paddingTop + p.input[0].offsetHeight;
          if (inputTop > pageHeight) {
            var scrollTop = pageContent.scrollTop() + inputTop - pageHeight;
            if (scrollTop + pageHeight > pageScrollHeight) {
              newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;
              if (pageHeight === pageScrollHeight) {
                newPaddingBottom = p.container.height();
              }
              pageContent.css({ 'padding-bottom': newPaddingBottom + 'px' });
            }
            pageContent.scrollTop(scrollTop, 300);
          }
        }
    }
    function closeOnHTMLClick(e) {
      // if (inPopover()) return;
      if (p.input && p.input.length > 0) {
        if (e.target !== p.input[0] && $(e.target).parents('.picker-modal').length === 0) p.close();
      } else {
        if ($(e.target).parents('.picker-modal').length === 0) p.close();
      }
    }

    if (p.params.input) {
      p.input = $(p.params.input);
      if (p.input.length > 0) {
        if (p.input.data('target')) {
          p.inputTarget = $(p.input.data('target'));
        }
        if (p.params.inputReadOnly) p.input.prop('readOnly', true);
        if (!p.inline) {
          p.input.on("click.picker", function (e) {
            openOnInput(e);
            //修复部分安卓系统下，即使设置了readonly依然会弹出系统键盘的bug
            if (p.params.inputReadOnly) {
              this.focus();
              this.blur();
            }
          });
        }
        if (p.params.inputReadOnly) {
          p.input.on('focus.picker mousedown.picker', function (e) {
            e.preventDefault();
          });
        }
      }
    }

    if (!p.inline) $('html').on('click', closeOnHTMLClick);

    // Open
    function onPickerClose() {
      p.opened = false;
      if (p.input && p.input.length > 0) {
        p.input.parents('.content').css({ 'padding-bottom': '' });
        p.input.trigger('close.picker');
      }
      if (p.params.onClose) p.params.onClose(p);

      // Destroy events
      p.container.find('.picker-items-col').each(function () {
        p.destroyPickerCol(this);
      });
    }

    p.opened = false;
    p.open = function () {
      // @notice 禁用 popover 操作
      // var toPopover = isPopover();
      var toPopover = false;

      if (!p.opened) {

        // Layout
        p.layout();

        // Append
        if (p.inline) {
          p.container = $(p.pickerHTML);
          p.container.addClass('picker-modal-inline');
          $(p.params.container).append(p.container);
        } else {
          var pickerModal = $.pickerModal(p.pickerHTML);
          p.container = pickerModal.$root;
          pickerModal.on('close', function () {
            onPickerClose();
          });
        }

        // Init Events
        p.container.find('.picker-items-col').each(function () {
          var updateItems = true;
          if (!p.initialized && p.params.value || p.initialized && p.displayValue) updateItems = false;
          p.initPickerCol(this, updateItems);
        });

        // Set value
        var displayValue;
        if (!p.initialized) {
          displayValue = p.params.displayValue || p.params.value;
        }
        if (!displayValue) {
          displayValue = p.displayValue || p.value;
        }
        displayValue && p.setValue(displayValue, 0);
        if (!p.initialized) {
          // 地址控件要多初始化一次。否则第一次初始化的值不准确，待查因。
          p.setValue(displayValue, 0);
        }
      }

      // Set flag
      p.opened = true;
      p.initialized = true;

      if (p.params.onOpen) p.params.onOpen(p);
    };

    // Close
    p.close = function () {
      if (!p.opened || p.inline) return;
      // if (inPopover()) {
      //     $.closeModal(p.popover);
      //     return;
      // }
      // else {
      $.closeModal(p.container);
      return;
      // }
    };

    // Destroy
    p.destroy = function () {
      p.close();
      if (p.params.input && p.input.length > 0) {
        p.input.off('click.picker focus.picker mousedown.picker');
      }
      $('html').off('click', closeOnHTMLClick);
      $(window).off('resize', resizeCols);
    };

    if (p.inline) {
      p.open();
    }

    return p;
  };

  $(document).on("click", ".close-picker", function () {
    var pickerToClose = $('.picker-modal.modal-in');
    if (pickerToClose.length > 0) {
      $.closeModal(pickerToClose);
    } else {
      pickerToClose = $('.popover.modal-in .picker-modal');
      if (pickerToClose.length > 0) {
        $.closeModal(pickerToClose.parents('.popover'));
      }
    }
  });

  //修复picker会滚动页面的bug
  $(document).on($.touchEvents.move, ".picker-modal-inner", function (e) {
    e.preventDefault();
  });

  $.fn.picker = function (params) {
    var args = arguments;
    return this.each(function () {
      if (!this) return;
      var $this = $(this);

      var picker = $this.data("picker");
      if (!picker) {
        params = params || {};
        var inputValue = $this.val();
        if (params.value === undefined && inputValue !== "") {
          params.value = params.cols.length > 1 ? inputValue.split(p.params.separator) : [inputValue];
        }
        var p = $.extend({ input: this }, params);
        picker = new Picker(p);
        $this.data("picker", picker);
      }
      if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) === _typeof("a")) {
        picker[params].apply(picker, Array.prototype.slice.call(args, 1));
      }
    });
  };
}($);
})(window.jQuery || window.$);