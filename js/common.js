var $Body = $("body");

// module: 移动端 menu 显示
;(function($, $body){
    // 给移动端拷贝一条独立的导航
    var $nav = $(".navigation"),
        $btn = $(".navigation-toggle");

    $btn.click(function(){
        $btn.toggleClass("active");
        $nav.toggleClass("active");
    });
})(window.$, $Body);


// module: 背景冒泡
;(function(window, canvas){
    var bubble = new Image();
    bubble.onload = loadedFinish;
    bubble.src = (window.ROOT_PATH || "./") + "assert/bubble.png";

    var $window = $(window);
    var $container = $(".header .container");
    canvas.width = $container.outerWidth();
    canvas.height = $container.outerHeight();
    // 修改最后一次 resize
    var timer;
    $window.on("resize", function(){
        clearTimeout(timer);
        timer = setTimeout(function(){
            canvas.width = $container.outerWidth();
            canvas.height = $container.outerHeight();
        }, 100);
    });

    function RandomBubble(canvas, ctx, image){
        this.ctx = ctx;
        this.image = image;
        this.width = this.height = Math.random() * (image.width - 11) + 11;
        // 坐标、速度
        this.y = canvas.height;
        this.x = this.width + Math.random() * (canvas.width - 3 * this.width);
        this.speed = Math.random() + 1;

        // 正弦的角度
        this.deg = 0;
        this.degSpeed = 1 + Math.random() * 3;
    }
    RandomBubble.prototype = {
        next: function(){
            if(this.y <= -this.height){
                this.destroy();
            }else{
                this.y -= this.speed;
                this.deg += this.degSpeed;
                this.ctx.drawImage(this.image, this.x + Math.sin(Math.PI / 180 * this.deg) * this.width, this.y, this.width, this.height);
            }
        },
        destroy: function(){
            this.destroyCallback && this.destroyCallback();
            this.ctx = this.image = this.width = this.height = this.x = this.y = this.next = null;
        },
        setDestroyCallback: function(cb){
            this.destroyCallback = cb;
        }
    };

    function loadedFinish(){
        var ctx = canvas.getContext("2d");

        var bubbles = {}, bubbleId = 1, isWindowBlur;
        var currentBubblesCount = 0;
        var maxBubblesCount = 20;
        var bubbleTimeSpace = 1000;

        if (/mobile/i.test(navigator.userAgent)) {
          maxBubblesCount = 3;
          bubbleTimeSpace = 2000;
        }

        function autoBubble(){
            if(isWindowBlur || currentBubblesCount >= maxBubblesCount){
                return;
            }
            var bl = new RandomBubble(canvas, ctx, bubble);
            var id = "bubble_" + bubbleId++;

            if (bubbleId >= 1000000) {
              bubbleId = 0;
            }

            currentBubblesCount++;
            bl.setDestroyCallback(function(){
                delete bubbles[id];
                currentBubblesCount--;
            });
            bubbles[id] = bl;
        }
        var lastTime = 0;
        function drawBubble(time){
            if(!isWindowBlur && time - lastTime >= 20){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for(var i in bubbles){
                    if (bubbles.hasOwnProperty(i)) {
                      bubbles[i].next();
                    }
                }
                // 帧频控制，以免运行过快
                lastTime = time;
            }
            requestAnimationFrame(drawBubble);
        }
        requestAnimationFrame(drawBubble);
        setInterval(autoBubble, bubbleTimeSpace);
        autoBubble();

        // 窗体离开之后，不应该再执行
        ;(function(){
            var keyWithPrefix = function(prefix, key){
                return prefix ? prefix + key.replace(/^./, function(str){return str.toUpperCase()}) : key;
            }
            var prefix = "";
            var list = ["webkit", "moz", "ms", ""];
            for(var i = 0, max = list.length; i < max; i++){
                if(document[keyWithPrefix(list[i], "hidden")] !== undefined){
                    prefix = list[i];
                    break;
                }
            }
            isWindowBlur = document[keyWithPrefix(prefix, "hidden")];
            // NOTICE: 事件是全部小写的
            document.addEventListener(prefix + "visibilitychange", function(e){
                isWindowBlur = document[keyWithPrefix(prefix, "hidden")];
            }, false);
            // 手机黑屏的时候，有用
            window.addEventListener("focus", function(){
                isWindowBlur = false;
            }, false);
            window.addEventListener("blur", function(){
                isWindowBlur = true;
            }, false);
        })(window.document);
    }
})(window, $("#canvas")[0]);


// module: 代码格式化
$(function(){
    window.prettyPrint && window.prettyPrint();
});

// module: 安装搜索引擎
$(function(){
    (function(w,d,t,u,n,s,e){w['SwiftypeObject']=n;w[n]=w[n]||function(){
      (w[n].q=w[n].q||[]).push(arguments);};s=d.createElement(t);
      e=d.getElementsByTagName(t)[0];s.async=1;s.src=u;e.parentNode.insertBefore(s,e);
    })(window,document,'script','//s.swiftypecdn.com/install/v2/st.js','_st');
    _st('install','dyv38Q-_GT65RvxVc81g','2.0.0');
});
