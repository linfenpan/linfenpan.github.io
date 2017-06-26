'use strict';

class Popup extends Base {
  constructor(opts) {
    super(opts);
    const ctx = this;

    ctx.opts = $.extend({
      cls: '',
      content: '',
      autoDestroy: true,
      closeByOutside: false,
      appendTo: getBody()
    }, opts || {});

    ctx.buildHTML();
    ctx.bindEvent();
  }

  buildHTML() {
    const ctx = this, opts = this.opts;
    const $body = opts.appendTo;
    const $root = ctx.$root = $('<div class="modal-popup"></div>');
    const $layer = ctx.$layer = $('<div class="modal-popup-layer"></div>');

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

  bindEvent() {
    const ctx = this;
    ctx.$root.on('click', '.close-popup', function() {
      ctx.hide();
    });

    if (ctx.opts.closeByOutside) {
      ctx.$layer.on('click', function() {
        ctx.hide();
      });
    }
  }

  fixPosition() {
    return this;
  }

  show() {
    const ctx = this, $root = ctx.$root, $layer = ctx.$layer;
    if (ctx.isShow || !$root) { return; }

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

  hide() {
    const ctx = this, $root = ctx.$root, $layer = ctx.$layer;
    if (!ctx.isShow || !$root) { return; }

    // 依赖 animate.js
    Animate.hide($layer, function() {
      $layer.hide();
    });
    super.hide(function() {
      ctx.opts.autoDestroy && ctx.destroy();
    });

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
