'use strict';
// @require ./util.js
// @require ./base.js

let modalStack = [];
function removeAllModal() {
  for (var i = 0, max = modalStack.length; i < max; i++) {
    modalStack[i].hide();
  }
  modalStack = [];
}

// 隐藏所有 modal
function hideAllModal() {
  var shouldDestroy = false, removeFromStack = false;
  for (var i = 0, max = modalStack.length; i < max; i++) {
    modalStack[i]._hide(shouldDestroy, removeFromStack);
  }
}

// 从当前盏中，删除 modal
function removeModalFormStack(modal) {
  var stacks = [], hadRemoved = false;

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

class Modal extends Base {
  constructor(opts) {
    super();

    var ctx = this;
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
  }

  getAutoEventId() {
    // 自动生成事件的 id
    if (!this.eventId) { this.eventId = 1; }
    return '_auto_event_' + this.eventId++;
  }

  buildHTML() {
    var ctx = this, opts = ctx.opts;
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

  setContent(content) {
    var $root = this.$root;
    this.opts.content = content;
    $root.find('.modal-content').html(content);
    return this;
  }

  setButtons(buttons) {
    var ctx = this, html = [];
    var $root = ctx.$root, $operation = $root.find('.modal-operation');
    var list = ctx.opts.buttons = buttons || [];

    for (var i = 0, max = list.length; i < max; i++) {
      (function(btn) {
        var events = [], text = btn.text, cls = btn.cls || 'modal-button';
        if (btn.event) {
          events.push(btn.event);
        }
        if (btn.onClick) {
          event = ctx.getAutoEventId();
          events.push(event);
          ctx.on(event, btn.onClick);
        }
        html.push('<a href="javascript:;" data-event="'+ events.join(',') +'" class="'+ cls +'">'+ text +'</a>');
      })(list[i]);
    }

    if (html.length > 0) {
      $operation.html(html.join('')).show();
    } else {
      $operation.hide();
    }

    return ctx;
  }

  bindEvent() {
    var ctx = this, $root = ctx.$root;

    $root.on('click', '[data-event]', function(e) {
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
      ctx.$layer.on('click', function() {
        ctx.hide();
      });
    }
  }

  show() {
    var ctx = this, $root = ctx.$root, $layer = ctx.$layer;
    if (ctx.isShow || !$root) { return; }

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

    super.show();

    // 依赖 animate.js
    Animate.ready($layer, function() {
      Animate.show($layer);
    });
    Animate.ready($root, function() {
      Animate.show($root);
    });

    return this;
  }

  _hide(shouldDestroy, removeFromStack) {
    var ctx = this, $root = ctx.$root, $layer = ctx.$layer;
    if (!ctx.isShow || !$root) { return; }
    var index = recoverLayer(this);

    // 依赖 animate.js
    Animate.hide($layer, function() {
      $layer.hide();
    });
    super.hide(function() {
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

  hide() {
    this._hide(true, true);
    return this;
  }

  destroy() {
    var ctx = this;
    if (!ctx.$root) { return; }

    ctx.fire('destroy');
    ctx.$layer.remove();
    ctx.$root.remove();
    ctx.opts = ctx.isShow = ctx.events = ctx.$layer = ctx.$root = null;
  }
}
