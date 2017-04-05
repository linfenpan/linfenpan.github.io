"use strict";

var blog = require("./lib/blog");
var commander = require("commander");

commander
    .option("-p, --publish", "发布文件")
    .option("-c, --copy", "复制静态资源");

commander.command("new [name]")
    .description("新建文章")
    .option("-t, --type [mode]", "默认:b是博客，p是插件，其它类型需要填写全称")
    .action(function(name, options){
        if(name){
            options.type = ({
                b: "blog",
                p: "plugin"
            })[options.type] || options.type || "blog";
            blog.newArticle(name, options.type);
        }
    });

commander.parse(process.argv);

if(commander.publish){
    blog.generate();
}
if(commander.copy){
    blog.copy();
}
