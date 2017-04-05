// enterScreen.js + cssParser.js 组装动画
;(function(window){
    function addAnimate(elems){
        for (var i = 0, max = elems.length; i < max; i++) {
            var $elem = $(elems[i]);
            $elem.data("parser", new CssParser());
            reset($elem);
        };
        function reset($elem){
            setStyleFromAttr($elem, "an-init");
        };
        function play($elem){
            setStyleFromAttr($elem, "an-enter");
        };
        function setStyleFromAttr($elem, attr){
            var parser = $elem.data("parser");
            parser.css($elem.data(attr));

            $elem[0].getClientRects();
            $elem.attr("style", parser.toString());
        };

        var checker = new EnterScreen({
            elems: elems,
            enter: function(){
                play($(this));
            },
            leave: function(){
                reset($(this));
            },
            delay: 320
        });
        checker.start();
        return checker;
    };
    addAnimate($("[data-an-init]").toArray());
})(window);


// 瀑布
;$(function(){
    var $water = $(".waterfall");
    $water.waterfall({
        itemWidth: $water.children().eq(0).outerWidth(),
        initStyle: { opacity: 0 },
        vertical: 15,
        horizontal: 15,
    });
    $water.waterfall(function(wf){
        wf.setReflowAnimate(function($elem, position, next){
            $elem.addClass("active");
            $elem.css(position);
            next();
        });
        wf.reflow();

        var reflowTimer;
        $water.find(".image").on("load", function(){
            clearTimeout(reflowTimer);
            reflowTimer = setTimeout(function(){
                wf.reflow();
            }, 500);
        });

        $(window).resize(function(){
            wf.resize();
        });
    });
});
