## 关于 userData behavior
参考资料: [资料1](http://www.cnblogs.com/dwfbenben/archive/2012/03/15/2398741.html), [资料2](http://www.cnblogs.com/chyong168/archive/2012/04/24/2467503.html)

**浏览器支持:** IE5.0 或 以上
**基本语法**:

```
XML：<Prefix: CustomTag id=sID style=”behavior:url(‘#default#userData’)” />

HTML：<ELEMENT style=”behavior:url(‘#default#userData’)” id=sID>

Script：
object.style.behavior = "url('#default#userData')"
或
object.addBehavior('#default#userData')
```

**属性：**

expires —— 设置或者获取 userData behavior 保存数据的失效日期。XMLDocument —— 获取 XML 的引用。

**方法：**

getAttribute() —— 获取指定的属性值。
load(object) —— 从 userData 存储区载入存储的对象数据。
removeAttribute() —— 移除对象的指定属性。
save(object) —— 将对象数据存储到一个 userData 存储区。
setAttribute() —— 设置指定的属性值。

**备注**

1、从安全方面考虑，一个 userData 存储区只能用于同一目录和对同一协议进行存储。

2、如果使用 userData behavior 不正确可能会对你的应用造成危害，userData 存储区中的数据没有加密因而不安全的。
任何可以访问 UserData 保存磁盘的应用都可以访问该数据，所以，推荐不要保存敏感的数据，比如信用卡号

3、userData behavior 会跨 session 存储信息到存储区，这提供了动态的数据结构和比 cookie（一般 4KB） 更大的容量。

4、如果设置 userData behavior 到 html、head、title 或者 style 对象上，当 save 和 load 方法被调用时会出错。如果必须设置到 style 中，可以设置内联或者文档头，例如：
```
<style>
 .storeuserData {behavior:url(#default#userData);}
</style>
```

5、对于 userData behavior 来说 ID 是可选的，但是如果有，则会改善执行性能。

6、userData 可以将数据以 XML 格式保存在客户端计算机上，一般保存在 C（WIN 系统盘）:\Documents and Settings\XXX\UserData\ 文件夹下。

7、userData 数据一直存在，除非人为删除或者用脚本设置该数据的失效日期（expires）。


## 封装插件

核心代码如下:
``` javascript
// 将 name 设置为 localStorage，则可以在ie6、7下，使用 localStorage 了
// storageName，需要载入存储区的数据的名称
// days，数据保存的天数
(function(name, storageName, days){
  if (window[name]) {
    return;
  }

  var input = document.createElement('input');
  input.type = 'hidden';
  input.style.display = 'none';
  input.addBehavior ("#default#userData");

  // 设置数据过期日期
  var expires = new Date();
  expires.setDate(expires.getDate() + days);
  input.expires = expires.toUTCString();

  (document.body || document.getElementsByTagName('body')[0]).appendChild(input);

  window[name] = {
    setItem: function(key, val) {
      input.load(storageName);
      input.setAttribute(key, val);
      input.save(storageName);
    },
    getItem: function(key) {
      input.load(storageName);
      return input.getAttribute(key);
    },
    remove: function(key) {
      input.load(storageName);
      input.removeAttribute(key);
      input.save(storageName);
    }
  };

})('localStorage1', 'testStorage', 100);


/*== 测试 ==*/
var storage = window.localStorage1;
storage.setItem('xxxx', '123'); // 注释掉这行，刷新页面试试
alert(storage.getItem('xxxx'));

// storage.remove('xxxx');
// alert(storage.getItem('xxxx'));
```
