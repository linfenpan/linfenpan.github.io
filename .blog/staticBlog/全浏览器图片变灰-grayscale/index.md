## css3 灰度滤镜

用css3实现灰度滤镜，其实很简单：

``` css
-webkit-filter: grayscale(100%);    /* webkit内核支持程度较好 */  
   -moz-filter: grayscale(100%);    /* 其他内核现在并不支持，为了将来兼容性书写 */  
    -ms-filter: grayscale(100%);  
     -o-filter: grayscale(100%);  
        filter: grayscale(100%);    /* 标准写法 */  
```

其中grayscale的取值为0%-100%，也可以用0-1取代，0%代表彩色图像，100%代表完全的灰度。

css filter的浏览器兼容情况如下，Chrome31+，Safari7+，Opera20+，ios Safari6+,Android Browser4.4+,Blackberry 10+均支持了-webkit-filter的方式，IE不支持，firefox不支持。

----------

## svg 实现

我们需要考虑IE和firefox的兼容方案，Firefox虽说不支持css filter，但是支持svg effects for html，html文件可以调用svg里面的效果，不仅仅是滤镜、还可以是mask、clip等。
svg实现灰度滤镜的方法：

新建 grayscale.svg 文件:
``` svg
<svg xmlns="http://www.w3.org/2000/svg">  
    <filter id="grayscale">  
        <feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"/>  
    </filter>
</svg>
```
样式更改为:
``` css
filter: url("grayscale.svg#grayscale");	/** #grayscale 是svg 中的id*/
-webkit-filter: grayscale(100%);
   -moz-filter: grayscale(100%);
    -ms-filter: grayscale(100%);
     -o-filter: grayscale(100%);
        filter: grayscale(100%);
        filter: gray;
```

实现效果如下：

![原图](./assert/pic.jpg)  原图
![变灰](./assert/pic1.jpg)  变灰

----------

## MORE

上述方法，几乎囊括了所有的浏览器。但是，事实上，也只是几乎而已。
如果你发现某款浏览器[如浏览模式不正确的ie9-10]，还是死活不支持灰度滤镜，可以考虑以下方法。

使用canvas对图片进行处理，原理如下：
canvas读取图片 --> 对图片进行变回处理 --> 获取变灰后的base64的图片地址 --> 替换原来的图片

代码如下:
``` javascript
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

function gray(src, callback){
    var image = new Image();
    image.onload = image.onerror = function(){
        canvas.width = image.width;
        canvas.height = image.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);

        var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (var y = 0; y < imgPixels.height; y++) {
          for (var x = 0; x < imgPixels.width; x++) {
            var i = (y * 4) * imgPixels.width + x * 4;
            var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
            imgPixels.data[i] = avg;
            imgPixels.data[i + 1] = avg;
            imgPixels.data[i + 2] = avg;
          }
        }
        ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
        // 回调，参数为变回后的图片地址
        callback(canvas.toDataURL());

        image = image.onload = image.onerror = null;
    };
    image.src = src;
};
// 调用，注意了，因为canvas的特性，ctx.getImageData 只能获取同域名的图片，或者设置了 Access-Control-Allow-Origin 的图片
gray("/test.jpg", function(src){
    document.getElementById("testImage").setAttribute("src", src);
});
```

----------

## 最后

给个完整的[demo](./demo/index.html)
