## fs.watch 方式

不引入额外类库下，可使用 fs 的 watch 【单个文件，可使用watchFile】 方法，进行监听

``` javascript
var fs = require("fs"), path = require("path");
fs.watch(path.join(__dirname, "./test"), function(event, filePath){
    console.log(event, filePath);
});
```

不过缺点非常明显:

 1. 相应的速度，完全是看心情的样子❤
 2. change和rename事件触发最多次，难以却分其他事件
 3. 通常同个事件，触发两次

-----------

## watch 库

引入外部库watch，效果比fs.watch，强很多。虽然速度还是不快，但是，能却分开各种事件了:

``` javascript
var watch = require('watch');
// 这种监听方式不完美，修改也是会执行多次的
watch.watchTree(path.join(__dirname, "./test"), function(f, cur, prev){
    if(typeof f == "object" && prev == null && cur == null){
        console.log("完成遍历文件夹", f)
    }else if(prev == null){
        // f 是新建文件
        console.log("新建", f);
    }else if(cur.nlink === 0){
        // f 被移除
        console.log("移除", f);
    }else{
        // f 被修改
        console.log("修改", f);
    }
});

// 下面的方法，就好很多，仅且执行1次
watch.createMonitor(path.join(__dirname, "./test"), function(mm){
    // mm.files["文件地址"]，所有文件都在 mm.files 里
    // mm.stop(); // 停止监听
    mm.on("created", function(f, stat){
        console.log("创建", f, stat);
    });
    mm.on("changed", function(f, stat){
        console.log("更变", f, stat);
    });
    mm.on("removed", function(f, stat){
        console.log("移除", f, stat);
    });
});
```

非常便捷的调用，但是缺点就是如同fs.watch一样的速度。

-----------

## chokidar库

这个外部库，是暂时看到最不错的，速度快，可在轮询和fs.watch之间切换，参数也很齐全

``` javascript
var chokidar = require("chokidar");
// 速度非常快
// 文件和目录是区分开的
// add 和 addDir, unlink 和 unlinkDir
var watcher = chokidar.watch("./test", {ignored: /[\/\\]\./}).on("all", function(event, path){
    // 命令一执行，就会调用1次add咧
   console.log(event, path);
});
var log = console.log.bind(console);
// 同时，也可以分开 1 个个事件进行监听
watcher
    .on("add", function(path){log("添加文件:" + path)})
    .on("change", function(path){log("文件更变:" + path)})
    .on("unlink", function(path){log("删除文件:" + path)})
    // 更多事件
    .on("addDir", function(path){log("添加目录:" + path)})
    .on("unlinkDir", function(path){log("删除目录:" + path)})
    .on("error", function(path){log("发生错误:" + path)})
    .on("ready", function(){log("准备完成")})
    // 非常深层次的更变，把父级别的变化，都放倒这里来，平时不推荐使用
    // .on("raw", function(event, path, details){log("raw", event, path, details)})

// 参数
var watcher2 = chokidar.watch("./test", {
    persistent: true,   // 监听是否持续可用，设置为false，其它fsevent如果开启，则会停止监听
    ignored: '*.txt',   // 需要忽略监听的内容，可正则，可glob表达式，可函数[会调用两次]
    ignoreInitial: true, // 忽略初始化带来的事件
    followSymlinks: true, // 如果是 false，则快捷方式之类的更变，不会去追踪
    cwd: ".",           // 监听路径的基础路径
    usePolling: true,  // 是否使用轮询，false 则使用 fs.watch 或 fs.watchFile，默认 false
    // 如果 usePolling == true，下面两个参数生效
    interval: 100,      // 100 ms 轮询1次
    binaryInterval: 300, // 二进制文件，300ms 轮询1次
    useFsEvent: true, // 是否使用 fs.watch 和 fs.watchFile
    alwaysStat: true, // 是否总返回 fs.Stats对象，默认只有 add, addDir, change 会返回
    depth: 20,          // 最深的寻址数，一般不设置
    // 是否等待写入完成，才发布对应事件
    awaitWriteFinish: {
        stabilityThreshold: 2000,   // 多少毫秒内，文件大小不变，则发布事件
        pollInterval: 100           // 文件大小的轮询时间
    },
    ignorePermissionErrors: false, // 忽略权限引起的错误
    atomic: true                    // 莫名的参数，反正，默认为 true，关于某些编辑器的，不理就OK
});

// 方法，添加新的监听目录
watcher2.add("./test2");
watcher2.add(["**/other", "./new3"]);

// 移除监听
watcher2.unwatch("./test2");
// 关闭监听
watcher2.close();
```

参数、方法齐全，而且监听的速度也不错。
