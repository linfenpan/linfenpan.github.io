"use strict";

var fs = require("fs-extra");
var path = require("path");
var YAML = require("yamljs");
var nunjucks = require("nunjucks");

var util = require("./util");
var GlobalData = require("./global");

nunjucks.configure("views", {
    autoescape: false,
    trimBlocks: true,
    lstripBlocks: true
});

module.exports = {
    nunjucks: nunjucks,
    // 生成内容
    render: function(template, toPath, data){
        var column = this.loadColumns(template);    // 载入相关栏目
        data = Object.assign({}, GlobalData, column, data);
        this.write({
            path: toPath,
            content: nunjucks.render(template, data)
        });
    },
    // 加载相关的栏目
    // 栏目规则：./columns中，找到 columnName 的文件夹，文件夹下，所有 .yml 文件，为 column 中的配置
    //      如 ./columns/aaa/xxx.yml  ==> column: {xxx: { yml里的配置 }}
    // @param columnName {String} 栏目名称
    loadColumns: function(columnName, obj){
        let data = {column: {}};
        var rootPath = path.join(process.cwd(), "columns", columnName);
        if( !fs.existsSync(rootPath) ){
            return data;
        }
        fs.readdirSync(rootPath).forEach(function(filePath){
            let column = data.column;
            if( !util.isdir(filePath) ){
                let ext = path.extname(filePath);
                if( ext === ".yml" ){
                    column[path.basename(filePath, ext)] = YAML.load(path.join(rootPath, filePath));
                }
            }
        });
        return data;
    },
    // 根据 全局 参数的拷贝
    // @param options {fr: 来源路径, to: 目标路径}
    copy: function(options){
        if( options && options.fr && options.to ){
            let fr = options.fr, to = options.to;
            let toPath = this.realPath(to);

            fs.copySync(fr, toPath);
            console.log("复制:" + toPath);
        }

    },
    // 根据全局配置，写入文件
    // @param to 将要写入的路径
    // @param text 写入的文本
    write: function(options){
        if( options && options.path && options.content ){
            let to = options.path,
                content = options.content;
            let toPath = this.realPath(to);
            fs.ensureDirSync(path.dirname(toPath));

            fs.writeFileSync(toPath, content, {
                encoding: "utf8"
            });
            console.log("生成:" + toPath);
        }
    },
    // 根据全局变量，计算出需要的绝对路径
    realPath: function(to){
        return path.isAbsolute(to) ? to : path.join(process.cwd(), GlobalData.publishRoot, to);
    }
};
