'use strict';

$.fn.transitionEnd = function(callback) {
  var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
      i, dom = this;

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

const Animate = {
  ready($root, next) {
    $root.removeClass(CLASS_HIDE).removeClass(CLASS_SHOW).addClass(CLASS_READY);
    // 立刻刷新元素状态
    var clientLeft = $root[0].clientLeft;
    // setTimeout(function() {
      next && next();
    // }, 2000)
  },

  show($root, next) {
    $root.addClass(CLASS_SHOW).transitionEnd(function() {
      next && next();
    });
  },

  hide($root, next) {
    $root.addClass(CLASS_HIDE).transitionEnd(function() {
      $root.removeClass(CLASS_READY).removeClass(CLASS_SHOW).removeClass(CLASS_HIDE);
      next && next();
    });
  }
};
