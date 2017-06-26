'use strict';

class PickerModal extends Popup {
  constructor(opts) {
    super($.extend({ layerCls: '', closeByOutside: true }, opts || {}));
  }

  buildHTML() {
    super.buildHTML();
    const ctx = this;
    ctx.$root.addClass('modal-picker').removeClass('modal-popup');
    ctx.$layer.addClass('modal-picker-layer').removeClass('modal-popup-layer').addClass(ctx.opts.layerCls);
  }

  bindEvent() {
    super.bindEvent();
    const ctx = this;
    ctx.$root.off('click').on('click', '.close-picker', function() {
      ctx.hide();
    });
  }
}

$.pickerModal = function(content, appendTo) {
  const popup = new PickerModal({ cls: 'modal-picker', content: content, appendTo: appendTo || getBody() });
  return popup.show();
};
