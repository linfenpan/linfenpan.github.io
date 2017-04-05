/**
 * @author da宗熊
 * @update 2016/02/15
 * @description 用于有顺序索引的抽奖控制，需要设置奖品数、中奖索引
 * @example
 *      var lottery = new Lottery(10);  // 设置 10 个奖品
 *      lottery.setDrawingCallback(function(index){
 *          // index 是当前抽奖中的索引
 *      });
 *      // lottery.setCancelCallback(function(){ 取消抽奖时的callback });
 *      lottery.setWonCallback(function(wonIndex){
 *          // 抽奖完成的callback
 *      });
 *      // lottery.setWonCallbackDelay(500);    // 延迟一定时间，再调用 wonCallback
 *
 *      lottery.isDrawing // 正在抽奖中?
 *      lottery.setWonIndex(5); // 设置奖品的索引
 *      // lottery.setDecayDistance(5);    // 距离 wonIndex 还有 5 位距离的时候，开始衰变
 *      lottery.start(可选参数 speedCtrlFn);    // 开始抽奖
 *      lottery.stop();     // 结束本次抽奖，并调用 wonCallback
 *      // lottery.cancel();    // 取消抽奖，并回调 cancelCallback
 */
define(function(require, exports, module){
    var Lottery = function(prizesCount){
    	this.prizesCount = 9;
    	this.wonIndex = 1;
    	this.startDrawIndex = 1;
        // 执行 wonCallback 的延迟时间
        this.wonCallbackDelay = 120;

    	if (prizesCount) {
    		this.setPrizesCount(prizesCount);
    	}
    };
    Lottery.prototype = {
        start: function(speedCtrlFn){
            // 速度控制函数  speedCtrlFn(this.speedState) ==> state = start | decay
    		this.speedCtrlFn = speedCtrlFn || function(state){
                var speed = 200;
                switch (state) {
                    case "start":
                        break;
                    case "decay":
                        var maxInterval = 400;
                        speed = Math.min(speed + this.decayIndex * (maxInterval / this.decayDistance), 600);
                        break;
                };
                return speed;
            };

    		this.startDraw();
        },
    	startDraw: function(){
    		this.drawIndex = this.startDrawIndex;
    		this.isDrawing = true;    // 正在抽奖中
            this.isInStartDraw = true;  // 在迅速运行中，当开始衰变时，这个值，就为 false 了

            this.startIndex = 1;
            this.speedState = "start";

    		this.drawing(function(){
                this.startIndex++;
    			if (this.isInStartDraw) {
    				return true;
    			} else {
    				// 停止抽奖流程了~应该从 drawIndex --> wonIndex
    				// 理论应该有一个衰变操作
    				this.decay();
    				return false;
    			}
    		});
    	},
    	decay: function(){
    		// 开始衰变的索引
            // 如果 decayDistance > prizesCount，则 decayDistance % prizesCount = 真正需要衰变的索引
    		var decayIndex = this.wonIndex - (this.decayDistance % this.prizesCount);
    		if (decayIndex <= 0) {
    			decayIndex += this.prizesCount;
    		}

    		// 一直 drawing，知道 drawIndex == decayIndex，则开始 decayDrawing
    		this.drawing(function(){
                if (this.drawIndex == decayIndex) {
                    this.decayDraw();
    				return false;
                }
    			return true;
    		});
    	},
    	decayDraw: function(){
            // 当前开始衰变的索引
            this.decayIndex = 1;
            this.speedState = "decay";

    		this.drawing(function(){
                this.decayIndex++;
    			if (this.decayIndex >= this.decayDistance && this.drawIndex == this.wonIndex) {
    				// 执行最后的回掉函数
                    var self = this;
                    setTimeout(function(){
                        self.isDrawing = false;
                        self.wonCallback && self.wonCallback(self.wonIndex);
                    }, self.wonCallbackDelay);
    				return false;
    			}
    			return true;
    		});
    	},
        setDecayDistance: function(distance){
            this.decayDistance = distance;
            return this;
        },
    	drawing: function(sholdContinue, drawTime){
    		var self = this;
    		window.clearTimeout(self.drawTimer);
    		self.drawingCallback && self.drawingCallback(self.drawIndex);

    		if (sholdContinue && sholdContinue.call(self)) {
    			self.drawTimer = window.setTimeout(function(){
    				self.increaseDrawIndex();
    				self.drawing(sholdContinue);
    			}, drawTime || self.speedCtrlFn.call(this, this.speedState) || 200);
    		}
    	},
    	increaseDrawIndex: function(){
    		this.drawIndex++;
    		if (this.drawIndex > this.prizesCount) {
    			this.drawIndex = 1;
    		}
    	},
        stop: function(){
    		this.isInStartDraw = false;
        },
    	cancel: function(){
    		this.stop();
            this.isDrawing = false;
    		window.clearTimeout(this.drawTimer);
            this.cancelCallback && this.cancelCallback();
    	},
        setPrizesCount: function(count){
           this.prizesCount = count;

           // TODO 衰变距离，在这里计算
           this.setDecayDistance(Math.round(this.prizesCount / 4 + Math.random() * this.prizesCount / 4) || 1);

    	   return this;
        },
        setWonIndex: function(index){
    		this.wonIndex = index;
    		return this;
        },
        setDrawingCallback: function(callback){
    		this.drawingCallback = callback;
    		return this;
        },
        setWonCallback: function(callback){
    		this.wonCallback = callback;
    		return this;
        },
        setWonCallbackDelay: function(delay){
            this.wonCallbackDelay = delay;
            return this;
        },
        setCancelCallback: function(callback){
            this.cancelCallback = callback;
            return this;
        }
    };

    module.exports = Lottery;
});
