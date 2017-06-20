// module: 代码格式化
(function() {
  // 不支持单页面时，进行代码格式化
  if ($.pjax && $.pjax.support) { return; }
  window.prettyPrint && window.prettyPrint();
})();
