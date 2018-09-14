# 背景
近几月，新项目需要电脑与手机端，均能正常使用的。考虑到 `vue.js`、`reacti.js`、`riot.js` 等，对 IE 均不友好，于是兴起了使用新框架的念头。

百度的 `san.js` 逐步浮现在眼前。

>它体积小巧，兼容性好（IE6），性能卓越，是一个可靠、可依赖的实现响应式用户界面的解决方案。

上述是它自己吹的哈。小巧和兼容，是肯定的，至于性能？MVVM框架的性能，肯定是有损失的。在性能和维护、效率间权衡了一下，还是投身到MVVM的怀抱中。

传送门: [san.js](https://baidu.github.io/san/)


# 优点
`san.js` 有以下几点，是非常吸引人的:

* 兼容性很好，在移动、电脑端均能放心使用
* 体积相对较小
* 有类似冒泡的事件机制，一个`dispatch`方法，让组件耦合更加松散。子组件 `dispatch` 事件，一路冒泡，直至有父级组件，对其进行处理。
* 更加灵活的组件机制，我们甚至可以把动态加载的子组件，挂载到任意组件内。
* 能灵活使用在任何地方，与任意框架配合使用。自带模板编译，不经 `webpack` 编译，也可以进行动态创建组件。
* 有组件反解、服务端渲染等功能呢。
* 模板语法与 `vue.js` 语法类似，很低的学习成本；状态管理有类似 `flux` 的单向流，容易使用。
* 截止本文发布时，已有 `san-store`，`san-router`，`san-update` 等优秀配套框架，而且还在持续更新中

# 缺点
在使用的过程中，也遇到一些问题:

* 取值的表达式，不能支持函数，如 `{{ [1, 2, 3].join('x') }}`，输出将会是 `1,2,3`，其中的 `.join` 被完全忽略了
* 没有全局的混入、拓展等操作，组件间的`继承`比较麻烦


# 使用

## 简单例子
```javascript
var MyApp = san.defineComponent({
    template: '<p>Hello {{name}}!</p>',

    initData: function () {
        return {
            name: 'San'
        };
    }
});


var myApp = new MyApp();
myApp.attach(document.body);
```
可以看到，通常情况使用 San 会经过这么几步：
1. 我们先定义了一个 San 的组件，在定义时指定了组件的 内容模板 与 初始数据 。
2. 初始化组件对象
3. 让组件在相应的地方渲染

用 `ESNext` 编写，则是:
```javascript
class myApp extends san.Component {
  // static 关键字，是必须的，包括后面用到的 computed，filters，components  等字段，建议都用 static 关键字
  static template = `<p>Hello {{name}}!</p>`;

  initData: function () {
        return {
            name: 'San'
        };
    }
}

var myApp = new MyApp();
myApp.attach(document.body);
```

## 计时器例子
```javascript
var MyTimer = san.defineComponent({
  template: `<div>当前索引: {{ index }}</div>`,

  initData: function() {
      return { index: 0 };
  },

  attached: function() {
      var data = this.data;
      // 取值和赋值，必须通过 data.set 和 data.get 操作进行
      // 支持表达式赋值、取值，eg: data.get('list[0].name', 'xxx')
      var index = data.get('index');
      setInterval(function() {
          data.set('index', index++);
      }, 1000);
  }
});

var myTimer = new MyTimer({
  // 覆盖掉 initData 中，设置的默认值
  data: {
      index: 10
  }
});
myTimer.attach(document.body);
```
可以看到，计时器从 `10` 开始，每秒进行递增。

## 过滤器、计算属性等
```javascript
var MyTest = san.defineComponent({
  template: `
    <div>
      姓名: {{ name }}<br/>
      性别: {{ gender | parseSex }}<br/>
      简介: {{ introduce }}
    </div>
  `,

  computed: {
    // 根据 good 的值，计算 introduce 的值
    // 在计算属性内，不允许访问 this.data 外的属性
    introduce: function() {
      var good = this.data.get('good');
      return '你是个' + (good ? '好人' : '坏人');
    }
  },

  filters: {
    // 过滤器的使用与 vue.js 等框架一致
    parseSex: function(val) {
      return val == 1 ? '男' : '女';
    }
  },

  initData: function() {
    return { good: false, name: '', gender: 0 };
  },

  attached: function() {
    var data = this.data;
    setInterval(function() {
      data.set('good', !data.get('good'));
    }, 1000);
  }
});

var myTest = new MyTest({
  data: {
    name: 'san',
    gender: 1
  }
});
myTest.attach(document.body);
```
效果如下:
![jdfw.gif](http://g.fp.ps.netease.com/km/file/5b924e278b742760596ca6bdRoMFgka0)

更多的使用，可查阅官网。下面仅介绍一些 `san.js + webpack` 使用时，与个人做项目时，遇到的一些问题，以及解决方案。


# 遇到的问题

## san-loader (0.0.7版本)
官方仅在偏僻的角落，以及一些例子中，有提及 [san-loader](https://www.npmjs.com/package/san-loader)，它的用法，与 `vue-loader` 的**旧版**形式一致，对此熟悉同事，可掠过此小节。

使用如下:
```javascript
{
    module: {
        loaders: [
            {
                test: /\.san$/,
                loader: 'san-loader'
            }
        ]
    }
}
```

假设有 `index.san` 文件:
```html
<template>
    <div class="index">Hello {{ name }}!</div>
</template>

<script>
export default {
  initData() {
    return { name: 'San' };
  }
};
</script>

<style>
.index { color: red; }
</style>
```

在 `san-loader` 的作用下，`index.san` 会被划分为 `html`，`css`，`js` 三块，并且交由 `webpack` 中，对应的 `loader` 进行编译、打包。

查看了`san-loader` 的源码:
![Popo截图2018810172619.png](http://g.fp.ps.netease.com/km/file/5b6d5a465e602739695c22e5lGXN1z4C)
可得知 `html` 部分交由 `html-loader` 处理；`css` 部分交由`style-loader`处理；`js`部分，交由`babel-loader`处理。

>PS: 如果无法编译出内容或报错，可查看项目，是否已经引用了 html-loader、style-loader 和 babel-loader

如果要覆盖默认的处理，可按以下格式传入参数:
```javascript
{
    module: {
        loaders: [
            {
                test: /\.san$/,
                use: [
                    {
                        loader: 'san-loader',
                        options: {
                            // 改写 loaders 中的值，达到覆盖默认 loader 的效果
                            loaders: {
                                html: [ 'html-loader' ],
                                css: [ 'style-loader' ],
                                js: [ 'babel-loader' ]
                            }
                        } // end options
                    }
                ]
            }
        ]
    }
}
```

细心的同学，可能就注意到，默认的 `html-loader` 带了一个参数 `?minimize=false`。此参数代表了 `san-loader` 编译出来的 `html` 内容，均不会被压缩。在实际应用中，些许不友好。我们可以通过重写 `options.loaders.html` 的值，达到我们压缩 `html` 的目的。

> html-loader: [https://www.npmjs.com/package/html-loader](https://www.npmjs.com/package/html-loader)

## 继承
官方有提及，组件间继承，有两种方式: `san.inherits` 和 `ESNext`。
```javascript
var CompA = san.defineCompoent({ /* 配置 */ });

// san.inherits
function CompB(options) {
   CompA.call(this, options);
}
san.inerits(CompB, CompA);
MyApp.prototype.template = `<div>内容</div>`;
CompB.prototype.initData = function() {
    return {};
};

// ESNext
class CompC extends CompA {
    /* 可缺省
    constructor(options) {
        super(options);
    }
    */

    static template = `<div>内容</div>`;

    initData() {
        return {};
    }
}
```

二者对比，推荐使用 `ESNext` 的继承方式。

> 官方原话:  由于 ESNext 没有能够编写 prototype 属性的语法，所以 San 对组件定义时的属性支持 static property，通过 ESNext 的 extends 继承时，template / filters / components 属性请使用 static property 的方式定义。

继承一切都好好的，问题就处在了 `static` 属性上。假如 `CompA` 现在如下:
```javascript
class CompA extends san.Component {
    static components = {
        'navbar': Navbar,  // 假设 Navbar 组件，已经存在
    };

    // ....
}
```

当 `CompB` 继承 `CompA` 时，`san.herits` 代码如下:
![Popo截图2018810181539.png](http://g.fp.ps.netease.com/km/file/5b6d65dc7f9d2a39e2670afaZIrT9XpL)
`static` 的属性，被完美忽略了。于是 `CompB` 并没有引入到组件 `Navbar`。

而 `CompC` 继承 `CompA` 时，`babel` 的继承代码:
![Popo截图2018810181746.png](http://g.fp.ps.netease.com/km/file/5b6d66576f04940d6059f610R5zCv2oX)
[抽自 babel-runtime/helpers/inherits.js]
可见倒数第二行，`subClass.__proto__ = superClass`，意图继承  `superClass` 的静态属性，可惜的是 `__proto__` 属性，在当前的 `IE` 下，全军覆没。[做手机端的同学，木有这个烦恼]

被迫无奈，如果要继承 `static` 属性，须自己编写继承代码，这是之前写好的代码，可做参考:
```javascript
'use strict';
import { extend, merge, deepCloneArray } from './extend';
import { typeOf } from './typeof';

/**
 * 类间，静态属性继承
 * es6 的继承，是不会继承 static 属性的，这里修正一下
 *
 * @param {Function} subClass 子类函数
 * @param {Function} superClass 父类函数
 */
export function inheritStatic(subClass, superClass) {
  // 合并 static 的属性，如 superClass.template
  Object.keys(superClass).forEach(key => {
    const subValue = subClass[key];
    const superValue = superClass[key];
    const subType = typeOf(subValue);
    const superType = typeOf(superValue);

    if (subType == superType && subType == 'object') {
      subClass[key] = merge({}, superValue, subValue);
    } else if (subValue == null) {
      switch (superType) {
        case 'object':
          subClass[key] = extend(true, superValue);
          break;
        case 'array':
          subClass[key] = deepCloneArray(superValue);
          break;
        default:
          subClass[key] = superValue;
      }
    }
  });
}
```

在`CompC`继承`CompA`后，只需调用 `inheritStatic(CompC, CompA)`，即可继承 `CompA` 中的静态属性及方法，并且对静态属性的 `object` 对象，进行了简单的合并操作。


## san-store
[san-store地址](https://github.com/baidu/san-store)：https://github.com/baidu/san-store
截止本文发布前，`san-store` 与 `san` 配合时，仅建议使用单个 `san-store`对象，看下面官方的例子:

```javascript
// 引入的 store 对象，实际是全局声明的
// 所以，后面的所有 store.addAction，实际上，均是捆绑在一个全局对象下
import {store, connect} from 'san-store';
import {builder} from 'san-update';


store.addAction('changeUserName', function (name) {
    return builder().set('user.name', name);
});


let UserNameEditor = san.defineComponent({
    submit() {
        store.dispatch('changeUserName', this.data.get('name'));
    }
});
connect.san({
    name: 'user.name'
})(UserNameEditor);
```
如果是单页面应用，或者单实例，问题不大。如果需要多个 `store` 实例，可通过 `new Store()` 声明新的 `Store` 对象。然后通过组件继承、或者 `$owner` 传递的形式，把父级的 `store` 对象，分发给子组件。

下面，是本人写的一个抽象工具类:
```javascript
// abstract.js 所有组件，均继承此类

/**
* 获取父组件的 $store 值
*/
function getStore(context) {
    if (context) {
      if (context.$store) {
        return context.$store;
      }
      let owner = context.owner;
      while (owner) {
        if (owner.$store) {
          return owner.$store;
        }
        owner = owner.owner;
      }
    }
    return null;
}

export default class Abstract extends san.Component {
    constructor(options, store) {
        super();

        if (store) {
          // 最顶层组件，传入一个新的 new Store 对象，保存到 this.$store 中
          this.$store = store;
        } else {
          // 子组件找不到 $store 属性，就指向父组件的 $store 对象
          this.$store = getStore(this);
        }
    }
}
```

## san-store/connect
在 `san-store` 的 `src/connect/createConnector`中，有这么一段脚本:
![xxx.png](http://g.fp.ps.netease.com/km/file/5b925010143cfa44fc75ca8bURGFjGTB)

如果该组件，已经通过 `connect.san` 绑定过 `san-store` 了，将不会重复去初始化 该组件的 `actions`，本意是很好的。
但是如果我们子组件是继承父组件而来的，而父组件使用过了 `connect.san`，那么子组件的 `connect.san` 的绑定，将会失效。

为解决此问题，我们可以把子组件的`prototype`中的`actions`值，置为`null`，然后再调用 `connect.san`，即可解决


# 总结

因为体积小，又可实时编译，在做一些小组件、移动端活动的时候，还是非常便捷的，不用考虑兼容 和 体积问题，省下很多功夫。
