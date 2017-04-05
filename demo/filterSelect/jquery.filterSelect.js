/**
 * by da宗熊
 *  一次性插件，不提供删除操作
 * @example:
 *  $("select").filterSelect({blurClear: 离开自动清空内容?, focusClear: 聚焦自动清空?, autoFilt: 是否基于当前输入内容，自动过滤，默认true});
 *  $("select").on("change", fn); 监听回调
 *  通过 $("select").val() 拿到最新的值
 *  通过 $("select").trigger("setEditSelectValue", 2); 设置选中的值为 2
 *  通过 $("select").trigger("optionChange", updateInputValue?) 触发 更新 option 的值
*/
$.fn.filterSelect = (function(){
    // 我就 很 纠结的，把样式内嵌在这里了
    var isInit = false;
    function initCss(){
        isInit = true;
        var style = document.createElement("style");
        var csstext = '.m-input-select{display:inline-block;*display:inline;position:relative;-webkit-user-select:none;}\
                        \n.m-input-select ul, .m-input-select li{padding:0;margin:0;}\
                        \n.m-input-select .m-input{padding-right:22px;}\
                        \n.m-input-select .m-input-ico{position:absolute;right:0;top:0;width:22px;height:100%;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAATElEQVQoU2NkIBEwkqiegTwNcXFx/4m1CW4DMZoWLVrEiOIkfJpAikGuwPADNk0wxVg1gASRNSErxqkBpgldMV4NuEKNvHggNg5A6gBo4xYmyyXcLAAAAABJRU5ErkJggg==) no-repeat 50% 50%;}\
                        \n.m-input-select .m-list-wrapper{}\
                        \n.m-input-select .m-list{display:none;position:absolute;z-index:1;top:100%;left:0;right:0;max-width:100%;max-height:250px;overflow:auto;border-bottom:1px solid #ddd;}\
                        \n.m-input-select .m-list-item{cursor:default;padding:5px;margin-top:-1px;list-style:none;background:#fff;border:1px solid #ddd;border-bottom:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\
                        \n.m-input-select .m-list-item:hover{background:#2D95FF;}\
                        \n.m-input-select .m-list-item-active{background:#2D95FF;}';
        style = $("<style>"+ csstext +"</style>")[0];
        // ie 竟然坑了...，用 jq 的插入吧
        // if(style.styleSheet) {
        //     style.styleSheet.cssText = csstext;
        // }else{
        //     style.appendChild(document.createTextNode(csstext));
        // };

        var head = document.head || document.getElementsByTagName("head")[0];
        if(head.hasChildNodes()){
            head.insertBefore(style, head.firstChild);
        }else{
            head.appendChild(style);
        };

    };

    return function(options){
        !isInit && initCss();
        options = $.extend({blurClear: true, focusClear: true, autoFilt: true}, options || {});

        // 在 focus 和 blur 是还原为原始内容
        var isBlurClear = options.blurClear;
        var isFocusClear = options.focusClear;
        var isAutoFilt = options.autoFilt;

        var $body = $("body");
        this.each(function(i, v){
            var $sel = $(v), $div = $('<div class="m-input-select"></div>');
            var $input = $("<input type='text' class='m-input' />");
            var $wrapper = $("<ul class='m-list'></ul>");
            $div = $sel.wrap($div).hide().addClass("m-select").parent();
            $div.append($input).append("<span class='m-input-ico'></span>").append($wrapper);

            // 遮罩层显示 + 隐藏
            var wrapper = {
                reset: function(){
                    this.get$list();
                    this.setIndex(this.$list.filter(".m-list-item-active"));
                    this.setActive(this.index);
                },
                show: function(){
					$wrapper.show();
                    this.reset();
                },
                hide: function(){
                    $wrapper.hide();
                },
                next: function(){
                    return this.setActive(this.index + 1);
                },
                prev: function(){
                    return this.setActive(this.index - 1);
                },
                $list: null,
				get$list: function(){
					this.$list = $wrapper.find(".m-list-item:visible");
					return this.$list;
				},
                index: 0,
                $cur: null,
                setActive: function(i){
                    // 找到第1个 li，并且赋值为 active
                    var $list = this.get$list(), size = $list.size();
                    if(size <= 0){
                        this.$cur = null;
                        return;
                    }
                    $list.filter(".m-list-item-active").removeClass("m-list-item-active");
                    if(i < 0){
                        i = 0;
                    }else if(i >= size){
                        i = size - 1;
                    }
                    this.index = i;
                    this.$cur = $list.eq(i).addClass("m-list-item-active");
                    this.fixScroll(this.$cur);
                    return this.$cur;
                },
                fixScroll: function($elem){
                    // console.log($wrapper);
                    var height = $wrapper.height(), top = $elem.position().top, eHeight = $elem.outerHeight();
                    var scroll = $wrapper.scrollTop();
                    // 因为 li 的 实际　top，应该要加上 滚上 的距离
                    top += scroll;
                    if(scroll > top){
                        $wrapper.scrollTop(top);
                    }else if(top + eHeight > scroll + height){
                        // $wrapper.scrollTop(top + height - eHeight);
                        $wrapper.scrollTop(top + eHeight - height);
                    }
                },
                setIndex: function($li){
                    if($li && $li.size() > 0){
                        this.index = this.get$list().index($li);
                        $li.addClass("m-list-item-active").siblings().removeClass("m-list-item-active");
                    }else{
                        this.index = 0;
                    }
                }
            };

            // input 的操作
            var operation = {
                clearInput: function(){
                    isFocusClear && ($input.val(""));
                },
                // 文字更变了，更新 li, 最低效率的一种
                textChange: function(){
                    var val = isAutoFilt ? $.trim($input.val()) : "";
                    $wrapper.find(".m-list-item").each(function(i, v){
                        if(v.innerHTML.toLowerCase().indexOf(val) >= 0){
                            $(v).show();
                        }else{
                            $(v).hide();
                        }
                    });
                    wrapper.show();
                },
                // 设值
                setValue: function($li){
                    if($li && $li.size() > 0){
                        var val = $.trim($li.html());
                        $input.val(val).attr("placeholder", val);
                        wrapper.setIndex($li);
                        $sel.val($li.attr("data-value")).trigger("change");
                    }else{
                        $input.val(function(i, v){
                            return $input.attr("placeholder");
                        });
                    };
                    wrapper.hide();
                    this.offBody();
                },
                // 监听 body 被点击，如果不是点击到 $wrap or $input，则隐藏
                onBody: function(){
                    var self = this;
                    setTimeout(function(){
                        self.offBody();
                        $body.on("click", self.bodyClick);
                    }, 10);
                },
                offBody: function(){
                    $body.off("click", this.bodyClick);
                },
                bodyClick: function(e){
                    var target = e.target;
                    if(target != $input[0] && target != $wrapper[0]){
                        wrapper.hide();
                        isBlurClear && operation.setValue();
                        operation.offBody();
                    }
                }
            };

            // 遍历 $sel 对象
            function resetOption(e, updateInputValue){
                var html = "", val = "";
                $sel.find("option").each(function(i, v){
                    html += '<li class="m-list-item'+ (v.selected ? " m-list-item-active" : "") +'" data-value="'+ v.value +'">'+ v.text +'</li>';
                });
                $wrapper.html(html);
                $input.attr("placeholder", val);
                updateInputValue && $input.val(val);
                wrapper.reset();
            };
            resetOption(null, true);
            $sel.on("optionChange", resetOption);
            $sel.on("setEditSelectValue", function(e, val){
                var $all = $wrapper.find(".m-list-item"), $item;
                for(var i = 0, max = $all.size(); i < max; i++){
                    $item = $all.eq(i);
                    if($item.attr("data-value") == val){
                        operation.setValue($item);
                        return;
                    }
                }
            });

            // input 聚焦
            $input.on("focus", function(){
                operation.clearInput();
                operation.textChange();
                operation.onBody();
            }).on("input propertychange", function(e){
                operation.textChange();
            }).on("keydown", function(e){
                // 上 38, 下 40， enter 13
                switch(e.keyCode){
                    case 38:
                        wrapper.prev();
                        break;
                    case 40:
                        wrapper.next();
                        break;
                    case 13:
                        operation.setValue(wrapper.$cur);
                        break;
                }
            });

            $div.on("click", ".m-input-ico", function(){
                // 触发 focus 和 blur 事件
                // focus 是因为 input 有绑定
                // 而 blur，实际只是失去焦点而已，真正隐藏 wrapper 的是 $body 事件
                $wrapper.is(":visible") ? $input.blur() : (operation.clearInput(), $input.trigger("focus"));
            });

            // 选中
            $wrapper.on("click", ".m-list-item", function(){
                operation.setValue($(this));
                return false;
            });

            setTimeout(function(){
                // for ie
                wrapper.hide();
            }, 1)

        });

        return this;
    };
})();
