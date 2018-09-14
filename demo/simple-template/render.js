/**
 * 简单的模板渲染方法
 * @example
 *   var result = render('你好<%= this.name %>', { name: 'da宗熊' }); // -> '你好da宗熊'
 * 使用与 ejs 一致，含三类语法: <% 代码块 %>，<%= 输出内容[被转义后的] %>，<%=# 输出内容[没被转义的] %>
 * @param {*} html 模板
 * @param {*} data 数据
 * @returns {string}
 */
function render(html, data) {
  var reg = new RegExp('<%=?#?([\\s\\S]*?)%>', 'g');
  data = data || {};
  html = html || '';

  var functionBody = ['var __res = [];\n'];
  var start = 0;

  function pure(str) {
    return typeof str === 'string' ? str.replace(/"/g, '\\"').replace(/\n|\r/g, '\\n').replace(/^[\s\\n]+$/, '').replace(/(\\n)+\s+/g, '\\n') : str;
  }

  // 添加转义函数
  functionBody.push('var $escape = ' + (function (s) {
    var str = s + '';
      str = str.replace(/&/g, '&amp;');
      str = str.replace(/</g, '&lt;');
      str = str.replace(/>/g, '&gt;');
      str = str.replace(/"/g, '&quot;');
    return str;
  }).toString() + ';\n');

  // // 把 data 所有属性，插入一次，请保留 __res 和 $_escape 两个
  // for (var key in data) {
  //   if (data.hasOwnProperty(key) && /^[^\d\s"']/.test(key)) {
  //     functionBody.push('var ' + key + ' = this.' + key + ';\n');
  //   }
  // }

  var exec = null;
  while (exec = reg.exec(html)) {
    var index = exec.index;
    var str = exec[0];
    var key = exec[1];
    var offset = str.length;

    if (start < index) {
      var s = pure(html.slice(start, index));
      if (s) {
        functionBody.push('__res.push("'+ s +'");\n');
      }
      start = index + offset;
    }

    // <%= value %> 转义输出
    // <%=# value %> 不转义输出
    if (str.charAt(2) === '=') {
      if (str.charAt(3) === '#') {
        functionBody.push('__res.push('+ key +');\n');
      } else {
        functionBody.push('__res.push($escape('+ key +'));\n');
      }
    } else {
      functionBody.push(key + '\n');
    }
  }

  // 如果 start 不是尽头，就再插入一次
  if (start < html.length) {
    functionBody.push('__res.push("'+ pure(html.slice(start, html.length)) +'");\n');
  }

  functionBody.push('return __res.join(\'\');');
  var fn = new Function(functionBody.join(''));
  var res = fn.call(data || {});
  fn = null;

  return res;
};
