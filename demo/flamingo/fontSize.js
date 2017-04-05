// 根据窗口大小，修正字体
;define(function(require, exports, module){
    var htmlEl = document.documentElement || document.getElementsByTagName("html")[0];
    var maxWidth = 640, minWidth = 320;
    var minFont = 10;
    var landscapeAsPortrait = false;

    function resize(){
        var windowWidth = Math.min(document.body.clientWidth, window.innerWidth);
        if (landscapeAsPortrait && windowWidth > window.innerHeight) {
            // @notice ios上的uc浏览器，旋屏后，宽度、高度，并不会改变诶..
            var sWidth = Math.max(screen.availWidth, screen.availHeight);
            var sHeight = Math.min(screen.availWidth, screen.availHeight);
            windowWidth = windowWidth * screen.sHeight / screen.sWidth;
        }
        var winWidth = Math.max(minWidth, Math.min(maxWidth, windowWidth));
        var fontSize = winWidth * minFont / minWidth;

        htmlEl.style.fontSize = fontSize + "px";
    };

    exports.init = function(options){
        // 防重复 init
        this.init = function(options){
            options = options || {};
            maxWidth = options.maxWidth || maxWidth;
            minWidth = options.minWidth || minWidth;
            minFont = options.minFont || minFont;
            landscapeAsPortrait = options.landscapeAsPortrait || false;
        };
        this.init(options);

        window.addEventListener('orientationchange', resize);
        window.addEventListener('load', resize);
        resize();
    };
    exports.resize = resize;
});
