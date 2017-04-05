/*!
    @author da宗熊
    @version 1.0.0
    @license ISC
    @lastModify 2016-3-31
    @repository https://github.com/linfenpan/collection/tree/master/plugins/swipe
    @example
        var swiper = new Swiper(element, options)
    @options
        [index, ratio, elastic, slideTime, resetTime, nextDistance, interval, repeat, wrapSelector, childSelector, slideCallback]
    @bug
        no listener at "transitionEnd" event, the behavior of the timer may be strange when we are away from the page
*/
!function(window){
var Empty = null;

function noop(){ };

function $(selector){
    return typeof selector === "string" ? document.querySelector(selector) : selector;
};

function addListener(elem, event, callback, isBubble){
    var arr = event.split(" ");
    arr.forEach(function(event, index){
        elem.addEventListener(event, callback, isBubble || false);
    });
};

function hasProperty(obj, pro) {
    return obj.hasOwnProperty(pro);
};

function toArray(obj){
    return [].slice.call(obj, 0);
};

function each(obj, fn){
    for (var i in obj) {
        if (hasProperty(obj, i)) {
            fn.call(obj, obj[i], i, obj);
        }
    }
};

function extend(source, target){
    each(target, function(value, key){
        source[key] = value;
    });
    return source;
};

var htmlStyle = document.documentElement.style;

var cssPrefix = (function(style){
    var prefix = "";
    var list = ["webkitT", "MozT", "msT", "oT", "t"];

    for (var i = 0, max = list.length; i < max; i++) {
        var item = list[i];
        if (style.hasOwnProperty(item + "ransform")) {
            prefix = item.slice(0, -1);
            break;
        }
    }

    return prefix;
})(htmlStyle);

function queryPrefix(key) {
    if (htmlStyle.hasOwnProperty(key)) {
        return key;
    }
    return cssPrefix + key.slice(0, 1).toUpperCase() + key.slice(1);
};

function css(elem, cssObject){
    var style = elem.style;
    each(cssObject, function(value, key){
        style[queryPrefix(key)] = value;
    });
};

function getTranslateX(elem){
    var x = elem.style[queryPrefix("transform")];
    x = x && parseInt(x.match(/translateX\((.*?)\)/)[1]) || 0;
    return x;
};

function setTranslateX(elem, x, duration) {
    css(elem, {transform: "translateX("+ x +"px)", transitionDuration: (duration || 0) + "ms"})
};

var TouchHolder = (function(){
    var ui = {}, isTouchMode = /mobile/i.test(window.navigator.userAgent);

    // 对应的事件
    var event = {
        start: isTouchMode ? "touchstart" : "mousedown",
        move: isTouchMode ? "touchmove" : "mousemove",
        end: isTouchMode ? "touchend touchcancel" : "mouseup mouseleave",
        needCatch: "click"
    };

    // 当前坐标
    function point(e){
        e = e.targetTouches && e.targetTouches[0] || e.changedTouches && e.changedTouches[0] || e;
        return {x: e.pageX, y: e.pageY};
    };

    // 持有某个元素
    ui.hold = function(elem){
        elem = $(elem);
        var holder = {
            start: Empty,   // start/end -> {x:, y:, spaceX: 移动了x距离, spaceY: 移动了y距离}
            end: Empty,
            onStart: Empty,
            onMove: Empty,
            onEnd: Empty,
        };

        var eventsHandler = {
            onStart: function(e){
                var startPoint = holder.start = point(e);
                startPoint.spaceX = startPoint.spaceY = 0;

                holder.end = Empty;
                holder.onStart && holder.onStart(startPoint, e);
            },
            onMove: function(e){
                if(holder.start){
                    var diff = eventsHandler.calcDiffAfterStart(e);
                    var callbackReturnFalse = !(holder.onMove && holder.onMove(diff, e));
                    callbackReturnFalse && e.preventDefault();
                }
            },
            onEnd: function(e){
                if(holder.start){
                    var diff = holder.end = eventsHandler.calcDiffAfterStart(e);
                    holder.start = null;
                    holder.onEnd && holder.onEnd(diff, e);
                }
            },
            onPrevent: function(e){
                var diff = holder.end || {};
                if(Math.abs(diff.spaceX) > 1){
                    e.preventDefault();
                    e.stopPropagation();
                };
            },
            // 计算开始之后，移动的差值
            calcDiffAfterStart: function(e){
                var currentPoint = point(e);
                currentPoint.spaceX = currentPoint.x - holder.start.x;
                currentPoint.spaceY = currentPoint.y - holder.start.y;
                return currentPoint;
            }
        };

        addListener(elem, event.start, eventsHandler.onStart);
        addListener(elem, event.move, eventsHandler.onMove);
        addListener(elem, event.end, eventsHandler.onEnd);

        !isTouchMode && addListener(elem, event.needCatch, eventsHandler.onPrevent, true);

        return holder;
    };

    return ui;
})();

// options 可配置项，参考 reset 中的数组
function Swiper(root, options){
    this.init(root, options);
};

Swiper.prototype = {
    // 根元素、滑动的子元素、每次需要运动的子元素
    $root: Empty,
    $wrap: Empty,
    $childs: Empty,
    $moves: Empty,
    $oldMoves: Empty,

    options: Empty,
    touchHolder: Empty,

    isNext: false,
    isPrev: false,
    isFirstMove: false,     // 第一次触发 move 事件
    isPreventMoving: false, // 阻止 moving 处理

    index: 0,
    length: 0,
    visibleCount: Empty,
    ratio: 1,         // 每个子项，占据容器的百分比
    slideTime: 300,     // 滑动总时间
    resetTime: 200,     // 重置时间
    slideCallback: noop,
    rootWidth: Empty,
    itemWidth: Empty,
    elastic: 0.3,       // 阻力
    oldNextDistance: Empty, // 记录上一次 nextDistance 的值
    nextDistance: 0.2,  // 滚动多少距离，去到下一个
    timer: Empty,
    interval: 3000,     // 3秒，自动切换到下一个
    repeat: true,       // 循环模式

    wrapSelector: ".swiper-wrap",
    childSelector: ".swiper-item",

    init: function(root, options){
        this.$root = $(root);
        css(this.$root, {visibility: "visible"});

        this.reset(options);
        this.setIndex(this.index);
        this.startTimer();
        this.init = noop;
    },
    reset: function(options){
        options = options || { };
        // combine optoins with default value
        ["index", "ratio", "elastic", "slideTime", "resetTime", "nextDistance", "interval", "repeat", "wrapSelector",  "childSelector", "slideCallback"].forEach(function(key, index){
            if (hasProperty(options, key)) {
                this[key] =  options[key]
            }
        }.bind(this));

        this.ratio > 1 && (this.ratio = 1);
        this.rootWidth = this.$root.clientWidth;
        this.itemWidth = this.rootWidth * this.ratio;

        this.$wrap = this.$root.querySelector(this.wrapSelector);
        this.$childs = toArray(this.$root.querySelectorAll(this.childSelector));

        this.length = this.$childs.length;

        this.$childs.forEach(function(child, index){ child.dataset.index = index; });
        css(this.$wrap, {width: this.length * this.itemWidth + "px"});

        if (this.ratio >= 1) {
            this.visibleCount = 1;
        } else {
            this.visibleCount = Math.floor(1 / this.ratio);
            var leaveRatio = (1 - this.ratio * this.visibleCount) / 2;
            this.visibleCount += 2 * Math.ceil(leaveRatio / this.ratio);
            // 偶数 -> 基数，以中间一位，作为中点
            if (this.visibleCount % 2 == 0) { this.visibleCount++; }
        }

        console.log(this.visibleCount);

        if (this.oldNextDistance != this.nextDistance) {
            this.nextDistance = this.nextDistance < 1 ? this.nextDistance * this.rootWidth : this.nextDistance;
            this.oldNextDistance == this.nextDistance;
        }

        // 如果数量不足，就强制进入非循环模式
        if ((this.visibleCount - 1) * 2 + 1 > this.length) {
            this.repeat = false;
        }

        // 非循环模式，关闭计时器功能
        !this.repeat && (this.interval = 0);

        this.placeChilds();
        this.bindUI();
    },
    placeChilds: function(){
        var itemWidth = this.itemWidth;
        this.$childs.forEach(function(child, index){
            css(child, {width: itemWidth + "px"});
        });
    },
    bindUI: function(){
        this.touchHolder = TouchHolder.hold(this.$wrap);
        this.bindHolder();
        this.bindUI = noop;
    },
    bindHolder: function(){
        var self = this;
        var holder = self.touchHolder;
        holder.onStart = function(start){
            return self.moveStart();
        }
        holder.onMove = function(movePoint){
            return self.moveIng(movePoint);
        }
        holder.onEnd = function(endPoint){
            return self.moveEnd(endPoint);
        }
    },
    moveStart: function(){
        var self = this;
        self.$moves.forEach(function(child){
            child.dataset.startx = getTranslateX(child);
        });
        self.isPreventMoving = false;
        self.isFirstMove = true;
        self.stopTimer();
    },
    moveIng: function(point){
        var self = this;
        var spaceX = point.spaceX, spaceY = point.spaceY;

        // Y 轴大于 X 轴，忽略此次事件
        if (self.isPreventMoving || self.isFirstMove && Math.abs(spaceX) < Math.abs(spaceY)) {
            self.isFirstMove = false;
            return self.isPreventMoving = true;
        }
        self.isFirstMove = false;

        // @notice 性能不好的浏览器，moving 时，会有些许卡顿，所以，缩减了移动点的间距，使之没那么卡
        spaceX *= 0.85;
        
        // 添加阻力效果
        if (!self.repeat) {
            var elastic = self.elastic;
            var index = self.index;
            if(index <= 0 && spaceX > 0 || index >= self.length - 1 && spaceX < 0){
                spaceX *= elastic;
            }
        }

        self.$moves.forEach(function(child){
            setTranslateX(child, +child.dataset.startx + spaceX, 0);
        });
    },
    moveEnd: function(point){
        var self = this, spaceX = point.spaceX;
        if (Math.abs(spaceX) > self.nextDistance) {
            if (spaceX > 0) {
                self.prev();
            } else {
                self.next();
            }
        } else {
            self.$moves.forEach(function(child){
                setTranslateX(child, +child.dataset.startx, self.resetTime);
            });
        }
        self.isPreventMoving = false;
        self.startTimer();
    },
    next: function(withAnimate){
        withAnimate = typeof withAnimate == "undefined" ? true : withAnimate;
        this.setIndex(this.index + 1, withAnimate);
    },
    prev: function(withAnimate){
        withAnimate = typeof withAnimate == "undefined" ? true : withAnimate;
        this.setIndex(this.index - 1, withAnimate);
    },
    setIndex: function(index, withAnimate){
        var self = this;
        if (index == self.index) {
            self.isNext = false;
            self.isPrev = false;
        } else {
            self.isNext =  index > self.index;
            self.isPrev = !self.isNext;
        }
        var index = self.index = self.fixIndex(index);

        // 找出 (visibleCount - 1) + childs[index] + (visibleCount - 1) 之间的所有元素，记录在 $moves 中
        self.$oldMoves = self.$moves;
        self.$moves = [];

        var edgeCount = self.visibleCount - 1;
        edgeCount <= 0 && (edgeCount = 1);

        var start = index - edgeCount;
        var end = index + edgeCount;

        while (start <= end) {
            self.$moves.push(self.$childs[self.fixIndex(start)]);
            start++;
        }
        // TODO 重置 $oldMoves，排列$moves
        self.placeVisibleChilds(withAnimate);

        self.slideCallback.call(self, index);
    },
    fixIndex: function(index){
        var isRepeatMode = this.repeat;
        var length = this.length;
        if (isRepeatMode) {
            while(index < 0) {index += length;}
            while(index >= length) { index -= length;}
            return index;
        } else {
            return index < 0 ? 0 : index >= length ? length - 1 : index;
        }
    },
    placeVisibleChilds: function(withAnimate){
        var self = this;
        var itemWidth = self.itemWidth;
        var rootWidth = self.rootWidth;

        // TODO $oldMoves 位置重置
        self.$oldMoves && self.$oldMoves.forEach(function(child){
            var orignX = self.getChildOrignX(child.dataset.index);
            setTranslateX(child, -orignX + rootWidth * 1.2, 0);
        });

        // TODO 新的 $moves 位置排列，next -> 最后1位元素没动画  prev -> 第1位元素没动画，因为这里恰好每次变动元素，只有1个哦!
        // TODO 非循环模式下， a0 a0 index a3 a4 忽略前面所有a0,  a0 a1 index a3 a3 忽略后面所有a3
        var len = self.$moves.length;
        var half = Math.ceil(len / 2) - 1;
        var totalLen = itemWidth * len;
        var startX = -(totalLen / 2 - self.rootWidth / 2);
        var $moves = self.$moves;
        $moves.forEach(function(child, placeIndex){
            var index = child.dataset.index, time;

            if (!self.repeat) {
                if (placeIndex < half) {
                    if ($moves[placeIndex] == $moves[placeIndex + 1]) return;
                } else if (placeIndex > half){
                    if ($moves[placeIndex] == $moves[placeIndex - 1]) return;
                }
            }

            if (self.isNext && placeIndex == len - 1 || self.isPrev && placeIndex == 0) {
                time = 0;
            } else {
                time = withAnimate ? self.slideTime : 0;
            }
            var orignX = self.getChildOrignX(index);
            setTranslateX(child, -orignX + startX + itemWidth * placeIndex, time);
        });
    },
    getChildOrignX: function(index){
        return +index * this.itemWidth;
    },
    resize: function(){
        this.reset();
        this.$childs.forEach(function(child, index){
            setTranslateX(child, -this.getChildOrignX(index) + this.rootWidth * 1.2);
        }.bind(this));
        this.setIndex(this.index);
    },
    startTimer: function(){
        if (this.interval) {
            this.stopTimer();
            this.timer = window.setTimeout(function(){
                this.next();
                this.startTimer();
            }.bind(this), this.interval);
        }
    },
    stopTimer: function(){
        if (this.interval) {
            window.clearTimeout(this.timer);
        }
    }
};

window.Swiper = Swiper;
}(window);