"use strict";
/**
* @description: 文章生成
* @author: da宗熊
* @update: 2015/11/25 14:22
*/

var util = require("./util");
var path = require("path");
var fs = require("fs-extra");
var YAML = require("yamljs");
var GlobalData = require("./global");
var nunjucks = require("./nunjucks");

var article = {
    // 查账内容编译插件
    plugins: {
        ".md": function(text, options, data/* { to, link, options } */){
            var Remarkable = require("remarkable");
            var md = new Remarkable("full", {
                html: true,
                breaks: true,
                langPrefix: "prettyprint linenums lang-"
            });

            var link = data.link;
            var result = md.render(text).replace(/<a href=/gi, function(){
                return '<a target="_blank" href=';
            });
            if (link) {
                var dir = '/' + link.replace(/[^\/]*$/, '').replace(/\/\//g, '/');
                result = result.replace(/(<img[^>]*?src=)(["'])(.*?)\2/gi, function(str, prev, x, src) {
                    return prev + x + (dir + src.replace(/^\./, '')) + x;
                });
            }
            
            return result;
        },
        "default": function(text){
            return text;
        }
    },
    // 添加文章处理插件
    addPlugin: function(name, fn){
        this.plugins[name] = fn;
    },
    // 经过编译的文章列表【含资源】
    list: [],
    // 获取编译后的列表 【不含资源】
    _compileList: null,
    getCompileList: function(){
        if(!this._compileList){
            this._compileList = this.list.map(function(item){
                return this.urlItemOption(item);
            }.bind(this));
        }
        return this._compileList;
    },
    // 预先编译，拿到文章配置
    list: [],
    preCompile: function(filePath){
        this._compileList = null;

        var rootPath = filePath;
        fs.readdirSync(rootPath).forEach(function(file){
            var filePath = path.join(rootPath, file);
            if (!util.isdir(filePath)){
                return;
            }
            var options = YAML.load(path.join(filePath, "config.yml"));
            this._createCompileObj(filePath, options);
        }.bind(this));

        // 给文章从 大到小 排序
        this.list.sort(function(a, b){
            return a._sortId > b._sortId ? -1 : 1;
        });
        return this.list;
    },
    // 生成配置对象 {from: , to: , page: {}, }
    _createCompileObj: function(filePath, config){
        var obj = {
            // 页面
            pages: {},
            // 资源
            resources: []
        };
        var time = Object.assign(
            util.time2obj(new Date(config.time)),
            config
        );
        var toPath = util.strformat(GlobalData.articlePath, time);
        config.time = util.strformat(GlobalData.timeFormate, time);
        // 排序 ID
        obj._sortId = time.string;

        obj.categories = config.categories;
        obj.options = config;

        // @notice 如果没有配置 main 字段，则 options 字段的 第 1 项，就是 main
        if(!obj.main){
            for(let i in config.options){
                if(config.options.hasOwnProperty(i)){
                    obj.main = i;
                    break;
                }
            }
        };

        // 遍历该文件夹
        //   子项是 文件夹，保存到 resources 中
        //   自相是 文件，保存到 pages 中
        fs.readdirSync(filePath).forEach(function(file){
            var realPath = path.join(filePath, file);
            if(util.isdir(realPath)){
                obj.resources.push({
                    from: realPath,
                    to: path.join(toPath, file)
                });
                return;
            }
            if(file != "config.yml"){
                let link = path.join(toPath, path.basename(file, path.extname(file)) + ".html");
                // @notice 本身的参数，与全局参数合并
                let pageOptions = {
                    from: realPath,
                    to: link,
                    link: link.replace(/\\+/g, "/"),
                    // 处理依赖资源，以及页面特有的参数
                    options: Object.assign({
                        navigation: config.type // 文章类型
                    }, config, config.options ? (config.options[file] || {}) : {}),
                };
                obj.pages[file] = pageOptions;
            }
        }.bind(this));

        this.list.push(obj);
    },
    // 生成文章
    generate: function(){
        var allList = this.list;
        GlobalData.blogList.forEach(function(item){
            // 每一种博客，生成各自的列表..
            var list = allList.filter(function(o){
                return o.options.type == item.type;
            });
            this._generate(list);
        }.bind(this));
    },
    _generate: function(list){
        list.forEach(function(obj, index){
            // 1. 复制资源
            obj.resources.forEach(function(item){
                nunjucks.copy({
                    fr: item.from, to: item.to
                });
            });

            // 2. 编译文章
            var pages = obj.pages;
            for(let i in pages){
                if(pages.hasOwnProperty(i)){
                    let item = pages[i];
                    let fn = this.plugins[path.extname(item.from)] || this.plugins["default"];
                    let options = item.options;
                    nunjucks.render(options.template || obj.template || "article.html", item.to, Object.assign({
                        articleContent: fn(fs.readFileSync(item.from).toString(), options, item),
                        articlePrev: this.urlItemOption(list[index  - 1]),
                        articleNext: this.urlItemOption(list[index  + 1])
                    }, options));
                }
            }
        }.bind(this));
    },
    // 文章首页的链接
    urlItemOption: function(obj){
        if(obj){
            var index = obj.main;
            var config = obj.pages[index] || {};
            config = Object.assign({
                link: config.link,
            }, config.options);
            // 文章的 poster 属性，需要加工一下
            if(config.poster && !/:\/\//.test(config.poster)){
                config.poster = path.join(path.dirname(config.link), config.poster).replace(/\\+/g, "/");
            }
            // 修正一下描述
            if (config.homeDescription) {
                var desc = config.homeDescription;
                var link = config.link;
                if (link) {
                    var dir = '/' + link.replace(/[^\/]*$/, '').replace(/\/\//g, '/');
                    desc = desc.replace(/(<img[^>]*?src=)(["'])(.*?)\2/gi, function(str, prev, x, src) {
                        return prev + x + (dir + src.replace(/^\./, '')) + x;
                    });
                }
                config.homeDescription = desc;
            }
            return config;
        }else{
            return null;
        }
    }
};

module.exports = article;
