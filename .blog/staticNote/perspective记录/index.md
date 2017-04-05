css3 3d 效果需要注意的，主要有4个新属性:
``` text
a) perspective	观察点的位置
b) perspective-origin	观察的中心点
c) transform-style: preserve-3d;  	以3d效果，执行transform
d) backface-visibility: hidden;		是否可以看到元素背面？
```

其中，perspective 和 perspective-origin 不建议设置在将要执行动画的元素中。
因为执行动画的元素，它的观察点和观察中心，可能会随着元素变化而变化。
所以，一般设置在执行动画的元素的父亲元素上面。

而transform-style: perserve-3d; 和 backface-visibility:hidden; 则是设置在需要执行动画的元素上面的。

受到perserve-3d影响的属性，有所有transform属性，不过也正常，transform-style嘛~。
