/**
 * by da宗熊
 * 2016/03/08
 * example:
 *	var announcement = new Announcement($root|需要滚动的元素, { speed: 每秒的滚动速度, speedRate: font-size的多少倍，作为速度}); // speed 和 speedRate 二选一
 *  annoucement.startAnimate();
 */
;define(function(require, exports, module){
    var $ = require("jquery");

    function Announcement($root, options){
        $root = typeof $root === "string" ? $($root) : $root;
        options = options || {};
        this.$root = $root;
        this.options = options;

        this.init();
    };
    Announcement.prototype = {
        init: function(){
            var $root = this.$root;
            var options = this.options;
            // 复制一份相同内容
            //   当滚动到结束位置时，需要把动画重设到 0px 位置
            $root.html(function(i, html){ return html + html; });

            this.reset();
            this.bindUI();

            this.init = $.noop;
        },
        reset: function(){
            var $root = this.$root;
            var options = this.options;

            this.speed = options.speed || (parseInt($root.css("font-size")) * (options.speedRate || 2));
            this.scrollWidth = $root.outerWidth() / 2;
            this.animateDuration = this.scrollWidth / this.speed;

            this.stopAnimate();
        },
        bindUI: function(){
            this.$root.on("transitionend webkitTransitionEnd", $.proxy(function(e){
                var event = e.originalEvent;
                if (/transform/.test(event.propertyName)) {
                    this.stopAnimate();
                    this.startAnimate();
                }
            }, this));
        },
        startAnimate: function(){
            var transition = "transform " + this.animateDuration + "s linear";
            var transform = "translateX(-"+ this.scrollWidth +"px)";
            this.$root.css({
                "transition": transition,
                "-webkit-transition": "-webkit-" + transition,
                "-webkit-transform": transform,
                "transform": transform
            });
        },
        stopAnimate: function(){
            this.$root.css({
                "-webkit-transition": "none",
                "transition": "none",
                "-webkit-transform": "translateX(0)",
                "transform": "translateX(0)"
            });
            this._triggerLayout();
        },
        _triggerLayout: function(){
            this.$root[0].getClientRects();
        }
    };

    module.exports = Announcement;
});
