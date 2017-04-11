## Chrome And Firefox

针对功能强大的浏览器，可以通过 script 标签的 ```onload``` 和 ```onerror``` 来获得脚本的状态。

```html
<script src="./jquery.js" onload="alert('success')" onerror="alert('failure')"></script>
```

如果针对单一脚本，或者动态添加的脚本，这个方式，确实不错。
但是，如果我们站点，有数十个，甚至更多的脚本呢？逐个添加，效率并不高。

对此，我们可以使用 ```html.addEventListener('error')```，进行整体监控

```html
<script>
  // 代码须在 script 加载前运行
  var target = document.documentElement;
  if (target.addEventListener) {
    target.addEventListener('load', function(e) {
      if (e.target.tagName.toLowerCase() === 'script') {
        console.log(e.target.src, 'script load success');
      }
    }, true);
    target.addEventListener('error', function(e) {
      if (e.target.tagName.toLowerCase() === 'script') {
        console.log(e.target.src, 'script load failure');
      }
    }, true);
  }
</script>
```

上述方法，在 IE9&+ 的 ie 浏览器，都能运行得很溜哦~

------------------------------

## IE7~IE8

针对此顽强的份子，真的没啥好的办法。
首先，IE7~IE8不支持事件捕获，SO，上面的 ```addEventListener('error')``` 的方式，不适用。
也不要考虑 ```attachEvent()``` 支持捕获啦，并不现实。

对于他们俩，唯一的方法，就是 ```onreadystatechange```

```html
<script>
  function statechange(node) {
    if (/loaded|complete/.test(node.readyState)) {
      if (node.readyState == 'complete') {
        return alert('success');
      }

      var firstState = node.readyState;
      // hack: 如果脚本通过动态的方式加载，访问 'children' 属性，会把 loaded 状态，变更为 'complete'[如果加载成功] 或者 'loading'[如果加载失败]
      node.children;
      // 错误检测
      if (firstState == 'loaded' && node.readyState == 'loading') {
        return alert('error');
      }
    } // end if
  }

  var node = document.createElement('script');
  node.src = './jquery.x.js';
  node.type = 'text/javascript';
  node.onreadystatechange = function() {
    statechange(node);
  };
</script>
```

如果我们企图，通过给 script标签 添加 onreadystatechange 方法，来达到效果，那估计要失望了:

```html
<script>
  function statechange(node) {
    // 无论脚本加载是否成功，都会进入 success
  }
</script>
<script src="jquery.x.js" onreadystatechange="statechange(this)"></script>
```

------------------------------

## 最笨的方法

最笨，但兼容所有浏览器的方法，肯定就是给脚本添加 "约定的全局变量"。
如:

```javascript
// index.js
window.FILE_NAMES.push('/index.js');
```

我们只需要在 domready 之后，判断是否存在该文件的名字，即可知道脚本是否加载完成了。
好囧.......
