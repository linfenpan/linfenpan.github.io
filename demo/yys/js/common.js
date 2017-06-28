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


// module: 全局 a 标签修复
;(function() {
  $('body').on('click', 'a', function() {
    var $link = $(this);
    var href = $link.attr('href');
    if (/^javascript/.test(href) || /^http\:/.test(href)) {
      // nothing
    } else if (/^\//.test(href)) {
      $link.attr('href', urlRoot + href);
    }
    return true;
  });
})();


// module: 搜索功能
$(function() {
  In.add('modal-css', {
    path: urlRoot + '/css/jquery-modal.css'
  });
  In.add('modal', {
    rely: ['modal-css'],
    path: urlRoot + '/js/jquery-modal.js'
  });

  var $body = $('body');
  var $siteHeader = $('#site-header');
  if ($siteHeader.length > 0) {
    In('modal', function() {
      $.get(urlRoot + '/ajax/search.html', function(html) {
        $body.append(html);
        bindClick();
      });
    });
  }

  function bindClick() {
    $siteHeader.on('click', '.fa-search', function() {
      var popup = $.popup('#popup-search');
      var $root = popup.$root;

      $root.on('submit', 'form', function() {
        $.alert('搜索:' + $.trim($root.find('.input').val()))
        return false;
      });
      $root.on('click', '.fa-search', function() {
        var val = $.trim($root.find('.input').val());
        if (val) {
          $root.find('form').submit();
        } else {
          $root.find('.input').focus();
        }
        return false;
      });
    });
  };
});


// module: 筛选功能
$(function initFilter() {
  var $root = $('body');
  var $filters = $root.find('.fa-filter');

  if ($filters.length > 0) {
    $.get(urlRoot + '/ajax/filter.html')
      .done(function(html) {
        $root.append(html);
        initFilter();
      });
  }

  function initFilter() {
    $filters.each(function(i, el) {
      var $a = $(el).closest('a');
      if ($a.length > 0) {
        $a.click(showFilter);
      }
    });
  }

  var popup;
  function showFilter() {
    if (!popup) {
      var $root = $('#popupFilters')
      popup = new $.Popup({
        cls: $root.attr('class'),
        content: $root.html(),
        autoDestroy: false
      });
      bindEvent(popup.$root);
    }

    popup.show();
  }

  function bindEvent($root) {
    console.log('xxx');
    $root.on('click', '.toggle', function() {
      $(this).toggleClass('on').closest('.option').find('.cnt').toggleClass('hide');
    });
  }
});


// module: 区服选择
$(function() {
  $('body').on('click', '[data-area-select]', function() {
    renderAreaSelect();
  });

  var isInit = false;
  function renderAreaSelect() {
    if (isInit) {
      showAreaSelect();
    } else {
      isInit = true;
      $.get(urlRoot + '/ajax/area-select.html')
        .done(function(html) {
          $('body').append(html);
          showAreaSelect();
        });
    }
  }

  var popup;
  function showAreaSelect() {
    var $root = $('#popupAreaSelect');
    if (!popup) {
      popup = new $.Popup({
        cls: $root.attr('class'),
        content: $root.html(),
        autoDestroy: false
      });
    }
    popup.show();
  }
});
