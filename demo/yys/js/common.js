'use strict';

var $siteHeader = $('#site-header');
var $siteSidebar = $('#site-sidebar');
var $siteContainer = $('#site-container');
var $body = $('body');

var urlRoot = location.pathname;
// module: 获取 ajax 的根路径
;(function() {
  if (/\/index\.html$/.test(urlRoot)) {
    urlRoot = urlRoot.replace(/\/index\.html$/, '');
  } else {
    // -> /xxx/page/yyy.html
    urlRoot = urlRoot.replace(/\/page\/[^.]+\.html$/, '');
  }
  urlRoot = location.origin + urlRoot;
})();

var dataDefault = {
  root: urlRoot
};
var fnDefault = '';
for (var key in dataDefault) {
  if (dataDefault.hasOwnProperty(key)) {
    fnDefault += 'var ' + key + '=' + JSON.stringify(dataDefault[key]) + ';';
  }
}

function formatByDefault(str) {
  var fn = '';
  return str.replace(/\${([^}]+)}/g, function(str, key) {
    try {
      var fn = new Function(fnDefault + '\n' + 'return ' + key);
      return fn();
    } catch (e) {
      return '';
    }
  });
}


// module: 侧边栏
;(function initSidebar() {
  if ($siteHeader.length <= 0 || $siteSidebar.length <= 0) { return; }

  $.get(urlRoot + '/ajax/site-sidebar.html')
    .done(function(html) {
      $siteSidebar.html(formatByDefault(html));
    });

  function show() {
    $siteSidebar.addClass('on');
    $body.addClass('active-sidebar');
  }

  function hide() {
    $siteSidebar.removeClass('on');
    $body.removeClass('active-sidebar');
  }

  $siteHeader.on('click', '.fa-bars', show);
  $siteSidebar.on('click', '[data-close]', hide)
    .on('click', '.back', hide);
})();
