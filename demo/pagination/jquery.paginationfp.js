/**
* @description 基于 jquery 的分页
* @author da宗熊
* @update 2015-12-07 17:40
* @usage: $("#pager").pagination(2000, { pagerSize: 20, visibleBtnCount: 5, autoLoadFirst: true });
*/
;(function($){

    /**
    * @param {jquery elem} 当前分页根元素
    * @param {int} total 总数据量
    * @param {Object} options 分页参数
    */
    function Pagination($root, total, options){
        this.$root = $root;
        this.total = total;

        this.options = $.extend({
            index: 1,                    // 当前选中第1条数据
            visibleBtnCount: 5,          // 推荐基数
            pageSize: 10,                // 每页的数据量
            autoLoadFirst: false,        // 自动执行第一次回调
            alwaysShowBothEnd: true,     // 两侧经常显示
            prevetDefault: true,         // 点击的时候，阻止默认事件
            locked: false,               // 是否锁定，锁定之后 onSelect 无法执行
            // 按钮格式
            onFormat: function(type, index){
                // 不过有点不人性化了..以后有拓展，再说
                // this.index 是当前的索引, item 是页码
                switch (type) {
                    case "item":
                        return '<a href="#" class="link">'+ index +'</a>';
                    case "first":
                        return '<a href="#" class="link first">首页</a>';
                    case "last":
                        return '<a href="#" class="link last">尾页</a>';
                    case "prev":
                        return '<a href="#" class="link prev">上一页</a>';
                    case "next":
                        return '<a href="#" class="link next">下一页</a>';
                }
            },
            // 选中的回调
            onSelect: function(index){
                // console.log(index);
            }
        }, options || {});

        this.index = this.options.index || 1;

        // 对 onFormat 方法加工
        var options = this.options;
        var onFormat = options.onFormat;
        this.options.onFormat = function(type, index){
            var str = onFormat.apply(this, arguments);
            return str.replace(/(\s|>)/, ' data-index="'+ index +'"$1');
        };
        // 对 onSelect 方法，进行锁定判断
        var onSelect = $.proxy(options.onSelect, this);
        this.options.onSelect = function(index){
            if(!this.locked){
                onSelect.apply(this, arguments);
            }
        };
        // 是否锁定
        this.locked = options.locked;

        this.bindUI();
        this.options.autoLoadFirst ? this.setIndex(this.index, true) : this.update();
    };
    var _proto_ = Pagination.prototype = {};

    // 根据 options 进行初始化
    _proto_.update = function(){
        var options = this.options;
        var fn = options.onFormat;

        var index = this.index, count = options.visibleBtnCount;
        var max = Math.ceil(this.total / options.pageSize);
        if(this.index <= 0){
            this.index = index = 1;
        }else if(this.index > max){
            this.index = index = max;
        }

        // 用于给 fn 做判定
        this.pageCount = max;
        this.isStart = index == 1;
        this.isEnd = index == max;

        // 生成分页
        var html = [];
        var half = Math.floor(count / 2);
        var start = index - half, end = start + count - 1;
        if(index <= half){
            start = 1;
            end = start + count - 1;
            if(end > max){
                end = max;
            }
        }else{
            start = index - half;
            end = start + count - 1;
            if(end > max){
                end = max;
                start = end - count + 1;
            }
            if(start < 1){
                start = 1;
            }
        }

        if(index > 1 || options.alwaysShowBothEnd){
            html.push(fn.call(this, "first", 1));
            html.push(fn.call(this, "prev", index <= 1 ? 1 : index - 1));
        }

        for(var i = start, str; i <= end; i++){
            str = fn.call(this, "item", i);
            if(i == index){
                str = str.replace(/class=("|')(.*?)\1|>/, function(str, split, cls){
                    return str === ">" ? ' class="active">' : ('class=' + split + cls + " active" + split);
                });
            }
            html.push(str);
        }

        if(index < max || options.alwaysShowBothEnd){
            html.push(fn.call(this, "next", index >= max ? max : index + 1));
            html.push(fn.call(this, "last", max));
        }

        this.$root.html(html.join(""));
    };
    _proto_.bindUI = function(){
        this.$root.on("click", "[data-index]", $.proxy(function(e){
            var index = +$(e.target).data("index");
            this.setIndex(index);
            if(this.options.prevetDefault){
                return false;
            }
        }, this));
    };
    _proto_.destroy = function(){
        this.$root.off("click");
        this.$root = this.index = this.total = this.options = null;
    };
    _proto_.setIndex = function(index, force){
        if(!this.locked && (index != this.index || force)){
            this.index = index <= 0 ? 1 : index;
            this.update();

            this.options.onSelect.call(this, this.index);
        }
    };
    _proto_.lock = function(){
        this.locked = true;
    };
    _proto_.unlock = function(){
        this.locked = false;
    };
    /**
     * 重设总数据量
     * @param {Int} 总页数
     * @param {Boolean} 是否再次触发 onSelect 效果
     */
    _proto_.resetTotal = function(total, autoLoadAgain){
        if(total != this.total){
            this.total = total;
            if(autoLoadAgain){
                this.setIndex(this.index, true);
            }else{
                this.update();
            }
        }
    };


    $.fn.extend({
        pagination: function(total, options){
            var args = arguments;
            return this.each(function(i, v){
                var $el = $(v), pager = $el.data("pager");
                var type = typeof args[0];
                if(type === "number"){
                    pager = new Pagination($el, total, options);
                }else if(type === "object"){
                    options = total;
                    total = pager.total;
                    if(pager){
                        options = $.extend(pager.options || {}, options || {});
                        pager.destroy();
                    }
                    pager = new Pagination($el, total, options);
                }else if(pager && type === "string"){
                    pager[args[0]].apply(pager, [].slice.call(args, 1));
                }else{
                    throw "pagination未初始化或调用不合法";
                }
                $el.data("pager", pager);
            });
        }
    });

})(window.jQuery);
