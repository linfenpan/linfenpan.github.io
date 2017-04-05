var windownRequire = require;
define(function(require, exports){
    var result = [];

    // <br/>
    result.push( "方法:" );

    result.push( "&nbsp;&nbsp; /data/api.js地址:" + windownRequire.url("/data/api.js") );
    result.push( "&nbsp;&nbsp; 加载样式: require.css(绝对路径)");
    result.push( "&nbsp;&nbsp; 加载脚本: require.loadScript(绝对路径, callback); 回调的第1个参数，是error");
    result.push( "&nbsp;&nbsp; ajax功能: require.ajax(绝对路径, callback); 回调的第1个参数，是error; 第2个参数，是返回内容");
    result.push( "" );

    // <br/>
    result.push( "配置: ");

    // 默认寻址路径，是当前网页访问目录
    result.push( "&nbsp;&nbsp; 项目默认寻址地址: require.config({ basePath: 相对路径/绝对路径 });");

    // 配置后，可通过 var $ = require("jquery"); 获取到 jquery
    result.push( "&nbsp;&nbsp; 非模块化脚本的别名: require.config({ alias: { jquery: window.jquery } });");

    // 配置后，可通过 require("{static}/mod.js"); 加载 http://www.test.com/mod.js 内容
    result.push( "&nbsp;&nbsp; 模板数据: require.config({ template: { static: 'http://www.test.com' } });");

    exports.html = result;
});
