require.config({
    basePath: "./",
    alias: {
        jquery: window.$
    }
});

define("sideBar", function(require, exports, module){
    require("./template/sideBar.css");
    var $sideBar = $("#sideBar");
    var sideBarHtml = require("./template/sideBar.html!ajax");
    var childSelector = ".item[data-role]";
    $sideBar.html(sideBarHtml);
    $sideBar.on("click", childSelector, function(){
        var $elem = $(this);
        $elem.addClass("active").siblings(".active").removeClass("active");
        $sideBar.trigger("itemClick", [$elem]);
    });

    // 外部接口
    exports.addListener = function(callback){
        $sideBar.on("itemClick", function(e, $elem){
            callback.call($elem, $sideBar.find(childSelector).index($elem));
        });
    };
    exports.setIndex = function(index){
        $sideBar.find(childSelector).eq(index).click();
    };
});

define("modLoader", function(require, exports, module){
    var loadMap = {
        loadScript: ["./data/scriptLoader.js", "./data/scriptLoaderData.js"],
        defineModule: ["./data/moduleDefiner.js", "./data/moduleDefiner.json"],
        defineLoader: ["./data/loaderDefiner.js", "./data/loaderDefiner.txt"],
        api: ["./data/api.js"]
    };

    var $content = $("#content");
    exports.load = function(mod){
        var urls = loadMap[mod];
        var orignalUrl = urls[0];

        require(orignalUrl, function(data){
            var result = data && data.html || "";
            if (typeof result !== "string") {
                result = "<br/><br/>&nbsp;&nbsp;" + result.join("<br/>&nbsp;&nbsp;");
            }
            $content.html(orignalUrl + "内容:&nbsp;&nbsp;" + result);
            exports.loadCode(urls);
        });
    };

    var $code = $("#code");
    function prettyWrapHtml(url, html) {
        return "<pre class='prettyprint'>// 文件地址: " + url + "\n" + html + "</pre>";
    };
    exports.loadCode = function(urls) {
        $code.html("loading...");
        var counter = urls.length;
        var loaded = new Array(counter);
        for (var i = 0, max = urls.length; i < max; i++) {
            ;(function(url, index){
                // 同步请求
                require.ajax(url, function(error, html){
                    counter--;
                    loaded[index] = prettyWrapHtml(url, html);
                    tryToAppend();
                });
            })(require.url(urls[i]), i);
        }
        function tryToAppend() {
            if (counter <= 0) {
                $code.html(loaded.join(""));
                window.prettyPrint && window.prettyPrint($code[0]);
            }
        };
    };
});

define("main", function(require){
    var sideBar = require("sideBar");
    var mloader = require("modLoader");
    sideBar.addListener(function(index){
        var mod = this.data("role");
        mloader.load(mod);
    });
    sideBar.setIndex(0);
});

require("main");
