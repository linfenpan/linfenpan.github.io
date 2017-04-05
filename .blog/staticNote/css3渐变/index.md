看了下简单的线性 和 放射性渐变，总结如下：

a) 线性渐变
``` css
background: linear-gradient(to right bottom, red, blue);
background: repeating-linear-gradient(red, blue 20%, black 30%);
```
配置颜色之前的，可以是角度值，也可以是 "to right bottom" 这种字符。
0deg，是从上到下，正值的角度，是按顺时针旋转，默认的角度是180deg
而 "repeating-linear-gradient"解析如下:
从红色开始，到20%的时候，完全变为蓝色，到30%的时候，完全变为黑色。重复 0% - 30% 这个变化

-----------

b) 放射性渐变

background: radial-gradient(circle|ellipse[默认形状], red, blue);
==> background: radial-gradient(red, blue); 椭圆的渐变
==> background: radial-gradient(circle, red, blue); 圆形的渐变
==> background: radial-gradient(60% 60%, circle, red, blue 30%); 圆心在(60%,60%)位置的圆形渐变
0%是红色，渐变到蓝色，从 30% 开始，就是纯蓝色

同样，也有repeating的属性:
``` css
background: repeating-radial-gradient(center, circle, red, blue 5%, black 10%);
```

background-image 配合 background-size，可构建很多重复的图形，类似:
做出一个 格子 的背景
``` css
.rect{
	margin:20px;
	width:200px;height:200px;
	border-radius:100px;
	box-shadow:0 0 0 10px rgba(255, 255, 255, .4) inset;

	background-image:
		linear-gradient(-45deg, black 25%, transparent 25%, transparent 75%, black 75%, black),
		linear-gradient(-45deg, black 25%, transparent 25%, transparent 75%, black 75%, black);
	background-size: 50px 50px;
	/* size 的一半 */
	background-position: 0 0, 25px 25px;
}
```
