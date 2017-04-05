clip-path这个属性，当前IE全线不支持，而android 4.4版本后，开始支持。
至于firefox，当前也仅仅支持与svg的配合。
其余的，还得添加各自前缀，不过学习一下无妨。

其中，收集的一些 clip-path属性，如下:

``` txt
1. inset 矩形，9个参数 (top right bottom left round top-left-radius top-right-radius bottom-right-radius bottom-left-radius);
       其中，前4和后4个参数，均可合并【类似margin和border-radius】

2. circle 圆形，3个参数 (radius at x y)

3. ellipse 椭圆，4个参数 (x-radius y-radius a x y)

4. polygon 不规则自闭合图形，参数成对出现 (x1 y1, x2 y2, ...)

5. 引用 svg 的 <clipPath>，url(#clipPath)
```


学习代码:
``` html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>css3 剪切</title>
    <style>
        * { margin: 0; padding: 0; }
        #back { width: 600px; height: 450px; background: url(./pic.jpg) no-repeat; }

        /*
        	inset 最多可容纳 9 个参数
            inset (top right bottom left round top-left-radius top-right-radius bottom-right-radius bottom-left-radius);
            其中，top right bottom left 可参考 padding，都是可以合并为1个或2个参数
            而 top-left-radius、top-right-radius、bottom-right-radius、bottom-left-radius 也是可以参考 border-radius
        */
        .clip1 {
            /* 切一个矩形: 上右下左，以边缘定位 */
            -webkit-clip-path: inset(30px 200px 200px 20px);
        }
        .clip2 {
            -webkit-clip-path: inset(10% round 20% 20% 20% 0);
        }


        /*
            画圆，只有一种参数: circle(r at x y);
        */
        .clip3 {
            -webkit-clip-path: circle(200px at 200px 200px);
        }

        /*
            话椭圆，只有一种参数：ellipse(x-radius y-radius at x-axis y-axis)
        */
        .clip4 {
            -webkit-clip-path: ellipse(200px 100px at 200px 200px);
        }

        /*
            自闭合多边形，polygon(x1 y1, x2 y2, ...) 参数不限
        */
        .clip5 {
            -webkit-clip-path: polygon(10px 10px, 400px 10px, 400px 400px, 350px 400px, 350px 500px, 300px 400px, 10px 400px);
        }

        /*
            也可以使用 svg 的 <clipPath> 元素
        */
        .clip6 {
            -webkit-clip-path: url(#svgPath);
        }
    </style>
</head>
<body>
    <svg height="0" width="0">
        <defs>
            <clipPath id="svgPath">
                <circle stroke="#000000" stroke-miterlimit="10" cx="50" cy="50" r="40" />
                <circle stroke="#000000" stroke-miterlimit="10" cx="193.949" cy="235" r="74.576"/>
                <circle stroke="#000000" stroke-miterlimit="10" cx="426.576" cy="108.305" r="47.034"/>
                <circle stroke="#000000" stroke-miterlimit="10" cx="346.915" cy="255.763" r="43.644"/>
                <circle stroke="#000000" stroke-miterlimit="10" cx="255.39" cy="82.882" r="35.17"/>
                 <text x="0" y="100" textLength="800px" lengthAdjust="spacing" font-family="Vollkorn" font-size="60px" font-weight="700" font-style="italic">da宗熊</text>
            </clipPath>
        </defs>
    </svg>
    <div id="back" class="clip6"></div>
</body>
</html>
```
