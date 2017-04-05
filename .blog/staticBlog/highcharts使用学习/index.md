## 安装

可以在Highcharts官网上，下载它的最新版本: [http://www.highcharts.com/download](http://www.highcharts.com/download)

**1、 与jquery配合使用**

jquery 是目前使用最广泛的 JS 框架，本教程所用的所有例子都是基于 jQuery 的。
``` html
<script src="http://cdn.hcharts.cn/jquery/jquery-1.8.3.min.js"></script>
<script src="http://cdn.hcharts.cn/highcharts/highcharts.js"></script>
```

**2、 Highcharts Standalone Framework**

因为jquery体积，差不多有100K，就算是jq2也有接近50K。在移动端带宽有限的情况下，并不是最好的选择。
如果你的页面，仅仅只是Highcharts需要用到jq，这种情况，可以考虑使用 **Highcharts Standalone Framework** ，
因为Highcharts Standalone Framework压缩后的大小，只有2K哦~
``` html
<script src="http://cdn.hcharts.cn/highcharts/adapters/standalone-framework.js"></script>
<script src="http://cdn.hcharts.cn/highcharts/highcharts.js" ></script>
```

**3、MooTool 或 Prototype**

使用 MooTools 或 Prototype 需要额外的引入 Highcharts 提供的适配器。 使用 MooTools 需要引入的文件如下：
``` html
<script src="http://cdn.hcharts.cn/mootools/MooTools-Core-1.5.1.js"></script>
<script src="http://code.highcharts.com/adapters/mootools-adapter.js"></script>
<script src="http://cdn.hcharts.cn/highcharts/highcharts.js"></script>
```

使用 Prototype 需要引入的文件如下：
``` html
<script src="http://cdn.hcharts.cn/prototype/prototype-1.7.2.js"></script>
<script src="http://code.highcharts.com/adapters/prototype-adapter.js"></script>
<script src="http://cdn.hcharts.cn/highcharts/highcharts.js"></script>
```

-----------------------


## 使用

引入Highcharts后，在body部分，创建一个div，并且制定div的id，高度和宽度，代码如下:
``` html
<div id="container" style="min-width: 800px; height: 400px;"></div>
```

然后编写Highcharts相关的代码，一个简单的图标实例，代码如下:
``` javascript
$(function(){
    $("#container").highcharts({
        chart: {
            type: 'column'                         //指定图表的类型，默认是折线图（line）
        },
        title: {
            text: '第一个Highcharts图表'           //指定图表标题
        },
        xAxis: {
            title: {
                text: '月份'
            },
            categories: ['1月', '2月', '3月']      //指定x轴分组
        },
        yAxis: {
            title: {
                text: '体重(kg)'                  //指定y轴的标题
            }
        },
        series: [{                                 //指定数据列
            name: 'da宗熊',                        //数据列名
            data: [50, 55, 60]                     //数据
        }, {
            name: 'xiao宗熊',
            data: [30, 40, 32]
        }]
    });
});
```

[完整demo点这里](./demo/demo1.html)

PS: Highcharts的默认高度是 400px，当浏览器窗体 resize 时，Highcharts 会尝试重设图表的宽、高。


-------------------


## 如何学习Highcharts

Highcharts的配置，是一个json字符串，类似于 ```{char: {type: "line"}}```，
json具有易于阅读和编写的特点，所以，学习Highcharts并不难，只是纯粹的熟悉API程度的问题而已。

**知识准备**

- 熟悉html，jquery，json等前端知识
- 至少掌握一门后台语言，如 php，java等（毕竟Highcharts只是做数据展示而已，具体的数据，还得后台获取）

**几点建议**

- 多看API，官方中文API地址: [api](http://www.hcharts.cn/api/index.php)
- 可在官网demo上，寻找心仪的图表，并复制使用: [官方演示](http://www.hcharts.cn/demo/highcharts.php)
- 多写demo，多实践
