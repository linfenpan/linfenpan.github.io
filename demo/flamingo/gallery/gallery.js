define(function(require, exports, module){
    require("./gallery.css");
    var ui = {
        hideClass: "pic-watcher-hide",
        activeClass: "pic-watcher-active",
        /** 检测浏览器前缀 */
        cssAttrTransform: (function(){
            var html = document.documentElement;
            var list = ["t", "webkitT", "MozT", "msT", "oT"], prefix = "";
            for(var i = 0, max = list.length; i < max; i++){
                if(html.style.hasOwnProperty(list[i] + "ransform")){
                    prefix = list[i];
                    break;
                }
            };
            return prefix + "ransform";
        })(),
        index: 0,
        init: function(root, options){
            var $root = this.$root = document.querySelector(root);
            $root.classList.add("pic-watcher");
            $root.classList.add(this.hideClass);

            options = options || {};
            // force 是阻力, rate 是下一页的百分比
            this.options = {force: options.force || 0.3, rate: options.rate || 0.2};

            this.initHtml();
            this.bindUI();

            this.init = null;
            return this;
        },
        initHtml: function(){
            this.$root.innerHTML = '<div class="pic-watcher-title"><!--0/0--></div><div class="pic-watcher-container"></div>';

            this.$text = this.$root.querySelector(".pic-watcher-title");
            this.$wrap = this.$root.querySelector(".pic-watcher-container");
        },
        bindUI: function(){
            var self = this;
            // 图片加载成功后，隐藏loading
            // 捕获图片的 loading
            this.$wrap.addEventListener("load", function(e){
                var elem = e.target;
                if(elem.tagName.toLowerCase() === "img"){
                    var $load = elem.parentElement.querySelector(".pic-watcher-load");
                    $load.classList.remove(self.hideClass);
                }
            }, true);


            // 绑定 touch 事件
            // startX touch开始的x坐标, transformX touch开始的transformX, maxX 是最大能移动的距离
            var $wrap = this.$wrap, startX, transformX, maxX;
            var options = this.options;
            var wrap = {
                point: function(e){
                    e = e.targetTouches && e.targetTouches[0] || e.changedTouches && e.changedTouches[0] || e;
                    return {x: e.pageX, y: e.pageY};
                },
                start: function(e){
                    var cr = wrap.point(e);
                    startX = cr.x;

                    // 当前移动到哪
                    var width = $wrap.clientWidth;
                    var curX = $wrap.style[self.cssAttrTransform].replace(/translate3d\s*\(([^,]+),[^,]+,[^,]+\)/, "$1").trim();
                    if(curX){
                        // 有 %，动态计算，否则，当作 px
                        if(/%$/.test(curX)){
                            curX = parseInt(curX) / 100 * width;
                        }else{
                            curX = parseInt(curX);
                        }
                    }else{
                        curX = 0;
                    }
                    transformX = curX;
                    maxX = -width * (self.list.length - 1);

                    $wrap.classList.remove("active");
                    e.preventDefault();
                },
                move: function(e){
                    var cr = wrap.point(e);
                    var x = cr.x - startX;
                    if(transformX + x > 0 || transformX + x < maxX){
                        x *= options.force;
                    }
                    $wrap.style[self.cssAttrTransform] = "translate3d("+ (transformX + x) +"px,0,0)";
                    e.preventDefault();
                },
                end: function(e){
                    var cr = wrap.point(e);
                    var abs = Math.abs(cr.x - startX);
                    if(abs === 0){
                        // setTimeout(function(){
                            self.hide();
                            self.closeCallback();
                        // }, 1)

                    }else{
                        $wrap.classList.add("active");
                        var rate = options.rate;
                        if(abs >= (rate > 1 ? rate : $wrap.clientWidth * rate)){
                            self._setIndex(self.index + (cr.x - startX > 0 ? -1 : 1));
                        }else{
                            self._setIndex(self.index);
                        }
                    }
                    e.preventDefault();
                }
            };
            $wrap.addEventListener("touchstart", wrap.start, false);
            $wrap.addEventListener("touchmove", wrap.move, false);
            $wrap.addEventListener("touchend", wrap.end, false);

            // 窗口大小变化
            function winResize(){
                self.$root.style.width = Math.min(window.innerWidth, document.body.clientWidth) + "px";
                self.list && self._setIndex(self.index);
            }
            window.addEventListener("resize", winResize, false);
            winResize();

            this.bindUI = null;
        },
        setList: function(list, index){
            list = list || [];
            // 图片列表 + wrap 中 的 html 内容
            var res = this.list = [];
            var html = '';
            list.forEach(function(item, index){
                if(typeof item === "string"){
                    res.push(item);
                }else{
                    // 就是元素列表了
                    res.push(item.getAttribute("src"));
                }
                html += '<div class="pic-watcher-item" style="left:'+(100 * index)+'%;">\
                            <span class="pic-watcher-load">loading..</span>\
                            <img class="pic-watcher-image" />\
                        </div>';
            });
            this.$wrap.innerHTML = html;
            this.$list = this.$wrap.querySelectorAll(".pic-watcher-item");

            if(typeof index !== "undefined"){
                this._setIndex(index || 0);
            }
            return this;
        },
        _setIndex: function(index){
            var max = this.list.length;
            index = index || 0;
            index = index < 0 ? 0 : index >= max ? max - 1 : index;

            var self = this;
            // 把前后左右预先加载
            [-1, 0, 1].forEach(function(val){
                var i = index + val;
                var $item = self.$list[i];
                $item && self._preload($item, i);
            });

            this.$text.innerHTML = "(" + (index + 1) + "/" + max + ")";
            this.index = index;

            this.$wrap.style[self.cssAttrTransform] = "translate3d(-"+ (this.$wrap.clientWidth * index) +"px,0,0)";
            return this;
        },
        // 预先加载
        _preload: function($item, index){
            $item.querySelector(".pic-watcher-image").setAttribute("src", this.list[index]);
            $item.querySelector(".pic-watcher-load").classList.remove(this.hideClass);
        },
        show: function(index){
            this.$root.classList.remove(this.hideClass);
            // 触发重绘..
            this.$root.offsetWidth = this.$root.offsetWidth;
            this.$root.classList.add(this.activeClass);

            this._setIndex(index || this.index);
            return this;
        },
        hide: function(){
            var self = this;
            self.$root.classList.remove(self.activeClass);
            // 这里触发 reflow 竟然也是没效果的
            setTimeout(function(){
                self.$root.classList.add(self.hideClass);
            }, 100);
            return this;
        },
        closeCallback: function(){}
    };
    // 定义查看大图的画廊
    function PicWatcher(){
        this.init.apply(this, arguments);
    };
    PicWatcher.prototype = ui;

    module.exports = PicWatcher;
});
