最近有收到需求，要做全屏切换的活动宣传也。
细思极恐，发现自己压根儿没有全屏切换相关的积累。
于是决定留下点什么内容，以供参考。

-------------------------

全屏切换，现在主流有几款插件
  * swiper.js 各类强大的切换功能
  * fullpage.js 基于 jquery.js 的全屏滚动插件
  * slip.js 移动端没依赖的屏幕滚动插件

这次做移动端，所以主要使用 slip.js 了。
[官方地址](https://github.com/binnng/slip.js)

-------------------------

# 使用小例子

``` javascript
// 以 #container 作为父容器，创建 'y' 轴滚动；同样，传入 'x'，则是 x轴滚动了
var slip = Slip(document.querySelector('#container'), 'y');
// 开始构建全屏滚动
slip.webapp();
// 动画时间，设定为 300ms
slip.time(300);

// 滚动结束时的回调
slip.end(function() {
  console.log(this, this.page);
});
```

不过官方的脚本，对屏幕 resize 和 orientationchange 的支持不友好。
所以这里小小修改了一下脚本: [非压缩版](/demo/slip.js)/[压缩版](/demo/slip-min.js)
添加了 resetWebapp 方法，提供有需要的同学，自动重置当前webapp的状态
