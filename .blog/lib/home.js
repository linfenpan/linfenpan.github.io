"use strict";

var GlobalData = require("./global");
var Nunjucks = require("./nunjucks");
var article = require("./article");
var path = require("path");
var fs = require("fs-extra");

var home = {
    // 生成主页
    generate: function(){
        // 首页只要最新 20 条数据
        let dataList = article.getCompileList().slice(0, GlobalData.index.count || 20);
        Nunjucks.render("index.html", "./index.html", Object.assign({
            navigation: "home",
            dataList: dataList
        }, GlobalData.index));
    }
};

module.exports = home;
