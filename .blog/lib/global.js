"use strict";
var util = require("./util");
var path = require("path");
var YAML = require("yamljs");
var data = YAML.load("./blog.yml");

if(true){
    let time = new Date();
    data._time = util.time2obj(time);
}

// 博客列表对象
data.blogListObject = {};
data.getBlogListFormat = function(item){
    return util.urlFormat(path.join(item.publishRoot, this.blogListFormat));
};
data.getBlogListLink = function(item, index){
    var str = this.getBlogListFormat(item);
    return util.strformat(str, {index});
};
data.blogList.forEach(function(item){
    data.blogListObject[item.type] = Object.assign({}, item, {
        name: item.typeName,
        link: data.getBlogListLink(item, 1)
    });
});

Object.assign(exports, data);
