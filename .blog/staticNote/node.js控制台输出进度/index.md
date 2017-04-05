用控制台打印进度，其实际的原理，就是使用 stream 的 clearLine 和 cursorTo 方法，不过，有现成的类库，可打印漂亮的进度:

``` javascript
var pbar = require("progress");
```
使用 progress 库，可生成类似这样的进度条:
![简单预览](./images/preview.png)


初始化很简单:
``` javascript
var bar = new pbar(':current :bar 进度::percent :elapseds :eta', {
    total: 10,
    complete: "=",  // 完成的符号
    incomplete: ".", // 未完成的符号
    clear: false,    // 完成后，删掉进度条
    callback: function(){
        // 完成后的回调
    }
});
```

每次调用 bar.tick()，自动更新控制台中的进度条。
可使用 bar.complete 判断，是否已经完成进度


其中，第1个参数，是很值得借鉴的地方，通过简单的字符串，配置出不错的效果:

    第 1 个参数，是字符串
     可有的值
       :bar 进度条
       :current 当前 tick 数
       :total 总 tick 数
       :elapsed 当前小事件，秒数
       :percent 进度
       :eta 预计多少秒后完成

PS：如果有换行，会出现BUG哦~
