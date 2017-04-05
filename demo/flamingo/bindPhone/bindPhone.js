/*
 * @require jquery.js
 * @require pop.js
 * @require project.js  [可选]
 *
 * @event
 *  nologin 没登录
 *  bindSuccess 绑定成功
 */
;(function(window, $){
    var html = '<div style="display: none;">\
        <!-- 需要绑定手机 -->\
        <div id="needBindPhoneDialog" class="needBindPhoneDialog pop-dialog-white pop-dialog-confirm">\
            <a href="javascript:;" class="pop-dialog-close" data-role="close"></a>\
            <div class="content needBindPhoneContent">\
                绑定手机号游戏上线后，我们将短信通知您下载游戏、领取礼包。\
            </div>\
            <div class="operation">\
                <a href="javascript:;" class="pop-dialog-btn pop-dialog-sure" data-role="bindPhone">绑定手机</a>\
            </div>\
        </div>\
        <!-- 绑定手机 -->\
        <div id="bindPhoneDialog" class="bindPhoneDialog pop-dialog-white pop-dialog-confirm">\
            <a href="javascript:;" class="pop-dialog-close" data-role="close"></a>\
            <div class="pop-dialog-title">\
                绑定手机\
            </div>\
            <div class="dialogContent">\
                <div class="content bindPhoneContent">\
                    <p>\
                        <input type="tel" placeholder="请输入您的手机号码" class="phoneText">\
                    </p>\
                    <p class="codeRow">\
                        <input type="tel" placeholder="请输入验证码" class="codeText"><a href="javascript:;" class="getCode" data-role="getCode">获取验证码</a>\
                    </p>\
                </div>\
                <div class="operation">\
                    <a href="javascript:;" class="pop-dialog-btn pop-dialog-sure" data-role="sureBindPhone">确定绑定</a>\
                </div>\
            </div>\
        </div>\
    </div>';

    // 弹窗 ui 逻辑
    var dialogUI = {
        init: function(options){
            var $body = $("body");
            $body.append(html);
            this.needDialog = POP.dialog.create("#needBindPhoneDialog");
            this.bindDialog = POP.dialog.create("#bindPhoneDialog");
            this.bindUI(options || {});

            this.init = function(){ return this; }
            return this;
        },
        bindUI: function(options){
            var needDialog = this.needDialog;
            var bindDialog = this.bindDialog;

            needDialog.on("bindPhone", function(){
                this.hide();
                bindDialog.show();
            });

            var binder = PhoneBinder.init(bindDialog.$root, options);

            // 点击"确认绑定"按钮
            bindDialog.on("sureBindPhone", $.proxy(function($elem){
                if (binder.isAllValid() && !$elem.hasClass("disable")) {
                    $elem.addClass("disable");
                    binder.bindPhone().done($.proxy(function(){
                        POP.autoTip("绑定成功");
                        bindDialog.hide();
                        this.fire("bindSuccess");
                    }, this)).always(function(){
                        $elem.removeClass("disable");
                    });
                }
                return false;
            }, this));

            // 点击"获取验证码"按钮
            bindDialog.on("getCode", function($elem){
                if (binder.isPhoneValid() && !$elem.hasClass("disable")) {
                    $elem.addClass("disable");
                    binder.sendCode().done(function(){
                        codeCountdown($elem, 120, function(){
                            $elem.removeClass("disable");
                        });
                    }).fail(function(){
                        $elem.removeClass("disable");
                    });
                }
                return false;
            });

            this.bindUI = function(){ return this; };
            return this;
        },
        show: function(title){
            this.needDialog.show();
            return this.setNeedBindTip(title);
        },
        showBindDialog: function(){
            this.bindDialog.show();
            return this;
        },
        hide: function(){
            this.needDialog.hide();
            this.bindDialog.hide();
            return this;
        },
        // 需要绑定手机的提示
        setNeedBindTip: function(tip){
            tip && this.needDialog.$root.find(".needBindPhoneContent").html(tip);
            return this;
        },
        on: function(event, fn){
            this.bindDialog.on(event, fn);
            return this;
        },
        off: function(event, fn){
            this.bindDialog.off(event, fn);
            return this;
        },
        fire: function(event){
            this.bindDialog.fire.apply(this.bindDialog, arguments);
            return this;
        }
    };

    // 手机绑定逻辑
    var PhoneBinder = {
        init: function($root, options){
            this.$root = $root;
            this.options = $.extend({
                codeUrl: "http://m.guopan.cn/user/api/getCode.php",
                bindUrl: "http://m.guopan.cn/user/api/verifyCode.php"
            }, options || {});
            return this;
        },
        getPhoneNum: function(){
            return this.$root.find(".phoneText").val().trim();
        },
        getCode: function(){
            return this.$root.find(".codeText").val().trim();
        },
        isPhoneValid: function(){
            var phone = this.getPhoneNum();
            var error;
            if (!phone) {
                error = "请输入手机号";
            } else if (!isPhone(phone)) {
                error = "手机号码格式不正确";
            };
            return error ? (POP.autoTip(error), false) : true;
        },
        isCodeValid: function(){
            var code = this.getCode();
            if (!code) {
                return (POP.autoTip("请输入验证码"), false);
            }
            return true;
        },
        isAllValid: function(){
            return this.isPhoneValid() && this.isCodeValid();
        },
        // 发送验证码
        sendCode: function(){
            return this.sendAjax(this.options.codeUrl, {uphone: this.getPhoneNum()});
        },
        // 绑定手机
        bindPhone: function(callback){
            return this.sendAjax(this.options.bindUrl, {uphone: this.getPhoneNum(), code: this.getCode()})
        },
        sendAjax: function(url, params){
            var def = $.Deferred();
            $.get(url, params, function(){}, "json").done($.proxy(function(data){
                this.ajaxCodePreProcess(data, def);
            }, this)).fail(function(){
                POP.autoTip("请求出错，请稍后再试");
            });
            return def;
        },
        // 根据 sendAjax 返回的 data，预处理一下
        ajaxCodePreProcess: function(data, deferred){
            if (data) {
                switch (data.status) {
                    case 1002:
                        dialogUI.fire("nologin");
                        break;
                    case 1888:
                        deferred && deferred.resolve(data);
                        return;
                    case 1001:
                    default:
                        POP.autoTip(data.msg);
                };
            } else {
                POP.autoTip("交互数据不正确");
            }
            deferred && deferred.reject(data);
        }
    };

    function isPhone(txt){
        return /^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i.test(txt);
    };
    function codeCountdown($elem, senconds, callback){
        var countTxt = "重新获取:{time}";
        var orignalText = $elem.html().trim();
        var timer;

        function start(){
            if (senconds >= 1) {
                $elem.html(countTxt.replace("{time}", senconds));
                senconds--;
                timer = setTimeout(start, 1000);
            } else {
                $elem.html(orignalText);
                callback && callback();
            }
        };
        start();
        return timer;
    };

    var POP;
    if (window.define) {
        define(function(require, exports, module){
            require("./bindPhone.css");
            POP = require("../popup/popup.js");
            module.exports = dialogUI;
        });
    } else {
        POP = window.POP;
        window.bindPhone = dialogUI;
    }
})(window, $);
