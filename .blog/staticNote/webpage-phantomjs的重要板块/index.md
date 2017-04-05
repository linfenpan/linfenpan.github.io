对于 webpage 板块，有很多方法，它是跟网页打交道的重要板块
更详尽的API，请参考: http://phantomjs.org/page-automation.html

``` javascript
var page = require("webpage").create();
```

## 打开网页
``` javascript
page.open("http://www.baidu.com/", function(status){
   if(status == "success"){
      // 成功加载完成页面
   }
});
```

## 网页保存为图片/psd
``` javascript
// 在网页加载完成之后
page.render("图片路径|psd路径");
```

## 在打开的网页中，注入外部脚本
``` javascript
page.includeJs("脚本路径", function(){
    // 注入成功后，执行操作
});
```

## 在打开的页面中，执行脚本
``` javascript
page.evaluate(function(){
    // 能访问到当前页面的 window 级下的所有内容
    // return 的内容，只能是简单的对象，不能含有闭包、函数
    // 这个函数里的 console.log，将会失效
    return document.title;
});
```

## 页面console生效
``` javascript
page.onConsoleMessage = function(msg){
    // 只有定义了这个方法，console.log才会打印
};
```

## 监听所有请求、接收
``` javascript
page.onResourceRequested = function(request){
   // 页面所有请求，都会经过这个函数, request是请求的内容 -> Object
};
page.onResourceReceived = function(response){
   // 页面接收到的请求，都会经过这个函数, response是接受的内容 -> Object
};
```

## 屏幕尺寸相关参数
``` javascript
// width 和 height 一定要设定齐全，才能生效
page.viewportSize = {width: 1920, height: 900};
```

## 截图相关参数
``` javascript
// 参数也是缺1不可
page.clipRect = {top:0, left:0, width:1024, height:500};
```

## 设置浏览器的userAgent
``` javascript
console.log("当前userAgent: " + page.settings.userAgent);
// 重设
page.settings.userAgent = "webapp";
```
