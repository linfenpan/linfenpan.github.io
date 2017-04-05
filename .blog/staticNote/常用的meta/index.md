## 一、viewport设置

``` html
<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximun-scale=1.0, width=device-width" >
```

## 二、禁止数字转电话

``` html
<meta name="format-detection" content="telephone=no"/>
```


## 三、禁止UC自动放大字体

``` html
<meta name="wap-font-scale" content="no">
```


## 四、全屏

``` html
<!-- uc强制竖屏 -->
<meta name="screen-orientation" content="portrait">

<!-- UC强制全屏 -->
<meta name="full-screen" content="yes">

<!-- UC应用模式 -->
<meta name="browsermode" content="application">

<!-- QQ强制竖屏 -->
<meta name="x5-orientation" content="portrait">

<!-- QQ强制全屏 -->
<meta name="x5-fullscreen" content="true">

<!-- QQ应用模式 -->
<meta name="x5-page-mode" content="app">
```


## 五、搜索引擎索引方式

robotterms是一组使用逗号(,)分割的值，通常有如下几种取值：none，noindex，nofollow，all，index和follow。确保正确使用nofollow和noindex属性值。

``` html
<meta name="robots" content="index,follow" /><!--
    all：文件将被检索，且页面上的链接可以被查询；
    none：文件将不被检索，且页面上的链接不可以被查询；
    index：文件将被检索；
    follow：页面上的链接可以被查询；
    noindex：文件将不被检索；
    nofollow：页面上的链接不可以被查询。
 -->
```


## 六、页面重定向和刷新

content内的数字代表时间（秒），既多少时间后刷新。如果加url,则会重定向到指定网页（搜索引擎能够自动检测，也很容易被引擎视作误导而受到惩罚）。

``` html
<meta http-equiv="refresh" content="0;url=" />
```


## 七、keyword和description

``` html
<meta name="keywords" content="your tags" />
<meta name="description" content="150 words" /><!-- 不超过150个字符 -->
```


## 八、忽略识别邮箱

``` html
<meta content="email=no" name="format-detection" />
```


## 九、添加智能 App 广告条 Smart App Banner

告诉浏览器这个网站对应的app，并在页面上显示下载banner(如下图)。

``` html
<meta name="apple-itunes-app" content="app-id=myAppStoreID, affiliate-data=myAffiliateData, app-argument=myURL">
```


## 十、优先使用 IE 最新版本和 Chrome

``` html
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" /><!-- 关于X-UA-Compatible -->
<meta http-equiv="X-UA-Compatible" content="IE=6" ><!-- 使用IE6 -->
<meta http-equiv="X-UA-Compatible" content="IE=7" ><!-- 使用IE7 -->
<meta http-equiv="X-UA-Compatible" content="IE=8" ><!-- 使用IE8 -->
```


## 十一、浏览器内核控制

国内浏览器很多都是双内核（webkit和Trident），webkit内核高速浏览，IE内核兼容网页和旧版网站。而添加meta标签的网站可以控制浏览器选择何种内核渲染。

``` html
 <meta name="renderer" content="webkit|ie-comp|ie-stand">
```


## 十二、禁止浏览器从本地计算机的缓存中访问页面内容

这样设定，访问者将无法脱机浏览。

``` html
<meta http-equiv="Pragma" content="no-cache">
```


## 十三、Windows 8

``` html
<meta name="msapplication-TileColor" content="#000"/> <!-- Windows 8 磁贴颜色 -->
<meta name="msapplication-TileImage" content="icon.png"/> <!-- Windows 8 磁贴图标 -->
```


## 十四、站点适配

主要用于PC-手机页的对应关系。

``` html
<meta name="mobile-agent"content="format=[wml|xhtml|html5]; url=url"><!--
[wml|xhtml|html5]根据手机页的协议语言，选择其中一种；
url="url" 后者代表当前PC页所对应的手机页URL，两者必须是一一对应关系。
 -->
```


## 十五、转码申明

用百度打开网页可能会对其进行转码（比如贴广告），避免转码可添加如下meta

``` html
<meta http-equiv="Cache-Control" content="no-siteapp" />
```
