在 node.js 中，有几个路径，是写工具前，一定需要弄清楚的:

## __dirname

这是使用这个变量时，当前代码运行文件的目录


## __filename === module.filename

这是当前运行文件的完整路径


## process.cwd();

这是非常实用的，是当前 cmd 控制台的完整路径


## node.js的启动文件

``` require.main.filename ```

## node 启动时，附带的参数

``` process.argv ```
