'use strict';
const gulp = require('gulp');
const path = require('path');

const babel = require('gulp-babel');
const concat = require("gulp-concat");
const header = require("gulp-header");
const footer = require("gulp-footer");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const less = require('gulp-less');
const cssmin = require('gulp-cssmin');
const autoprefixer = require('gulp-autoprefixer');

const pkg = require('./package.json');
const now = new Date();
const textAuthor = `/**
  @rely: jQuery
  @author: ${ pkg.author }
  @version: ${ pkg.version }
  @lastModify: ${ now.getFullYear() }/${ now.getMonth() + 1 }/${ now.getDate() }
*/\n`;
const textHeader = `
${textAuthor}
+(function($) {\n`;
const textFooter = `\n})(window.jQuery || window.$);`;


gulp.task('build:js', () => {
  const scripts = [
    'src/util.js', 'src/base.js', 'src/animate-mobile/animate.js', 'src/modal.js', 'src/popup.js', 'src/output.js',
    // 下面这堆，都是 picker.js 依赖的
    'src/mobile/util.js', 'src/mobile/device.js', 'src/mobile/zepto-adapter.js', 'src/mobile/picker-modal.js', 'src/mobile/picker.js'
  ];

  return gulp.src(scripts)
    .pipe(concat('jquery-modal.js'))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(header(textHeader))
    .pipe(footer(textFooter))
    .pipe(gulp.dest('dest'))
    .pipe(uglify({
        compress: {
            warnings: false
        },
        mangle: true,
        preserveComments: false
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(textAuthor))
    .pipe(gulp.dest('dest'));
});

const styles = [
  'src/style.less',
  // 下面这堆，都是 picker.js 依赖的
  'src/mobile/picker.less'
];
gulp.task('build:css', () => {
  return gulp.src(styles)
    .pipe(concat('jquery-modal.css'))
    .pipe(less({
      // @see http://www.lesscss.net/
      paths: [path.join(__dirname, './src'), path.join(__dirname, 'src/mobile')],
      globalVars: {
        scale: '1rem',
        modalWidth: '13rem',
        modalColor: '#8a4f32'
      }
    }))
    .pipe(autoprefixer({
      browsers: [ 'Android >= 2', 'Chrome >= 20', 'Firefox >= 24', 'Explorer >= 9', 'iOS >= 6', 'Opera >= 12', 'Safari >= 6' ]
    }))
    .pipe(gulp.dest('dest'))
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dest'));
});


gulp.task('default', ['build:js', 'build:css']);
gulp.task('css:watch', () => {
  return gulp.watch(styles, ['build:css']);
});
