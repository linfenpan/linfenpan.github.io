纯编译: `node blog.js -p`

编译 + 拷贝静态资源: `node blog.js -p -c`

新建文章: `node blog.js new <文章的名字> --type=<文章类型>`。其中的 `<文章类型>` 可以到 `blog.yml` 中的`blogList`查看
