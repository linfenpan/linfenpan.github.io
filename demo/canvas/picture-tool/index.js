'use strict';

;(function($) {
  var $Event = $('<div></div>');

  var $navbar = $('#navbar');
  var $workplace = $('#workplace');
  var $message = $('#message');
  var $result = $('#result');

  // 导航栏
  $navbar.on('click', '.btnResize', function() {
    var width = $navbar.find('.width').val();
    var height = $navbar.find('.height').val();
    $Event.trigger('resize', { width: +width, height: +height });
  });

  $(function() {
    $navbar.find('.btnResize').trigger('click');
  });

  $navbar.on('click', '.btnCreate', function() {
    // 生成图像..
    buildPreview();
  });

  // 工作区
  $Event.on('resize', function(e, size) {
    $workplace.find('.content').css(size);
  });

  // $workplace.find('.content').selectable({
  //   filter: '.item'
  // });

  $workplace.on('dragover', function(e) {
    e.preventDefault();
  });

  $workplace.on('drop', function(e) {
    e.preventDefault();
    uploadFiles(e.originalEvent.dataTransfer.files || []);
  });

  function uploadFiles(list) {
    if (!list || list.length <= 0) { return; }

    for (var i = 0, max = list.length; i < max; i++) {
      var file = list[i];
      if (!file.type.match(/image*/)) {
        return;
      }


      var img = document.createElement("img");
      var reader = new FileReader();
      img.setAttribute('data-name', file.name);
      reader.onload = (function(aImg) {
        return function(e) {
          aImg.src = e.target.result;
          aImg.className = 'item';
          $Event.trigger('addItem', aImg);
        };
      })(img);
      reader.readAsDataURL(file);
    }
  }

  $Event.on('addItem', function(e, img) {
    $workplace.find('.content').append(img);
    $(img).draggable({
      drag: function(event, ui) {
        $Event.trigger('moveItem', ui)
      }
    });
  });

  $workplace.find('.content .item').each(function(i, elem) {
    $Event.trigger('addItem', elem);
  });

  $workplace.on('mousedown', '.content .item', function() {
    $(this).addClass('active').siblings('.item').removeClass('active');
    $Event.trigger('selectItem', this);
  }).on('mousedown', function(e) {
    if ($(e.target).hasClass('active') == false) {
      $workplace.find('.content .active').removeClass('active');
    }
  });

  $(document).on('keyup', function(e) {
    switch (e.keyCode) {
      // 删除
      case 46:
        $workplace.find('.content .active').remove();
        break;
    }
  });

  // 信息栏目
  var $info = $message.find('.info');

  $info.css({ visibility: 'hidden' });
  $workplace.on('mousedown', function(e) {
    $info.css({ visibility: 'hidden' });
  }).on('mousedown', '.content .item', function(e) {
    $info.css({ visibility: 'visible' });
    return false;
  });

  $Event.on('selectItem', function(e, elem) {
    var $elem = $(elem);
    $info.find('[name=name]').text($elem.data('name'));
    $info.find('[name=width]').val($elem.outerWidth());
    $info.find('[name=height]').val($elem.outerHeight());
    $info.find('[name=left]').val($elem.position().left);
    $info.find('[name=top]').val($elem.position().top);
    $info.find('[name=z-index]').val($elem.css('zIndex') || 0);
  });

  $Event.on('moveItem', function(e, ui) {
    var $elem = $(ui.helper);
    $info.find('[name=left]').val(ui.position.left);
    $info.find('[name=top]').val(ui.position.top);
  });

  $info.on('input', '.input', function() {
    var $item = $workplace.find('.content .active');
    if ($item.length >= 0) {
      var style = {};
      style[this.name] = +this.value.trim();
      $item.css(style);
    }
  });


  // 结果
  $result.on('click', '.close', function() {
    $result.hide(200);
  });
})(window.jQuery);


// 创建预览
function buildPreview() {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var $content = $('#workplace .content');

  canvas.width = $content.outerWidth();
  canvas.height = $content.outerHeight();


  var imgs = $content.find('.item').toArray();
  imgs.sort(function(a, b) {
    return $(a).css('z-index') >= $(b).css('z-index') ? 1 : -1;
  });

  imgs.forEach(function(img) {
    var w = img.width;
    var h = img.height;
    var x = parseInt(img.style.left) || 0;
    var y = parseInt(img.style.top) || 0;
    context.drawImage(img, x, y, w, h);
  });

  canvas.toBlob(function(blob) {
    $('#result').show(200).find('.content').html('<img src="' + URL.createObjectURL(blob) + '">');
  });
}
