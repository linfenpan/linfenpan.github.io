/**
 * @description 仅仅修正 ie10~11 不支持灰度滤镜的BUG
 * @author da宗熊
 * @rely jquery.js
 */

;(function(window){
    var canvas, ctx;
    function fix(selector){
        var $list = $(selector);
        if(!canvas){
            canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
        }
        $list.each(function(i, e){
            var $el = $(e);
            if(e.tagName.toLowerCase() === "img"){
                gray($el.attr("src"), function(src){
                    $el.attr("src", src);
                });
            }else{
                gray($el.css("background-image").replace(/url\(['"]?(.*?)['"]?\)/i, "$1"), function(url){
                    $el.css("background-image", "url("+ url +")");
                });
            }
        });
    };
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
            callback(canvas.toDataURL());

            image = image.onload = image.onerror = null;
        };
        image.src = src;
    };
    window.fixGrayFilter = fix;
})(window);
