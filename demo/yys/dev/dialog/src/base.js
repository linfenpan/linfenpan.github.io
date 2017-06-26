'use strict';
// @require ./util.js

class Base {
  constructor() {
    var ctx = this;
    ctx.$root = null;
    ctx.isShow = false;
  }

  fire() {
    this.$root.trigger.apply(this.$root, arguments);
    return this;
  }

  on(evt, fn) {
    if (fn) {
      fn.proxy = $.proxy(function() {
        return fn.apply(this, [].slice.call(arguments, 1));
      }, this);
      this.$root.on(evt, fn.proxy)
    }
    return this;
  }

  off(evt, fn) {
    if (fn) {
      this.$root.off(evt, fn.proxy || fn);
    } else {
      this.$root.off(evt);
    }
    return this;
  }

  one(evt, fn) {
    if (fn) {
      fn.proxy = $.proxy(function() {
        return fn.apply(this, [].slice.call(arguments, 1));
      }, this);
      this.$root.one(evt, fn.proxy)
    }
    return this;
  }

  fixPosition() {
    var $root = this.$root;
    if (!$root) { return; }
    var width = $root.outerWidth(), height = $root.outerHeight();
    $root.css({ margin: '-' + height/2 + 'px 0 0 -' + width/2 + 'px' });
  }

  show() {
    var ctx = this, $root = ctx.$root;
    if (ctx.isShow || !$root) { return; }

    $root.show();
    ctx.fixPosition();
    ctx.isShow = true;
    ctx.fire(MODAL_EVENTS.OPEN);
    return ctx;
  }

  hide(callback) {
    var ctx = this, $root = ctx.$root;
    if (!ctx.isShow || !$root) { return; }

    ctx.isShow = false;
    ctx.fire(MODAL_EVENTS.CLOSE);

    Animate.hide($root, function() {
      $root.hide();
      callback && callback();
    });

    return ctx;
  }

  destroy() {
    var ctx = this;
    ctx.fire(MODAL_EVENTS.DESTROY);
    if (ctx.$root) {
      ctx.$root.remove();
      ctx.$root = null;
    }
  }
}
