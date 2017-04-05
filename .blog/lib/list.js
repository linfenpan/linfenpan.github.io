"use strict";
/**
* @description: 生成博客、插件等列表
* @author: da宗熊
* @update: 2015-11-26 17:50
*/

var path = require("path");
var util = require("./util");
var article = require("./article");
var nunjucks = require("./nunjucks");
var GlobalData = require("./global");

module.exports = {
    generate: function(){
        let list = article.getCompileList();
        // 生成列表
        GlobalData.blogList.forEach(function(item){
            this.buildList(list, item);
        }.bind(this));
    },
    buildList: function(all, config){
        let type = config.type;
        let list = all.filter(function(item){
            return item.type == type;
        });

        // 分页信息
        let perPage = config.count || 10;
        let totalPage = Math.ceil(list.length / perPage) || 1;

        for(let i = 1; i <= totalPage; i++){
            // 使用配置的 列表名字
            let dataList = list.slice((i - 1) * perPage, i * perPage);
            // 计算分页开始 和 结束索引，每 5 页
            let pager = util.pagerParams(totalPage, 5, i);

            nunjucks.render("list.html", GlobalData.getBlogListLink(config, i), Object.assign({}, config, {
                pager: Object.assign(pager, {
                    format: GlobalData.getBlogListFormat(config)
                }),
                navigation: config.type,
                dataList
            }));
        }
    }
};
