# 简要说明

测试项目: [projectjs](https://github.com/linfenpan/projectjs)

模块加载管理脚本，主要有两个功能函数，分别是require和define。通过require，进行模块加载；通过define，进行模块的定义。

本文主要分析模块加载脚本中，资源加载及文件寻址部分。


-----------

# 代码分析

在具体编码之前，了解各个环节的实现，是很有必要的。

## 文件寻址

如我们现在，在页面[ http://test.bear.com/demo/index.html ]下，进行编码:

``` html
<script>
	require("./js/data.js", function(data){
		console.log(data);
	});
</script>
```

我们如何确定 "./js/data.js" 到底指向的，是哪个脚本呢？
这里，我们可能理所当然的认为，该路径，指向的，是: http://test.bear.com/demo/js/data.js

我们姑且当是吧。那如果我们的脚本路径是 "../js/data.js" 的时候呢？
OMG~，我们是时候，得弄一个解析器，帮我们寻找最正确的路径了。

参考了 node.js 的 path 方法库，也模仿编写了一个path对象:

``` javascript
// 路径解析
var path = {};
// 路径格式化
path.normal = function(p){
    // 把 ./a/./b//c/d/../e/ ==> ./a//b//c/d/../e/
    p = p.replace(/\/\.\//g, "\/\/");

    // 把 ./a//b/c/d/../e/ ==> ./a/b/c/d/../e/
    p = p.replace(/([^:])\/{2,}/g, "$1\/");

    // 把 ./a/b/c/d/../e/ ==> ./a/b/c/e/
    p = p.replace(/[^/]+\/\.\.\/([^/]*)/g, "$1");

    return p;
};

// 是否绝对路径, ftp:// 或 http:// ，不过 // 这种不知道算不算呢?
path.isAbsolute = function(p){
    return /:\/\//.test(p);
};

// 路径合并
path.join = function(){
    var p = [].join.call(arguments, "\/");
    return this.normal(p);
};

// 目录，http://www.100bt.com 这样的，会有BUG，不过，不理了
// 因为 location.href 是肯定会附带最后的 / 的
path.dir = function(p){
    return p.replace(/(.*\/).*$/, "$1");
};

// 后缀名
path.ext = function(p){
    return p.replace(/.*\.(.*)$/, "$1");
};
```

通过 path 对象的 join 和 dir 等方法，很容易，就得到了想要的路径，如:

``` javascript
var dir = path.dir(location.href); // ⇒ http://test.bear.com/demo/
var src = path.join(dir, "../js/data.js"); // ⇒ http://test.bear.com/js/data.js
```


## 脚本加载

路径拿到了，就得加载相关的资源，其中，模块加载器，很大一部分资源，就是脚本。

根据路径，加载脚本:

``` javascript
var head = document.head || document.getElementsByTagName("head")[0];
function loadScript(src, callback){
    var script = document.createElement("script");
    script.async = true;

    // 支持 onload
    if("onload" in script){
        script.onload = onload;
        script.onerror = function(){
            console.log("加载失败:" + src);
            onload(true);
        }
    }else{
        script.onreadystatechange = function(){
            if(/loaded|complete/.test(script.readyState)){
                onload();
            }
        }
    };

    script.src = src;
    head.appendChild(script);

    function onload(error){
        script.onload = script.onerror = script.onreadystatechange = null;
        head.removeChild(script);
        script = null;

        callback(error, src);
    };

};
```

通过 loadScript 方法，加载对应的脚本:
``` javascript
loadScript("http://test.bear.com/js/data.js", function(success){
	if(success){
		// 加载成功
	}
});
```


## 关于define

如果data.js 内容如下:

``` javascript
define(function(require, exports, module){
	exports.author = "da宗熊";
});
```

我们通过 loadScript 加载 data.js 之后，浏览器就会运行 data.js 中的内容，其中的 define 大致如下编写:

``` javascript
var loadedMap = {}; // 加载完成 map 对象
window.define = function(fn){
	// 获取当前加载完成的脚本链接 【此方法，请自己实现】
	// IE6-9中，脚本加载完成后，并不会立刻执行
	//   相关的script节点，会进入 interactive 状态
	//   查询所有script节点，找到readyState为interactive状态的节点，就是当前运行中的
	// 其余浏览器
	//   只要加载完成，就会立刻执行，所以，可以很简单的判定
	var url = getCurrentLoadedScript();

	// 加载结果，遵循 cmd 规范
	var module = {exports: {}};
	var require = function(){
		// fn 中的内容分析，并且加载需要的模块
	};
	// fn.toString() 可以获取到 fn 定义的字符串
	// 通过分析字符串，可以找到所有需要 require 加载的模块，进行加载
	fn(require, module.exports, module);
	loadedMap[url] = module.exports;
};
```

-----------

# 结束

到此未知，所有难点的代码，都编写完毕了。至此，组合一下，就能得到一个简单的模块加载脚本。

如果要扩展成类似 sea.js、require.js 之类的，可能就要花费相当大的功夫了。

列举一下组装成工具库时，遇到的一下问题:

一、define时，分析模块中所有依赖板块

``` javascript
// 把定义函数，转为字符
var str = fn.toString();
// 删除所有注释
str = str.replace(/\/\*(.|\n|\s)*?\*\/|\/\/[^\n\r]*/g, "");

// 寻找所有 require("xx.js"); 的正则
//  当心 require("xxx.js", function(){});
var reg = /\brequire\s*\(([^)]*)\)/g;
```

二、根据脚本节点，获取脚本的绝对路径

如有节点:
``` html
<script src="./js/data.js"></script>
```
那它的绝对路径，可这样获取:

``` javascript
var abs = node.hasAttribute ? node.src : node.getAttribute("src", 4);
// ⇒ http://test.bear.com/js/data.js
// 参考: http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
```
