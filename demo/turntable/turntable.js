/**
 * 转盘抽奖例子，这里就不进行封装了，需要的自己加工
 * 参考: http://www.17sucai.com/preview/26528/2016-02-24/cj/index.html
 * @author da宗熊
 * @last-modify-time 2018/11/13 14:30
 * @example
 *  var turntable = new Turntable({ values: { 1: [0, 180], 2: [180, 360] } });
 *  // 启动转盘
 *  turntable.start();
 *  // 在请求回来后，设置中奖项的索引
 *  turntable.setWonIndexAndStop(1, 是否停止动画并立即到中奖的位置?默认是 false);
*/
function merge(obj1, obj2) {
  for (var key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}

// 兼容 requestAnimationFrame
(function() {
  var vendors = ['webkit', 'moz'];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vp+'CancelAnimationFrame'] || window[vp+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    window.requestAnimationFrame = function(callback) {
      var now = new Date().getTime();
      var nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function() { callback(lastTime = nextTime); }, nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
}());

/**
 * 路程公式  s = v0 * t + 1/2at^2，速度公式 v1 = v0 + at
 * @param {number} v0 初速度
 * @param {number} v1 加速后达到的速度
 * @param {number} time 已经经历过的秒数
 * @param {number} acceleration 加速度
 * @return {number}
**/
function calc(v0, v1, time, acceleration) {
  if (acceleration * time > v1 - v0) {
    var accelerTime = (v1 - v0) / acceleration;
    var s1 = v0 * accelerTime + 1/2 * acceleration * accelerTime * accelerTime;
    return v1 * (time - accelerTime) + s1;
  }
  return v0 * time + 1/2 * acceleration * time * time;
}

function Turntable(opts) {
  opts = opts || {};
  if (!('values' in opts)) {
    throw new Error('请先设置 values 的值');
  }

  var ctx = this;
  var options = ctx.options = merge({
    // 初速度
    initSpeed: 0,
    // 每秒转动的角度
    angularPerSecond: 360,
    // 每秒的角度加速度
    angularAcceleration: 180,
    // 结束时，顺带走多少圈
    roundForEnd: 2,
    // 奖品列表 ->  0deg < 0 <= 180deg;  180deg < 1 <= 360deg
    values: {
      0: [0, 180],
      1: [180, 360]
    }
  }, opts);

  ctx.deg = 0;
  ctx.isDrawing = false;

  ctx.wonDeg = null;
  ctx.wonIndex = null;
  ctx.wonCallback = options.wonCallback || function(index, deg) { console.log('last:' + index, deg); };
  ctx.animate = options.animate || function(deg) { console.log(deg); }
}

Turntable.prototype = {
  start: function() {
    var ctx = this;
    if (ctx.timer) {
      throw new Error('请停止后，再调用 start()');
    }

    var options = ctx.options;

    ctx.start_time = new Date/1;
    function run() {
      ctx.isDrawing = true;
      ctx.timer = window.requestAnimationFrame(function() {
        var now = new Date;
        var r = calc(options.initSpeed, options.angularPerSecond, (now - ctx.start_time)/1000, options.angularAcceleration) % 360;
        ctx.deg = r;
        ctx.animate(r);
        run();
      });
    }
    run();
  },

  _cancelTimer: function() {
    var ctx = this;
    window.cancelAnimationFrame(ctx.timer);
    ctx.timer = null;
    ctx.isDrawing = false;
  },

  stop: function(immediately) {
    var ctx = this;
    if (ctx.wonIndex == null) {
      throw new Error('请先设置 .wonIndex');
    }

    var options = ctx.options;
    ctx._cancelTimer();

    if (immediately) {
      // 立即结束
      ctx.animate(ctx.wonDeg);
      ctx.wonCallback(ctx.wonIndex, ctx.wonDeg);
    } else {
      // 进行递减
      // 别管那么多，就按正常速度，进行递减，以免出现神奇的问题
      var v0 = options.angularPerSecond;
      var v1 = 0;
      // 距离奖品的距离
      var sprice = (ctx.wonDeg - ctx.deg) + 360;
      // 总的减速的距离
      var s = sprice + Math.floor(options.roundForEnd) * 360;
      // 加速度公式: v1^2 - v0^2/2x；x 为总路程
      var a = Math.pow(v1, 2) - Math.pow(v0, 2)/(2 * s);
      // 根据速度，求时间: v1 = v0 + at
      var t = Math.abs((v1 - v0) / a);

      // console.log(`wonDeg: ${ctx.wonDeg}  deg: ${ctx.deg}  v0: ${v0}  s: ${s}  sprice: ${sprice}  t: ${t}  a: ${a}`);

      // 开始衰减了
      var end_time = new Date;
      var start_deg = ctx.deg;
      function run() {
        ctx.isDrawing = true;
        ctx.timer = window.requestAnimationFrame(function() {
          var time = ((new Date) - end_time) /  1000;
          // 减速到停止
          var r = v0 * time + 1/2 * a * time * time;
          // console.log(r);
          if (r >= s || time >= t) {
            ctx.deg = ctx.wonDeg;
            ctx.animate(ctx.wonDeg);
            ctx.wonCallback(ctx.wonIndex, ctx.wonDeg);
            ctx._cancelTimer();
          } else {
            var d = (r + start_deg) % 360;
            ctx.deg = d;
            ctx.animate(d);
            run();
          }
        });
      }
      run();
    }
  },

  setWonIndex: function(index) {
    var ctx = this;
    var options = ctx.options;
    var values = options.values || {};
    if (!values[index]) {
      throw new Error('缺values的配置');
    }

    ctx.wonIndex = index;
    var arr = values[index];
    var wonDeg = arr[0] + Math.random() * (arr[1] - arr[0]);
    ctx.wonDeg = wonDeg;
  },

  setWonIndexAndStop: function(index, immediately) {
    var ctx = this;
    ctx.setWonIndex(index);
    ctx.stop(immediately);
  }
};
