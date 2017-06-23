# 文件后缀名
sass 有两种文件后缀名字，一种后缀名为 sass，不使用大括号和分号；另一种，就是 scss 文件，这种格式的文件，和我们平时编写 css 文件格式差不多。
我们尽量使用 .scss 的后缀，笔描 .sass 的过于严格，造成报错

```scss
// .sass 语法
body
  background: #eee
  font-size: 12px
p
  background: #0982c1

// .scss 语法
body {
  background: #eee
  font-size: 12px
}
p {
  background: #0982c1
}
```
