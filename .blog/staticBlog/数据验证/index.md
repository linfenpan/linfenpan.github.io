
最近做后台比较多，路七八糟的数据验证，弄得不厌其烦。SO，弄了个表单验证的玩意出来，达到快速，简介，不烦人的验证。

下面看看，几种方式的数据验证，有什么不同。先有需要验证的数据:

``` html
<form>
	<input type="text" name="name" />
	<input type="text" name="password" />
	<input type="number" name="age" />

	<input type="checkbox" name="sex" value="0" /> 男
	<input type="checkbox" name="sex" value="1" /> 女

	<input type="text" name="address" />
	<input type="text" name="phone" />
	<input type="text" name="qq" />
	<input type="text" name="email" />
	<input type="text" name="homePage" />
</form>
```

咋眼一看，林林统统，需要验证的数据，有9个:

 1. name: 非空，最小3位，最大10位
 2. password: 非空，最小6为，最大20位
 3. age: 非空，整数
 4. sex: 非空
 5. address: 非空，最长50位
 6. phone: 可空，电话号码
 7. qq: 可空
 8. email: 可空，邮箱
 9. homePage: 可空，链接

---

# 传统

拿到这堆数据，那没啥好说的，逐个if/else判断吧:
``` javascript
if( name == "" ){
	return "name不能空";
}else if( name.length < 3){
	return "name不小于3";
}else if( name.length > 10 ){
	return "name不大于10";
}
....
....
每个条件一端判定

```

可以看出，如果再增加一个判定，则需要新的一个if，新一个return。如果只是一两个数据还好，但是，数据一多，简直就无法看下去了。

而且，表单的数据，一般会有新增和修改两部分，而它们的数据验证，往往是大部分一致，少部分不一样。OMG，又得把密密麻麻的判断拷一份，差不多一式两份......

简直就是灭绝人性的灾难啊...........................

---

# 策略模式

因为同一个属性，它的验证是一致的，所以，我们可以弄一份策略配置:

``` javascript
var obj = {
	name: function(val){
		if( val == "" ){
			return "name不能空";
		}else if( val.length < 3){
			return "name不小于3";
		}else if( val.length > 10 ){
			return "name不大于10";
		}
	},
	password: function(val){
		if( val == "" ){
			return "password不能空";
		}else if(val.length < 6){
			return "password不小于6位";
		}else if(val.length > 20){
			return "password不大于20位";
		}
	}
	...
	...
}
```
辛辛苦苦，写好一份配置，然后，验证的时候，只需要提供下需要验证的数据，循环执行，则OK:
``` javascript
function valid(data){
	for(var i in data){
		var item = data[i], fn = obj[i]; // 获取 obj 中配置的策略
		if( fn ){
			// 执行策略中的函数
			var res = fn[item];
			// 如果有返回，就是产生了错误
			if( res ){
				return res;
			}
		}
	}
	// 平安的执行到这里
	return true;
}
```
策略好了，调用的工具方法也好了，剩下就是使用:

``` javascript
var res = valid({
	name: "名字",
	password: "密码...",
	...
	...
});

if( res === true ){
	alert("验证通过");
}else{
	alert("验证错误:" + res);
}

```

做到了一次定义验证方法，重复利用。乍一看，也没啥问题。感觉验证代码，走到了代码界的巅峰，无可挑剔了，有木有？

但再细看，某些地方，还是不尽人意的。如果，现在新增一个字段，博客首页:  blogPage，链接。
很简单的，在 obj 中，新增一个策略，验证链接。

但是，我们之前不是已经有 homePage 策略，也有链接的验证吗？两块不是就重复了吗？
有强迫症的孩子，肯定就已经把 链接 验证代码，抽取成独立函数，供两边调用了。

但随着 有着 公共验证代码 的 接口，越来越多呢？OMG，密密麻麻的公共验证代码，又是一个灾难......

又或者，有一个新的表单，有着不同的数据呢？再定义一个策略对象？


---

# 配置策略

如果我们将策略模式，反其道而行，把验证的代码，变成策略对象，给需验证的数据，配置验证的策略。

代码我懒，就不洗写了:
``` javascript
var obj = {
	notEmpty: function(){...},
	max: function(){...},
	min: function(){...},
	url: function(){...},
	email: function(){...},
	qq: function(){...},
	number: function(){...},
	...
	...
}
```
定义一个验证数据需要的函数的对象，然后，给每个数据，指定要验证的接口:

