// 默认模块定义方式，通过脚本路径定位
define(function(require, exports, module){
    module.exports = require("innerModule");
});

// 内置模块定义
define("innerModule", function(require, exports, module){
    // full版，预编了 json loader
    // 此处 require 是从当前脚本所在文件夹，开始寻址
    module.exports = require("./moduleDefiner.json");
});
