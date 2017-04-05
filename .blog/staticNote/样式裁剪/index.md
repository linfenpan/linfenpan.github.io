``` css
clip: rect(top, right, bottom, left);
```
其中的对应的值，是剪切rect的上、右、下、左边线

针对 ie7 及以下的浏览器，其中 rect 中的逗号，需要省略:

``` css
clip: rect(top right bottom left);
```

clip 裁剪，只能对绝对和固定的元素生效，它的作用是：让这个元素的某个区域可见，其它区域不可见。

被裁剪掉的部分，是透明的
