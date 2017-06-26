const events = { confirm: 'confirm', cancel: 'cancel', close: 'close' };
const defaults = {
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
$.modal = function(opts) {
  return new Modal($.extend({
    closePrevious: defaults.closePrevious
  }, opts || {}));
};

$.modal.prototype.defaults = defaults;

$.closeModal = function(selector) {
  closeModal(selector);
};


$.alert = function(content, title, opts) {
  if (typeof title === 'object') {
    opts = title;
    title = '';
  }

  const modal = $.modal($.extend({
    title,
    content,
    buttons: [
      { text: defaults.buttonOk, event: 'close' }
    ]
  }, opts || {}));

  modal.on(events.close, function() {
    modal.fire(events.confirm);
  });

  return modal.show();
}


$.confirm = function(content, title, opts) {
  if (typeof title === 'object') {
    opts = title;
    title = '';
  }

  let clicked = false;
  let cancel = function() {
    if (clicked) { return; }
    clicked = true;
    modal.fire(events.cancel, toArray(arguments));
    modal.hide();
  };
  let confirm = function() {
    if (clicked) { return; }
    clicked = true;
    modal.fire(events.confirm, toArray(arguments));
    modal.hide();
  }

  const modal = $.modal($.extend({
    title, content,
    buttons: [
      { text: defaults.buttonCancel, onClick: cancel },
      { text: defaults.buttonOk, onClick: confirm }
    ]
  }, opts || {}));

  modal.on(events.close, cancel);

  return modal.show();
}


$.prompt = function(content, title, opts) {
  if (typeof title === 'object') {
    opts = title;
    title = '';
  }

  let clicked = false;
  let cancel = function() {
    if (clicked) { return; }
    clicked = true;
    modal.fire(events.cancel, toArray(arguments));
    modal.hide();
  };
  let confirm = function() {
    if (clicked) { return; }
    clicked = true;
    let args = toArray(arguments);
    args.unshift(modal.$root.find('.js-modal-prompt-input').val());
    modal.fire(events.confirm, args);
    modal.hide();
  }

  const modal = $.modal($.extend({
    title,
    content: content + '<div class="modal-content-below"><input type="text" class="modal-input js-modal-prompt-input" /></div>',
    buttons: [
      { text: defaults.buttonCancel, onClick: cancel },
      { text: defaults.buttonOk, onClick: confirm }
    ]
  }, opts || {}));

  modal.on(events.close, cancel);

  return modal.show();
}


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
  let $body = $(appendTo || getBody());
  let $layer = $('<div class="preloader-indicator-overlay"></div>');
  let $root = $('<div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');

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


$.popup = function(selector, appendTo) {
  const $content = $(selector);
  let opts = { };
  if (typeof selector === 'object') {
    opts = selector;
  } else {
    opts = {
      cls: $content.length > 0 ? $content[0].className : '',
      content: $content.length ? $content.html() : '',
      appendTo: appendTo || getBody()
    };
  }
  const popup = new Popup(opts);

  return popup.show();
};

$(function() {
  $(document).on('click', '.open-popup', function() {
    const $elem = $(this);
    $.popup($elem.attr('data-popup'), $elem.attr('data-popup-append-to'));
  });
});


//显示一个消息，会在2秒钟后自动消失
$.toast = function(content, time) {
  const toast = new Popup({ cls: 'toast', content: content, closeByOutside: false });
  toast.$layer.hide();
  toast.$root.removeClass('modal-popup');
  // 修正位置
  Base.prototype.fixPosition.call(toast);

  setTimeout(function() {
    toast.hide();
  }, time || 2000);

  return toast.show();
};


// 给外部拓展
$.Popup = Popup;
$.Modal = Modal;
