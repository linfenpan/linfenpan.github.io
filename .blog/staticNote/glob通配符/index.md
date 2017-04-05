在 node.js 中，我经常用到的一个匹配库，minimatch，其中使用的，就是glob通配符

``` javascript
var minimatch = require("minimatch");
// matchBase：不匹配路径
console.log(minimatch("./aaa/bbb.txt", "*.txt", {matchBase: true});
```

经常在不经意之间，使用了 glob 通配符。
在window搜索中，键入 *.txt，即搜索全部 txt 结尾的文件

常用的匹配符号:

| 符号 | 作用 |
| :------------- |:-------------|
| ? | 仅且匹配1个任意字符 |
| [...] | 匹配方括号里的任意1个字符，如 [a-zBE5-7] |
| [!...] | 匹配不在方括号内的任意1个字符，如 [!a-z] |
| {c1,c2} | 匹配 c1 或  c2，也可以继续添加 |
| * | 代表任意字符，字符串，空串 |

注意: / 是不能通过 * 和 ? 去匹配的。

然，自己无聊，写了一个路径匹配的方法 [某些情况，有BUG，但匹配路径，理论上，是不会出现那个缺陷的] :

``` javascript
"use strict";
// 查询类型
var toString = Object.prototype.toString;
var queryType = function(o){
    return toString.call(o).toLowerCase().split(" ")[1].slice(0, -1);
};
// 缓存
var cache = {};
// 不能囊括所有 特殊 情况
function matcher(str, m, options){
    var reg = matcher.parse(m, options);
    return reg.test(str);
};
// 过滤数组
matcher.filter = function(list, str, options){
    var reg = matcher.parse(str, options);
    return list.filter(function(val){
        return reg.test(val);
    });
};
/**
  * 把字符串，转正则
  * @param str {String | RegExp} 大部分参考 glob 表达式，有小许缺陷
  * @param options {Object} 参数, {matchLast: 仅从最后匹配, matchStart: 仅从开头匹配,与matchLast互斥}
 */
matcher.parse = function(str, options){
    var type = queryType(str), options = options || {matchLast: false, matchStart: false};
    if(type == "regexp"){
        return str;
    }else if(type == "string"){
        if(!cache[str]){
            // 把 "" 转为 glob 表达式
                        // / --> \/
            let reg = str.replace(/\/+|\\+/g, "[\\\\\\/]+")
                        // . --> \\.
                        .replace(/\./g, "\\.")
                        // ? --> .      这里，如果是 [!?xy] 这种形式，会有BUG，不过，路径上，是没有这种数据的吧..
                        .replace(/\?/g, ".")
                        // * --> [^/\\]+, ** --> .+?
                        .replace(/\*+/g, function(s){
                            return s.length == 1 ? "[^\\\\\\\/]+" : ".+?";
                        })
                        // [!..] --> [^..]
                        .replace(/\[!([^\]]+)\]/g, "[^$1]")
                        // {c1,c2} --> (c1|c2)
                        .replace(/\{([^}]+)\}/g, function(str, key){
                            return "("+ key.replace(/,/g, "|") +")";
                        });
            // 保存计算结果
            cache[str] = reg;
        }
        return new RegExp(options.matchLast ? `${cache[str]}$` : options.matchStart ? `^${cache[str]}` : `^${cache[str]}$`);
    }else{
        throw "matcher 第 2 个参数，只能为正则或字符串";
    }
};
module.exports = matcher;
```
