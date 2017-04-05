module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            test: {
                options: {
                    compress: false,
                    rootpath: "../assert/css/",   // 资源根路径
                    customFunctions: {
                        // 自定义函数
                    },
                    banner: '/* By <%= pkg.author %> <%= grunt.template.today("yyyy-mm-dd") %> */',
                    plugins: [
                       new (require('less-plugin-autoprefix'))({browsers: ["last 10 versions", "IE 7"]})
                     ],
                },
                files: {
                    "css/base.css": "less/base.less",
                    "css/common.css": "less/common.less",
                    "css/index.css": "less/index.less",
                    "css/article.css": "less/article.less",
                    "css/list.css": "less/list.less"
                }
            }
        },
        watch: {
            less: {
                files: ["less/*.less"],
                tasks: ["less"],
                options: {
                    debounceDelay: 200
                }
            }
        }
    });

    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // 默认被执行的任务列表。
    grunt.registerTask('default', ['less', 'watch']);
};
