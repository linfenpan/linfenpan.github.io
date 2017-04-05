正则表达式，又称正规表示法。它使用单个字符串来描述、匹配一系列符合某个规律的字符串。
在很多文本编辑器中，正则表达式用于检索、替换某些符合某种规则的文本。

----------

## 声明正则

在 js 中，声明正则，有两种方式:

 1. new 方式
``` javascript
var reg = new RegExp("\\d", "g");   // ===> /\d/g
```

2. 字面量定义
``` javascript
var reg = /\d/g;
```

----------

## 正则 at 字符串

在 js 中，字符串有两个与正则相关的方法，分别是 replace 和 match

1、replace

用于替换字符串的特定字符，经常用法有:
``` javascript
var str = "我是:name";
str.replace("name", "da宗熊"); // ⇒ 我是:da宗熊
```
然而，replace的第1个参数，是可以为正则表达式的，同样的替换，可以写为:
``` javascript
str.replace(/name/, "da宗熊"); // ⇒ 我是:da宗熊
```
乍一看，好像没啥区别，但是如果遇上这种替换，有怎办呢?
``` javascript
var str = "name喜欢吃雪糕，name也很喜欢看漫画";
```
需要把 name 替换为 "da宗熊"，那不实用正则，我们需要这样写:
``` javascript
str.replace("name", "da宗熊").replace("name", "da宗熊"); // ⇒ 需要执行两次 replace 才能得到结果
```
而使用正则，之后:
``` javascript
str.replace(/name/g, "da宗熊"); // ⇒ 只需执行1次，就能把两个 name 替换掉
```

PS: 关于replace的更高级用法，后面会继续讲到

----------

2、match

这个函数，只接受1个正则作为参数:
``` javascript
var str = "123 abc 456 你好";
str.match(/\d+/);  // ⇒ ["123"]
str.match(/\d+/g); // ⇒ ["123", "456"]
str.match(/x+/); // ⇒ null
```
match能在字符串中，找出所有符合正则描述的匹配字符串数组，如果找不到匹配的，则返回 null。

PS：这个方法，用不到正则的捕获组

---------

## 字符串 at 正则

正则中，跟字符串打交道的，有两个方法，分别是 test 和 exec

1、test

只有 1 个作用，检测字符串，是否符合正则所描述的规则
``` javascript
var reg = /\d/;
reg.test("123");  // ⇒ true
reg.test("abc123def"); // ⇒ true
reg.test("abc"); // ⇒ false
```
PS：捕获组对于此方法，也是无用

----------

2、exec

该方法每次执行，都返回当前正则匹配到的子字符串，直到返回 null，则匹配完成，再也找不到下一个满足该正则的 子字符串。
``` javacript
var reg = /\d+/g;    // 如果不带上 g[全局标志]，则每次执行，都会重头开始匹配
var str = "123 456 789";
reg.exec(str);  // ⇒ ["123"]
reg.exec(str);  // ⇒ ["456"]
reg.exec(str);  // ⇒ ["789"]
reg.exec(str);  // ⇒ null
```
在这里，捕获组，会跟随每次exec返回:
``` javascript
var str = "123 456 789";
var reg = /(\d+)\s+(\d+)/g;
reg.exec(str);  // ⇒ ["123 456", "123", "456"]
reg.exec(str);  // ⇒ null
```

---------

## 正则入门

介绍几个常用术语及相关的使用

1、元字符
用于构建正则表达式的符号，常用的有:
| 元字符 | &nbsp; |
| :---: |:------|
| . | 匹配任何字符，换行除外 |
| \d | 0-9任何数字 |
| \w | [0-9A-Za-z_] |
| \s | 匹配空格、制表符、换页符等，[\f\n\r\t\v] |
| \b | 匹配单词的边界，边界=空格、换行、开始、结束位置 |
| ^ | 字符串的开头 |
| $ | 字符串的结尾 |
| \| | 提供可选择的子匹配模式 |


----------

2、限定符
限制子模式出现在正则表但是的次数。
| 限定符 | &nbsp; |
| :---: | :--- |
| * | 0次或多次,e.g.  /\d*/ |
| + | 1次或多次,e.g.  /\d+/|
| ? | 1次或0次,e.g.   /\d?/ |
| {n} | 出现n次 |
| {,n} | 最多出现n次 |
| {n,} | 最少出现n次 |
| {n,m} | 至少出现n次，最多出现m次 |


----------

3、字符类
以方括号括在一起的表达式:
``` javascript
/[0-9]/ 匹配 0 到 9 间的字符
/[a-zA-Z]/ 匹配任意字母
/[^0-9]/ 不等于0到9的其它字符
```

----------

4、修饰符
修饰符，用于表示正则该如何去匹配
| 修饰符 | &nbsp; |
| :---: | :--- |
| g | e.g. /\d+/g，全局匹配，此正则从整个字符串中寻找 |
| i | 忽略字母大小写 |
| m | 多行匹配 |


----------

5、捕获组
在正则中，一般情况下，每出现一对括号，就是一对捕获组。如:
``` javascript
var str = "abc 123 hij";
var reg = /\s(\d+)\s/;
```
其中，reg中，有1个捕获组，在javascript中，可通过 RegExp.\$1，RegExp.\$2 .... RegExp.\$9，最多可捕获9个组。

如:
``` javascript
reg.exec(str);
// 或 reg.test(str);
// 得到的结果，都为
RegExp.$1 === '123'
```
其中，捕获数组，也可以用在 string.replace 上。
``` javascript
str.replace(/(\s)(\d+)(\s)/, "-$2-"); // ⇒ abc-123-hij

// 或者
// 有多少个匹配组，后面就有多少个参数
str.replace(/(\s)(\d+)(\s)/, function(str, s1, num, s2){
    // str 是这次匹配的字符串 ⇒ " 123 "
	return "-" + num + "-";
}); // ⇒ abc-123-hij
```
如果只想做匹配，不想捕获，可以这样定义模式:
``` javascript
var reg = /(?:\s)(\d+)(\s)/;
reg.test(str);
// ⇒ RegExp.$1 === "123"
```
(?:某种模式定义)，代表着非捕获组，上面正则中，第1个捕获到的 \s，不放入捕获组中。


----------

6、[非]贪婪模式

正则表达式，默认是贪婪模式进行匹配。何为贪婪模式？其实，就是每个模式，尽量多的去匹配字符。

如:
``` javascript
var str = "aabaabaab";
/\w*b/.exec(str); // 匹配的是 ⇒ ["aabaabaab"]
```
其中，\w\* 尽量去匹配更多的字符，但是如果我们想遇到第1个b的时候，就匹配成功呢？这时候，就需要使用正则的非贪婪模式:
``` javascript
/\w*?b/.exec(str); // 匹配的是 ⇒ ["aab"]
```
非贪婪模式，就是在相应的限定符后，添加 “?” 号，告诉正则，尽可能的少匹配。

----------

7、正向肯定[否定]预查

在javascript中，声明反向肯定[否定]预查，是会报错的，不知道是不是我玩弄的方式不正确。

| &nbsp; | 模式 |
| :---: | :--- |
| 正向肯定预查 | (?=pattern) |
| 正向否定查询 | (?!pattern) |


举个例子:
``` javascript
// 代表 abc 后，有 d|e|f 的
/abc(?=d|e|f)/.test("abcd"); // true
/abc(?=d|e|f)/.test("abck"); // false

// 代表 abc 后，不能有 d|e|f 的
/abc(?!d|e|f)/.test("abcd"); // false
/abc(?!d|e|f)/.test("abck"); // true
```

----------

END
