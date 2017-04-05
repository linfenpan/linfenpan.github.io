"use strict";
var path = require("path");
var fs = require("fs-extra");
// module: 全局对象
var GlobalData = require("./global");
// module: 工具
var util = require("./util");

var blog = {};
    // 新建博客
blog.newArticle = function(name, type){
    var blogOptions = GlobalData.blogListObject[type];
    if (!blogOptions) {
        throw "article type:" + type + ", does not exists, please set type in 'blog.yml' file";
    }

    let ymlPath = `./${blogOptions.sourceRoot}/${name}/config.yml`;
    let filePath = `./${blogOptions.sourceRoot}/${name}/index.md`;
    // console.log(blogOptions, ymlPath);

    let now = new Date();
    if(fs.existsSync(filePath)){
        console.log("文件[" + name + "]已经存在");
        return;
    }
    fs.copySync("./static/index.md", filePath);
    fs.writeFileSync(
        ymlPath,
        util.strformat(fs.readFileSync("./static/config.yml").toString(), {
            id: now/1,
            author: GlobalData.author,
            title: name,
            type: type,
            date: util.strformat(":year-:month-:date :hour::minute", util.time2obj(now))
        }),
        { encoding: "utf8" }
    );
};

// 复制资源
blog.copy = function(){
    // module: 模板
    let nunjucks = require("./nunjucks");
    ["./assert", "./css", "./js"].forEach(function(to){
        nunjucks.copy({
            fr: path.join(process.cwd(), to), to
        });
    });
};

// 文章生成
blog.generate = function(){
    // module: 文章
    var article = require("./article");

    // 生成笔记
    GlobalData.blogList.forEach(function(item, index){
        // 生成文章
        article.preCompile(path.join(process.cwd(), item.sourceRoot));
    });

    // module: 生成列表页
    require("./list").generate();

    // module: 首页生成
    require("./home").generate();

    // 生成文章
    article.generate();
}

module.exports = blog;
