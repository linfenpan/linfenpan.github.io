## node.js多任务

在 ```package.json``` 中，配置了 ```scripts``` 属性，我们就可以通过 ```npm run xxx``` 来快捷运行相关的命令。
如:

```json
{
  ...
  "scripts": {
    "test": "node test.js",
    "open": "node open.js test"
  }
  ...
}
```

如果想同时运行多条命令，只需通过 "&&" 符号，分割多条命令即可。
如:

```javascript
  npm run test && npm run open
```

设置，在 ```npm run xxx``` 后，可以添加额外的参数，如:

```javascript
  npm run open http://www.baidu.com/
```
在程序中，通过 ```process.argv``` 可获取参数列表，```process.argv[2]``` 对应上面的链接


## 多监听进程

而因为项目中，使用到 fis3 和 webpack，如果两者同时配置了 ```-w``` 参数，运行在首位的就会阻塞掉运行在后面的。
So Terrible.

解决方案也很简单，让两者运行在独立的两个子进程即可，我们可以使用 [```concurrently```](http://npm.taobao.org/package/concurrently) 工具包，帮助我们快速解决问题:
例如:

```text
  concurrently -k \"webpack --progress --hide-modules -w\" \"fis3 release -d ../dest -w\"
```

使用 -k 参数，代表某个现成挂掉的话，也把另一个现成也停止掉。
缺点很明显，因为两者运行在独立的进城中，所以没有严格的执行顺序

Notice， 如果我们都不使用 -w 命令，可以用更简洁的方式代替，而且还能保证执行的数序:
```text
  webpack --progress --hide-modules && fis3 release -d ../dest
```


## 关于环境配置

我们常会配置 ``` NODE_ENV=production ``` 在任务之前，用于区分当前是哪个环境，如:

```text
   NODE_ENV=production webpack --progress
```

但是在linux系统下，可能会识别不到 NODE_ENV，所以命令报错。
这时候，我们需要 [```cross-env```](http://npm.taobao.org/package/cross-env) 工具包，可以助我们快速解决问题，如:

```text
   cross-env NODE_ENV=production webpack --progress
```

程序中，通过:
```javascript
  process.env.NODE_ENV === 'production'; // true!
```
