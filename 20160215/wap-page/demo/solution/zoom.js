// @NOTICE 用 zoom 代替 transform: scale()，完美解决啊~
define(function(require, exports, module){

    var solution = {
        init: function(options) {
            options = options || {};
            this.options = {
                width: options.width || 640,                                    // 基础宽度
                landscapeAsPortrait: options.landscapeAsPortrait || false,      // 横屏当竖屏展示
                fixResize: !!options.fixResize
            };
            this.eHtml = document.documentElement;

            this.bindUI();
        },
        bindUI: function(){
            var reset = this.reset.bind(this);
            window.addEventListener("load", reset, false);
            this.options.fixResize && window.addEventListener("resize", reset, false);
            window.addEventListener("orientationchange", reset, false);
            this.reset();
        },
        reset: function(){
            var options = this.options;
            // why 没用 document.body.client 对比？因为页面所有内容，都应该在窗口内，如果有超出，请反省
            var deviceWidth = window.innerWidth;

            var isLandscape = options.landscapeAsPortrait && screen.availWidth > screen.availHeight;
            if (isLandscape) {
                // ios 上的 uc，availWidth 和 availHeight 旋屏后，并不会跟着改变
                var screenWidth = Math.max(screen.availWidth, screen.availHeight);
                var screenHeight = Math.min(screen.availWidth, screen.availHeight);
                deviceWidth = deviceWidth * screenHeight / screenWidthh;
            }
            var zoom = Math.min(1, deviceWidth / options.width);

            this.eHtml.style.zoom = zoom;
        }
    };

    module.exports = solution;
});
