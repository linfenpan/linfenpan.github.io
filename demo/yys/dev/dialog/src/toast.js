'use strict';

class Toast extends Popup {
  constructor(opts) {
    super($.extend({ closeByOutside: false }, opts || {}));
  }

  buildHTML() {
    super.buildHTML();
    const ctx = this;
    ctx.$root.addClass('toast').removeClass('modal-popup');
    ctx.$layer.addClass('toast-layer').removeClass('modal-popup-layer').addClass(ctx.opts.layerCls);
  }
}
