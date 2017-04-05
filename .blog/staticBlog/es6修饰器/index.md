## 初识

修饰器对类的行为的改变，是代码编译时发生的，而不是在运行时。
这意味着，修饰器能在编译阶段运行代码。

``` javascript
function testable(target){
  target.isTestable = true;
}

@testable
class Test {

}
console.log(Test.isTestable); // true
```

上述代码，等同于:

``` javascript
Test = testable(Test);
```



--------------------------------

## 参数

修饰器的第1个参数，指向被修饰的类。
如果觉得1个参数不够用，可以在修饰器外面再封装一层函数:

``` javascript
function testable(isTestable) {
  return function(target) {
    target.isTestable = isTestable;
  };
}

@testable(true)
class Test2 {}
console.log(Test2.isTestable); // true
```

例子中，是添加了一个静态属性，如果想给类的实例添加属性，则可通过目标类的 ``` prototype ``` 属性:

``` javascript
function testable(isTestable) {
  return function(target) {
    target.prototype.isTestable = isTestable;
  }
}
```

看下面另一个例子。
``` javascript
function mixins(...list) {
  return function(target) {
    Object.assign(target.prototype, ...list);
  };
}

const Foo = {
  say() {
    console.log('hello');
  }
};

@mixins(Foo)
class MyClass {}

const myClass = new MyClass();
myClass.say(); // 'hello'
```

通过 mixins 修饰符，把Foo的属性，添加到了 MyClass 的实例。


-------------------

## 方法的修饰

修饰符不仅可以修饰类，同时也可以修饰类的方法

``` javascript
function readonly(target, attrName, descriptor) {
  // 让当前属性 or 方法，不可被重写
  descriptor.writable = false;
}

class Test {
  @readonly
  name() {
    console.log('big bear');
  }
};

const test = new Test();
test.name = 'small bear'; // throw error
```

上述代码，将属性 name 设置为只读。
``` readyonly ``` 修饰器，有3个参数，target 是修饰的类，attrName 是修饰的方法名，descriptor 是属性的描述对象。

descriptor 包含的值如下:
``` javascript
  descriptor = {
    value: '该属性对应的函数',
    enumerable: 是否可枚举，就是for/in时，出现否，默认false
    configurable: 是否可以继续配置，是否可删除，默认 true，如果是 false，则属性不能再被配置和删除了
    writable: 是否可写入，默认 true
  };
```

看下面复杂的例子:

``` javascript
function send(url) {
  return function(target, attr, descriptor) {
    const fn = descriptor.value;
    // 重新定义当前的函数
    descriptor.value = function(...args) {
      const params = fn.call(this, ...args);
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve({url, params}), 1000);
      });
    };
  };
}

class MyClass {
  @send('/post')
  submit() {
    return {
      author: '宗熊',
      content: '内容',
    };
  }
}

const myClass = new MyClass();
myClass.submit().then(data => console.log(data)); // 1 秒后，输出: {"url":"/post","params":{"author":"宗熊","content":"内容"}}
```


------------------------

## 注意

1、因为函数的定义，存在提升，所以 decorator 不能用在函数上
``` javascript
function testable(target) {
  target.isTestable = true;
}

@testable
function A() {}
console.log(A.isTestable);  // undfined or throw error
```

2、也不要用于非类的地方
3、[在线测试](http://babeljs.cn/repl/)
