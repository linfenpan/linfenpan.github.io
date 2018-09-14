// @NOTICE 屏幕旋转，页面重置比较厉害
define(function(require, exports, module){
    var viewportSelector = "meta[name=viewport]";
    var solution = {
        init: function(options){
            options = options || {  };
            this.options = {
                width: options.width || "device-width",
                maxScale: options.maxScale || 1,
                minScale: options.minScale || 0.1,
                // 横屏以竖屏标准显示？
                landscapeAsPortrait: options.landscapeAsPortrait || false
            };
            this.eHead = document.head;

            this.addViewportIfNotExist();
            this.removeSurplusViewport();

            this.eMeta = this.queryViewports()[0];
            // viewport's width = device-width
            var viewportOptions = this.getViewportOptions();
            viewportOptions["width"] = "device-width";
            this.setViewportContent(viewportOptions);

            this.bindUI();
        },
        addViewportIfNotExist: function(){
            var viewports = this.queryViewports();
            if (viewports.length <= 0) {
                var meta = document.createElement("meta");
                meta.setAttribute("name", "viewport");
                meta.setAttribute("content", "user-scalable=no,width=device-width");
                this.eHead.appendChild(meta);
            }
        },
        removeSurplusViewport: function(){
            var viewports = this.queryViewports();
            for (var i = 0, max = viewports.length; i < max; i++) {
                if (i > 0) {
                    this.eHead.removeChild(viewports[i]);
                }
            }
        },
        queryViewports: function(){
            return document.querySelectorAll(viewportSelector);
        },
        bindUI: function(){
            // 旋屏之后，需要一定时间，才能获取到正确宽度【腾讯家的 BUG
            var reset = this.resetViewport.bind(this);
            // window.addEventListener("load", reset, false);
            window.addEventListener("orientationchange", reset, false);
            reset();
        },
        resetViewport: function(){
            var options = this.options;
            var width = options.width;
            var deviceWidth = this.getDeviceWidth();
            var scale = Math.max(options.minScale, Math.min(options.maxScale, deviceWidth / width));
            scale = isNaN(scale) ? 1 : scale;

            var viewportOptions = this.getViewportOptions();
            viewportOptions["initial-scale"] = viewportOptions["maximum-scale"] = scale;
            this.scale = scale;

            this.setViewportContent(viewportOptions);
        },
        getDeviceWidth: function(){
            // 因为常会放得很大~
            var windowWidth = Math.max(document.body.clientWidth, window.innerWidth);
            var screenWidth = screen.availWidth, screenHeight = screen.availHeight;
            var deviceWidth = windowWidth * (this.scale || 1);
            if (this.options.landscapeAsPortrait && windowWidth > windowHeight) {
                // ios 上的 uc，availWidth 和 availHeight 旋屏后，并不会跟着改变
                var oldScreenWidth = screenWidth;
                screenWidth = Math.max(oldScreenWidth, screenHeight);
                screenHeight = Math.min(oldScreenWidth, screenHeight);
                deviceWidth = deviceWidth * screenHeight / screenWidth;
            }
            return deviceWidth;
        },
        getViewportOptions: function(){
            var meta = this.eMeta;
            var content = meta.getAttribute("content");
            var options = {  };
            content.replace(/\s*([^=,]*)\s*=\s*([^,]*)/g, function(str, key, value){
                options[key] = value;
            });
            return options;
        },
        setViewportContent: function(options) {
            var contents = [];
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    contents.push(key + "=" + options[key]);
                }
            }
            this.eMeta.setAttribute("content", contents.join(","));
        }
    };

    module.exports = solution;
});
