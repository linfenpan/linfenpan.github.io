/*======================================================
************   Modals   ************
======================================================*/
/*jshint unused: false*/
/* global $:true */
+function ($) {
  "use strict";
    var _modalTemplateTempDiv = document.createElement('div');
    var EVENTS = { CONFIRM: 'confirm', CANCEL: 'cancel' };
    var KEY_MODAL_OPTIONS = 'modal-options';

    // 获取弹窗参数
    function getModalOptions(modal) {
      var $modal = $(modal);
      return $.extend({}, defaults, $modal.data(KEY_MODAL_OPTIONS));
    }
    // 设置弹窗参数
    // @param {jQuery} [modal] 弹窗 jquery dom 对象
    // @param {Object} [opts] 参数，例如: { modalCloseByOutside: false, closePrevious: false }
    function setModalOptions(modal, opts) {
      var $modal = $(modal);
      var defOpts = $modal.data(KEY_MODAL_OPTIONS);
      $modal.data(KEY_MODAL_OPTIONS, $.extend(defOpts, opts || {}));
    }

    // 修正位置
    function fixPosition($modal) {
      $modal.css({
        marginTop: - Math.round($modal.outerHeight() / 2) + 'px',
        marginLeft: - Math.round($modal.outerWidth() / 2) + 'px'
      });
    }

    $.modal = function (params) {
        params = params || {};
        var modalHTML = '';
        var buttonsHTML = '';
        if (params.buttons && params.buttons.length > 0) {
          for (var i = 0; i < params.buttons.length; i++) {
            buttonsHTML += '<span class="modal-button' + (params.buttons[i].bold ? ' modal-button-bold' : '') + '">' + params.buttons[i].text + '</span>';
          }
        }
        var titleHTML = params.title ? '<div class="modal-title">' + params.title + '</div>' : '';
        var textHTML = params.text ? '<div class="modal-text">' + params.text + '</div>' : '';
        var afterTextHTML = params.afterText ? params.afterText : '';
        var className = params.className ? params.className + ' ' : '';
        var noButtons = !params.buttons || params.buttons.length === 0 ? 'modal-no-buttons' : '';
        var verticalButtons = params.verticalButtons ? 'modal-buttons-vertical' : '';
        modalHTML = '<div class="modal ' + className + noButtons + '"><div class="modal-inner">' + (titleHTML + textHTML + afterTextHTML) + '</div><div class="modal-buttons ' + verticalButtons + '">' + buttonsHTML + '</div></div>';

        _modalTemplateTempDiv.innerHTML = modalHTML;

        var modal = $(_modalTemplateTempDiv).children();

        $(defaults.modalContainer).append(modal[0]);

        // Add events on buttons
        modal.find('.modal-button').each(function (index, el) {
          $(el).on('click', function (e) {
            if (params.buttons[index].onClick) params.buttons[index].onClick(modal, e);
            if (params.buttons[index].event) modal.trigger(params.buttons[index].event, [modal]);
            if (params.onClick) params.onClick(modal, index);
            if (params.buttons[index].close !== false) $.closeModal(modal);
          });
        });

        // 给 modal 额外方法，用于设置参数，用法: $.modal(dom).options({ closePrevious: true }) 之类的
        modal.options = function(opts) {
          setModalOptions(this, opts);
          return this;
        };

        // 让 modal.options 充分执行
        setTimeout(function() {
          $.openModal(modal);
        });

        return modal;
    };

    $.alert = function (text, title, callbackOk) {
        if (typeof title === 'function') {
          callbackOk = arguments[1];
          title = undefined;
        }
        var modal = $.modal({
          text: text || '',
          title: typeof title === 'undefined' ? defaults.modalTitle : title,
          buttons: [
            { text: defaults.modalButtonOk, bold: true, event: EVENTS.CONFIRM, onClick: callbackOk }
          ]
        });

        var closeEvent = defaults.closeEvent;
        modal.options({ closeAsConfirm: true })
          .one(EVENTS.CONFIRM, function() {
            modal.off(closeEvent);
          })
          .one(closeEvent, function() {
            var options = getModalOptions(modal);
            options.closeAsConfirm && modal.trigger(EVENTS.CONFIRM, [modal]);
          });

        return modal;
    };

    $.confirm = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
          callbackCancel = arguments[2];
          callbackOk = arguments[1];
          title = undefined;
        }
        var modal = $.modal({
          text: text || '',
          title: typeof title === 'undefined' ? defaults.modalTitle : title,
          buttons: [
            {text: defaults.modalButtonCancel, onClick: callbackCancel, event: EVENTS.CANCEL},
            {text: defaults.modalButtonOk, bold: true, onClick: callbackOk, event: EVENTS.CONFIRM}
          ]
        });

        var closeEvent = defaults.closeEvent;
        modal.options({ closeAsCancel: true })
          .one(EVENTS.CANCEL, function() {
            modal.off(closeEvent);
          })
          .one(EVENTS.CONFIRM, function() {
            modal.off(closeEvent);
          })
          .one(closeEvent, function() {
            var options = getModalOptions(modal);
            options.closeAsCancel && modal.trigger(EVENTS.CANCEL, [modal]);
          });

        return modal;
    };

    $.prompt = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
          callbackCancel = arguments[2];
          callbackOk = arguments[1];
          title = undefined;
        }
        return $.modal({
          text: text || '',
          title: typeof title === 'undefined' ? defaults.modalTitle : title,
          afterText: '<input type="text" class="modal-text-input">',
          buttons: [
            { text: defaults.modalButtonCancel },
            { text: defaults.modalButtonOk, bold: true }
          ],
          onClick: function (modal, index) {
            var _event = '';
            var $modal = $(modal);
            var value = $modal.find('.modal-text-input').val();

            if (index === 0) {
              callbackCancel && callbackCancel(value);
              _event = EVENTS.CANCEL;
            }
            if (index === 1) {
              callbackOk && callbackOk(value);
              _event = EVENTS.CONFIRM;
            }
            _event && $modal.trigger(_event, [modal, value]);
          }
        });
    };

    $.showPreloader = function (title) {
      return $.modal({
        title: title || defaults.modalPreloaderTitle,
        text: '<div class="preloader"></div>'
      });
    };

    $.hidePreloader = function () {
      $.closeModal('.modal.modal-in');
    };

    $.showIndicator = function () {
      $(defaults.modalContainer).append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');
    };

    $.hideIndicator = function () {
      $('.preloader-indicator-overlay, .preloader-indicator-modal').remove();
    };

    $.popover = function (modal, target, removeOnClose) {
        if (typeof removeOnClose === 'undefined') removeOnClose = true;
        if (typeof modal === 'string' && modal.indexOf('<') >= 0) {
            var _modal = document.createElement('div');
            _modal.innerHTML = modal.trim();
            if (_modal.childNodes.length > 0) {
                modal = _modal.childNodes[0];
                if (removeOnClose) modal.classList.add('remove-on-close');
                $(defaults.modalContainer).append(modal);
            }
            else return false; //nothing found
        }
        modal = $(modal);
        target = $(target);
        if (modal.length === 0 || target.length === 0) return false;
        if (modal.find('.popover-angle').length === 0) {
            modal.append('<div class="popover-angle"></div>');
        }
        modal.show();

        function sizePopover() {
            modal.css({left: '', top: ''});
            var modalWidth =  modal.width();
            var modalHeight =  modal.height(); // 13 - height of angle
            var modalAngle = modal.find('.popover-angle');
            var modalAngleSize = modalAngle.width() / 2;
            var modalAngleLeft, modalAngleTop;
            modalAngle.removeClass('on-left on-right on-top on-bottom').css({left: '', top: ''});

            var targetWidth = target.outerWidth();
            var targetHeight = target.outerHeight();
            var targetOffset = target.offset();
            var targetParentPage = target.parents('.page');
            if (targetParentPage.length > 0) {
                targetOffset.top = targetOffset.top - targetParentPage[0].scrollTop;
            }

            var windowHeight = $(window).height();
            var windowWidth = $(window).width();

            var modalTop = 0;
            var modalLeft = 0;
            var diff = 0;
            // Top Position
            var modalPosition = 'top';

            if ((modalHeight + modalAngleSize) < targetOffset.top) {
                // On top
                modalTop = targetOffset.top - modalHeight - modalAngleSize;
            }
            else if ((modalHeight + modalAngleSize) < windowHeight - targetOffset.top - targetHeight) {
                // On bottom
                modalPosition = 'bottom';
                modalTop = targetOffset.top + targetHeight + modalAngleSize;
            }
            else {
                // On middle
                modalPosition = 'middle';
                modalTop = targetHeight / 2 + targetOffset.top - modalHeight / 2;
                diff = modalTop;
                if (modalTop < 0) {
                    modalTop = 5;
                }
                else if (modalTop + modalHeight > windowHeight) {
                    modalTop = windowHeight - modalHeight - 5;
                }
                diff = diff - modalTop;
            }
            // Horizontal Position
            if (modalPosition === 'top' || modalPosition === 'bottom') {
                modalLeft = targetWidth / 2 + targetOffset.left - modalWidth / 2;
                diff = modalLeft;
                if (modalLeft < 5) modalLeft = 5;
                if (modalLeft + modalWidth > windowWidth) modalLeft = windowWidth - modalWidth - 5;
                if (modalPosition === 'top') modalAngle.addClass('on-bottom');
                if (modalPosition === 'bottom') modalAngle.addClass('on-top');
                diff = diff - modalLeft;
                modalAngleLeft = (modalWidth / 2 - modalAngleSize + diff);
                modalAngleLeft = Math.max(Math.min(modalAngleLeft, modalWidth - modalAngleSize * 2 - 6), 6);
                modalAngle.css({left: modalAngleLeft + 'px'});
            }
            else if (modalPosition === 'middle') {
                modalLeft = targetOffset.left - modalWidth - modalAngleSize;
                modalAngle.addClass('on-right');
                if (modalLeft < 5) {
                    modalLeft = targetOffset.left + targetWidth + modalAngleSize;
                    modalAngle.removeClass('on-right').addClass('on-left');
                }
                if (modalLeft + modalWidth > windowWidth) {
                    modalLeft = windowWidth - modalWidth - 5;
                    modalAngle.removeClass('on-right').addClass('on-left');
                }
                modalAngleTop = (modalHeight / 2 - modalAngleSize + diff);
                modalAngleTop = Math.max(Math.min(modalAngleTop, modalHeight - modalAngleSize * 2 - 6), 6);
                modalAngle.css({top: modalAngleTop + 'px'});
            }

            // Apply Styles
            modal.css({top: modalTop + 'px', left: modalLeft + 'px'});
        }
        sizePopover();

        $(window).on('resize', sizePopover);
        modal.on(defaults.closeEvent, function () {
            $(window).off('resize', sizePopover);
        });

        if (modal.find('.' + defaults.viewClass).length > 0) {
            $.sizeNavbars(modal.find('.' + defaults.viewClass)[0]);
        }

        $.openModal(modal);
        return modal[0];
    };

    $.popup = function (modal, removeOnClose) {
        if (typeof removeOnClose === 'undefined') removeOnClose = true;
        if (typeof modal === 'string' && modal.indexOf('<') >= 0) {
            var _modal = document.createElement('div');
            _modal.innerHTML = modal.trim();
            if (_modal.childNodes.length > 0) {
                modal = _modal.childNodes[0];
                if (removeOnClose) modal.classList.add('remove-on-close');
                $(defaults.modalContainer).append(modal);
            }
            else return false; //nothing found
        }
        modal = $(modal);
        if (modal.length === 0) return false;
        modal.show();
        // if (modal.find('.' + defaults.viewClass).length > 0) {
        //     $.sizeNavbars(modal.find('.' + defaults.viewClass)[0]);
        // }

        // TODO 这里应该独立弹窗!!!!!!!!!

        modal.addClass('modal-single');
        return $.openModal(modal, true);
    };

    //显示一个消息，会在2秒钟后自动消失
    $.toast = function(msg, time) {
      var $toast = $("<div class='toast'>"+msg+"</div>").appendTo(document.body);

      $toast.show();
      fixPosition($toast);

      //Make sure that styles are applied, trigger relayout;
      var clientLeft = $toast[0].clientLeft;
      $toast.addClass('toast-in').transitionEnd(function (e) {
        $toast.trigger('opened');
      });

      setTimeout(function() {
        $toast.trigger(defaults.closeEvent, [$toast]);
        $toast.addClass('toast-out').transitionEnd(function() { $toast.remove(); });
      }, time || 2000);
    };

    $.pickerModal = function (pickerModal, removeOnClose) {
        if (typeof removeOnClose === 'undefined') removeOnClose = true;
        if (typeof pickerModal === 'string' && pickerModal.indexOf('<') >= 0) {
            pickerModal = $(pickerModal);
            if (pickerModal.length > 0) {
                if (removeOnClose) pickerModal.addClass('remove-on-close');
                $(defaults.modalContainer).append(pickerModal[0]);
            }
            else return false; //nothing found
        }
        pickerModal = $(pickerModal);
        if (pickerModal.length === 0) return false;
        pickerModal.show();
        $.openModal(pickerModal);
        return pickerModal[0];
    };

    $.modalStack = [];
    $.openModal = function (modal) {
        var options = getModalOptions(modal);

        if(options.closePrevious) {
          $.closeModal();
        } else if (!options.singleModal) {
          // 不然此弹窗关闭时，应该把上一个弹窗，重新载入
          var $oldModal = $('.modal-in:not(.modal-out)').filter(':not(.modal-single)');
          if ($oldModal.length > 0) {
            $.modalStack.unshift($oldModal);
            $oldModal.addClass('modal-out');
          }
        }

        modal = $(modal);
        var isModal = modal.hasClass('modal');
        var isPopover = modal.hasClass('popover');
        var isPopup = modal.hasClass('popup');
        var isLoginScreen = modal.hasClass('login-screen');
        var isPickerModal = modal.hasClass('picker-modal');
        if (isModal) {
            modal.show();
            modal.css({
                marginTop: - Math.round(modal.outerHeight() / 2) + 'px',
                marginLeft: - Math.round(modal.outerWidth() / 2) + 'px'
            });
            // @notice 以免动画导致宽度计算失败
            modal.addClass('modal-ready');
        }

        var overlay;
        if (!isLoginScreen && !isPickerModal) {
            if ($('.modal-overlay').length === 0 && !isPopup) {
                $(options.modalContainer).append('<div class="modal-overlay"></div>');
            }
            if ($('.popup-overlay').length === 0 && isPopup) {
                $(options.modalContainer).append('<div class="popup-overlay"></div>');
            }
            overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');
        }

        //Make sure that styles are applied, trigger relayout;
        var clientLeft = modal[0].clientLeft;

        // Trugger open event
        modal.trigger('open');

        // Picker modal body class
        if (isPickerModal) {
            $(options.modalContainer).addClass('with-picker-modal');
        }

        // Classes for transition in
        if (!isLoginScreen && !isPickerModal) overlay.addClass('modal-overlay-visible');
        modal.removeClass('modal-out').addClass('modal-in').transitionEnd(function (e) {
            if (modal.hasClass('modal-out')) modal.trigger('closed');
            else modal.trigger('opened');
        });
        return true;
    };

    $.closeModal = function (modal) {
        modal = $(modal || '.modal-in:not(.modal-out)');
        var options = getModalOptions(modal);

        if (modal && modal.length === 0) {
          return;
        }

        var isModal = modal.hasClass('modal');
        var isPopover = modal.hasClass('popover');
        var isPopup = modal.hasClass('popup');
        var isLoginScreen = modal.hasClass('login-screen');
        var isPickerModal = modal.hasClass('picker-modal');

        var removeOnClose = modal.hasClass('remove-on-close');

        var overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');

        if (isPopup){
            if (modal.length === $('.popup.modal-in').length) {
                overlay.removeClass('modal-overlay-visible');
            }
        }
        else if (!isPickerModal) {
            overlay.removeClass('modal-overlay-visible');
        }

        modal.trigger(options.closeEvent);

        // Picker modal body class
        if (isPickerModal) {
            $(options.modalContainer).removeClass('with-picker-modal');
            $(options.modalContainer).addClass('picker-modal-closing');
        }

        if (!isPopover) {
            modal.removeClass('modal-in').addClass('modal-out').transitionEnd(function (e) {
                if (modal.hasClass('modal-out')) modal.trigger('closed');
                else modal.trigger('opened');

                if (isPickerModal) {
                    $(options.modalContainer).removeClass('picker-modal-closing');
                }
                if (isPopup || isLoginScreen || isPickerModal) {
                    modal.removeClass('modal-out').hide();
                    if (removeOnClose && modal.length > 0) {
                        modal.remove();
                    }
                }
                else {
                    modal.remove();
                }
            });
        }
        else {
            modal.removeClass('modal-in modal-out').trigger('closed').hide();
            if (removeOnClose) {
                modal.remove();
            }
        }

        if ($.modalStack.length > 0) {
          $.openModal($.modalStack.shift());
        }

        return true;
    };

    function handleClicks(e) {
        /*jshint validthis:true */
        var clicked = $(this);
        var url = clicked.attr('href');

        //Collect Clicked data- attributes
        var clickedData = clicked.dataset();

        // Popover
        if (clicked.hasClass('open-popover')) {
            var popover;
            if (clickedData.popover) {
                popover = clickedData.popover;
            }
            else popover = '.popover';
            $.popover(popover, clicked);
        }
        if (clicked.hasClass('close-popover')) {
            $.closeModal('.popover.modal-in:not(.modal-out)');
        }

        // Popup
        var popup;
        if (clicked.hasClass('open-popup')) {
            if (clickedData.popup) {
                popup = clickedData.popup;
            }
            else popup = '.popup';
            $.popup(popup);
        }
        if (clicked.hasClass('close-popup')) {
            if (clickedData.popup) {
                popup = clickedData.popup;
            }
            else popup = '.popup.modal-in:not(.modal-out)';
            $.closeModal(popup);
        }

        // Close Modal
        if (clicked.hasClass('modal-overlay')) {
          var $modal = $('.modal.modal-in:not(.modal-out)');
          if ($modal.length > 0) {
            var options = getModalOptions($modal);
            options.modalCloseByOutside && $.closeModal($modal);
          }

          var $popover = $('.popover.modal-in:not(.modal-out)');
          if ($popover.length > 0) {
            $.closeModal($popover);
          }
        }
        if (clicked.hasClass('popup-overlay')) {
          var $popup = $('.popup.modal-in:not(.modal-out)');
          if ($popup.length > 0) {
            var options = getModalOptions($popup);
            options.popupCloseByOutside && $.closeModal($popup);
          }
        }
    }

    var defaults = $.modal.prototype.defaults = {
      modalButtonOk: '确定',
      modalButtonCancel: '取消',
      modalPreloaderTitle: 'Loading...',
      modalContainer : document.body,
      modalCloseByOutside: true,
      actionsCloseByOutside: false,
      popupCloseByOutside: true,
      closePrevious: true,  //close all previous modal before open
      closeEvent: 'close'
    };

    $(function() {
      $(document).on('click', ' .modal-overlay, .popup-overlay, .close-popup, .open-popup, .open-popover, .close-popover, .close-picker', handleClicks);
      defaults.modalContainer = defaults.modalContainer || document.body;  //incase some one include js in head
    });
}($);
