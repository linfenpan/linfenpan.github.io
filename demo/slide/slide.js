// 2015/10/15
define(function(require, exports, module){
    var touch = require("./touch.js");

    /**
        * @param ul 为需要移动的元素
        * @param distance 移动多少，才挪到下一位，值为 [0~1]
     */
    function slide(ul, distance){
        this.dom = typeof ul === "string" ? document.querySelector(ul) : ul;
        this.distance = 0.15;
        this.onchange = function(){};

        this.init();
    };
    slide.prototype = {
        init: function(){
            this.bindUI();
            this.bindSlide();
        },
        bindUI: function(){
            // 把子元素，插入到新的dom中
            var tagName = this.dom.tagName.toLowerCase();
            var wrap = this.wrap = document.createElement(tagName);
            wrap.setAttribute("style", "width:100%;height:100%;");
            var outer = wrap.cloneNode(), children = [].slice.call(this.dom.children, 0);
            this.count = children.length;

            function setChild(root){
                var width = root.width = outer.clientWidth;
                children.forEach(function(el, index){
                    el.style.width = width + "px";
                    el.style.float = "left";
                    wrap.appendChild(el);
                });
                wrap.style.width = root.count * 100 + "%";
            };

            // 预定的元素，插入到 dom 中
            this.dom.appendChild(outer);
            outer.appendChild(wrap);
            outer.style.overflow = "hidden";

            this.bindUI = function(){
                setChild(this);
            };
            setChild(this);
        },
        bindSlide: function(){
            this.slide = touch.hold(this.wrap);
            var wrap = this.wrap, max = this.count, self = this, startX = 0, index = 0;

            this.slide.onstart = function(){
                wrap.classList.remove("active");
                startX = parseInt(wrap.style.marginLeft || "0");
            };
            this.slide.onmove = function(p, e){
                // 添加弹力
                if((index <= 0 && p.x > 0) || (index >= max - 1 && p.x < 0)){
                    p.x *= 0.3;
                };
                wrap.style.marginLeft =  (startX + p.x) + "px";
            };
            this.slide.onend = function(p, e){
                var width = self.width, distance = self.distance;
                var minDistance = distance <= 1 ? width * distance : distance, left = startX + p.x;
                var cur = Math.ceil(-left / width), lastIndex = index;

                if(Math.abs(p.x) >= minDistance){
                    cur <= index ? index-- : (index = cur);
                };
                self.setIndex(index);
            };

            // 触发一次回调
            setTimeout(function(){
                self.setIndex(0);
            }, 1);
            this.bindSlide = function(){};
        },
        setIndex: function(index){
            var wrap = this.wrap;
            index = index <= 0 ? 0 : index >= this.count ? this.count - 1 : index;
            wrap.classList.add("active");
            wrap.style.marginLeft = -(index * this.width) + "px";

            var lastIndex = this.index;
            this.index = index;

            lastIndex !== index && this.onchange(index);
        },
        resize: function(){
            this.bindUI();
        }
    };

    module.exports = slide;
});
