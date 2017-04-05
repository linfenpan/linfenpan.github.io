define(function(require, exports, module){
    require("./siteFooter.css");

    var html = ['<footer class="site-footer">',
                    '<a class="copyRight" href="http://m.guopan.cn">',
                        '<span class="logo"></span><span class="text">果盘版权所有</span>',
                    '</a>',
	            '</footer>'
            ].join("\n");

    exports.init = function(elem){
        var eBody = elem || document.body || document.getElementsByTagName("body")[0];
        eBody.insertAdjacentHTML("beforeEnd", html);
    };

});
