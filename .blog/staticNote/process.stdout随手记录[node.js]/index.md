
process.stdout 有几个常用的方法:

``` javascript
var out = process.stdout;
```

1、write
在控制台中，输出内容
``` javascript
out.write("123");
```

2、length
当前输出流的长度
``` javascript
out.length;
```

3、cursorTo
移动到当前流的哪个位置
``` javascript
out.cursorTo(0);// 移动到开头
```

4、clearLine
清空当前行
``` javascript
out.clearLine();
```

用这方法来制作 控制窗口 的进度条，应该是不错的选择。
