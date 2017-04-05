// 定义 txt loader
require.loader.add("txt", function(url, callback){
    $.get(url, function(text){
        // 调用 callback 通知 project.js，模块已加载完毕
        callback(text);
    })
});

;define(function(require, exports, module){
    exports.html = require("./loaderDefiner.txt");
});
