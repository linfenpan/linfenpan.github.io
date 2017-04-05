/**
 * by da宗熊
 * 2016/03/09
 * pc端，基于jquery的切换
 * @example:
 *   $("ul.root").swipe(options);
 *   $("ul.root").swipe("next");
 *   $("ul.root").swipe(function(swipe){ swipe.prev(); });
 */
;(function(window, $){

function Swipe($root, options){
    this.$root = $root;
    this.init(options);
};
Swipe.prototype = {
    init: function(options){
        options = this.options = $.extend({
            autoTime: 0,         // 需要自动切换吗
            autoStart: true,     // 自动调用 start
            slideTime: 200,      // 切换时间
            index: 0,            // 默认索引
            callback: function(toIndex, fromIndex, toElem, fromElem){  },       // 动画切换后的回调
            repeat: true         // 是否可以循环滚动
        }, options || {});
        this.index = options.index;
        this._slideEndFn = $.proxy(this._slideEnd, this);

        options.autoStart && this.start();
    },
    start: function(){
        var width = this.width = this.$root.outerWidth();
        this.$children = this.$root.children().each(function(i, elem){
            $(elem).css({position: "absolute", width: width, left: -width});
        });
        this.size = this.$children.size();
        this.isSliding = false;

        this.slideTo(this.index);
        this.options.autoTime && this._bindTimerUI();
    },
    _bindTimerUI: function(){
        this.$root.on("mouseenter", $.proxy(this.stopTimer, this))
                    .on("mouseleave", $.proxy(this.startTimer, this));
        this.startTimer();
    },
    startTimer: function(){
        var self = this, autoTime = self.options.autoTime;
        if (!autoTime) {
            return;
        }
        self.stopTimer();

        self.timer = setTimeout(function(){
            var index = self.index;
            var size = self.size;
            var direction = "next";
            index++;
            if (!self.options.repeat && index >= size) {
                index = 0;
                direction = null;
            }
            self.slideTo(index, direction);
        }, autoTime);
    },
    stopTimer: function(){
        clearTimeout(this.timer);
    },
    prev: function(){
        this.slideTo(this.index - 1, "prev");
    },
    next: function(){
        this.slideTo(this.index + 1, "next");
    },
    slideTo: function(index, direction){
        var size = this.size;
        if (!this.options.repeat && (index < 0 || index >= size) || this.isSliding) {
            return;
        }

        if (index < 0) {
            index = size - 1;
        } else if (index >= size){
            index = 0;
        }

        var oldIndex = this.index, nowIndex = index;
        if (oldIndex == nowIndex) {
            this.$children.eq(oldIndex).css({width: this.width, left: 0});
            return;
        }

        this._slideFromTo(oldIndex, nowIndex, direction);
    },
    _slideFromTo: function(oldIndex, nowIndex, direction){
        var self = this;
        this.stopTimer();
        this.index = nowIndex;

        var $children = this.$children;
        var $old = $children.eq(oldIndex), $now = $children.eq(nowIndex);
        var width = this.width;

        var left = width;   // 默认 next
        var slideTime = this.options.slideTime;
        var slideEndFn = this._slideEndFn;

        var slideCallback;  // 修正第二个参数
        if (typeof direction == "function") {
            slideCallback = direction;
            direction = null;
        }

        if (direction) {
            if (direction == "prev") {
                left = -width;
            }
        } else {
            if (oldIndex > nowIndex) {
                left = -width;
            }
        }

        $old.css({width: width, left: 0});
        $now.css({width: width, left: left});

        this.isSliding = true;

        var options = this.options;
        var beforeFn = options.beforeAnimate;
        beforeFn && beforeFn.call(this, nowIndex, oldIndex, $now, $old);

        $old.animate({left: -left}, slideTime);
        $now.animate({left: 0}, slideTime, function(){
            slideEndFn(nowIndex, oldIndex, $now, $old);
            self.startTimer();
        });
    },
    _slideEnd: function(toIndex, fromIndex, $toElem, $fromElem){
        this.isSliding = false;
        var options = this.options;
        var callback = options.callback;
        callback && callback.call(this, toIndex, fromIndex, $toElem, $fromElem);
    },
    resize: function(){
        this.start();
    }
};

$.fn.extend({
    swipe: function(options){
        var args = arguments;
        this.each(function(i, elem){
            var $elem = $(elem);
            var swipeKey = "fp-swipe";
            var swipe = $elem.data(swipeKey);

            var optionsType = typeof options;
            if (!swipe) {
                swipe = new Swipe($elem, optionsType != "object" ? {  } : options);
                $elem.data(swipeKey, swipe);
            }
            switch(optionsType) {
                case "function":
                    var callback = options;
                    callback.call(elem, swipe);
                    break;
                case "string":
                    var methodName = options;
                    swipe[methodName].apply(swipe, [].slice.call(args, 1));
                    break;
            };
        });
    }
});

})(window, $);
