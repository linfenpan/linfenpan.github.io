'use strict';
// 动态执行 grunt 的某个任务,test

const path = require('path');
let grunt = require('grunt');

grunt.cli({
  gruntfile: path.join(__dirname, '/Gruntfile.js')
});

grunt.task.run('default');
