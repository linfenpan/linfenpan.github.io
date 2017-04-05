"use strict";
/**
* @description: 工具
* @author: da宗熊
* @update: 2015/11/25 14:26
*/
var fs = require("fs-extra");
var path = require("path");

var util = {
    time2obj: function(time) {
        function format(num){
            return num >= 10 ? num : ("0" + num);
        };
        return {
            year: time.getFullYear(),
            month: format(time.getMonth() + 1),
            date: format(time.getDate()),
            hour: format(time.getHours()),
            minute: format(time.getMinutes()),
            second: format(time.getSeconds()),
            string: time / 1
        }
    },
    strformat: function(str, obj, reg){
        return str.replace(reg || /:([^-,:.\\\/\s]+)/g, function(str, key){
            return obj[key];
        });
    },
    isdir: function(filePath){
        return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory() || false;
    },
    urlFormat: function(url){
        return url.replace(/\\+/g, "/");
    },
    // @param total {Number} 总页数
    // @param per {Number} 显示的页码数
    // @param cur {Number} 当前是第几页
    pagerParams: function(total, per, cur){
        let start = 1, end = per;

        if( total > end ){
            let half = Math.floor((end - start) / 2);
            if( cur  > end - start ){
                start = cur - half;
                // 中间有 1 个 cur
                end = start + per - 1;
            }
        }
        if( end > total ){
            end = total;
            start = end - per;
        }
        if( start < 1 ){
            start = 1;
        }
        return {
            start, end, total, index: cur
        };
    }
};

module.exports = util;