``` javascript
var checkObj = {
	name: ["notEmpty|不能空", "max|10|最大10", "min|3|最小3"],
	password: ["notEmpty|不能空", "max|20|最大10", "min|6|最小6"],
	...
	...
}
```
使用上，也很简单，从 checkObj 中，找到验证的接口KEY，然后通过 obj[KEY] 找到真正的 验证 函数，进行验证。
至于如何实现，这里就呵呵了......

将一个简单的验证，分为了3层，简直堪比 MVC 啊，有木有啊？
但是，挺欣赏这一种方式的，完全为了那种不能忍受重复代码的强迫症患者，量身订造的，有没有？

---

# PipeValid.js

PipeValid.js，是根据配置策略的模式，编写了一个数据验证的工具库。其中，有这很强大的链式表达式语法，内置了常用的 数字、整数、非空、url、email、最小、最大的验证，支持拓展底层验证接口，或非接口验证。

看两个小例子，感受一下PipeValid的魅力

普通的验证：
``` javascript
var name = "da宗熊";

if( name == ""){
	return "名字不能为空";
}else if(name.length > 20){
	return "名字长度不能超过20";
}else if(name.length < 2){
	return "名字不能小于2位";
}
```

而使用了 PipeValid 后，你只需
``` javascript
var valid = new PipeValid();
valid.check("name")
	 .notEmpty("名字不能为空")
	 .max(20, "名字长度不能超过20")
	 .min(2, "名字不能小于2位");

var res = valid.start({name: "da宗熊"});
if(res.error){
	alert(res.error);
}
```

## 优势

 1. 链式配置

 抛弃反锁的if、else的操作，使用链式定义，验证错误
 ``` javascript
 valid.check("name").max(10, "xx...");
 ```

 2. 复用

 一次定义，重复使用，抛弃重复代码的烦恼
 ``` javascript
 // 多个start，使用相同配置，进行多个验证
 var res1 = valid.start({name: "da宗熊"});
 var res2 = valid.start({name: "da宗熊2"});
 ```

 3. 支持全数据验证

 遇到错误可立刻停止验证并抛出，也可以把所有数据全部验证后，把所有错误一次行抛出
 ``` javascript
 // 验证传入的所有数据
 // 返回错误列表
 var resList = valid.start(true, {name: "da棕熊", age: 20});
 ```


 4. 内置常用验证器

 notEmpty: 非空
 min: 最小值，接受两个参数 valid.min(int, string);
 max: 最大值，接受两个参数 valid.max(int, string);
 url: 链接
 int: 整数
 number: 数字
 email: 邮件


 5. 良好的拓展

 可添加更多的链式验证函数，也可以自定义验证函数

 自定义链式函数：
 ``` javascript
 // 定义新的验证函数
 valid.add("isBear", function(val){
	 return val === "bear";
 });
 // 使用新的链式函数
 valid.check("bear").notEmpty("bear字段不能为空").isBear("bear必须是bear!");

 valid.start({bear:"xx"}); // ⇒ {attr: "bear", error: "bear必须是bear!"}
 ```
 新的isBear链式函数，被只能的添加了一个参数，用于处理错误信息

 自定义验证函数:
  ``` javascript
 valid.check("min").define(function(val){
	 // this 对象，是 {min: 1}
	 return +val >= 3;
 }, "min最小是3");

 valid.start({min: 1}); // ==> {attr: "min", error: "min最小是3"}
 ```

 6.  条件验证

 只有满足某种需求(判断)，才执行的验证
 ``` javascript
 valid.check("url").notEmpty().then().url("输入必须是链接").end();

 valid.start({url: ""}); // ⇒ {attr: null, error: false}
 valid.start({url: "xxyy"}); // ⇒ {attr: "url", error: "输入必须是链接"}
 ```
 使用了then之后，之前添加的函数，则会转化为验证前的条件，而end则是then函数的结束。

 上面第一条语句，语意就变为这样子：
 "如果url的值不为空，则验证它是否链接；为空，则什么都不干。"




# 最后

嗯，总结一下，使用 PipeValid.js，真心非常装逼。感觉整个人的逼格都高了，有木有啊？v 1.1.0 版本，就2.47K啊？

补上链接:
> github: https://github.com/linfenpan/PipeValid
