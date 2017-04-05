scrollIntoView(alignWithTop)  滚动浏览器窗口或容器元素，以便在当前视窗的可见范围看见当前元素。
如果alignWithTop为true，或者省略它，窗口会尽可能滚动到自身顶部与元素顶部平齐。
如果alignWithTop为false，窗口会尽可能的滚动把自身底部，与元素的底部齐平。
目前IE8及以上的浏览器均支持:

参考资料: [兼容性查询](http://caniuse.com/#search=scrollIntoView)、[文档资料](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)

看个例子:

``` html
<!DOCTYPE html>
<html>
	<head>
		<title>TODO supply a title</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
	<body>
		<a onClick="onc()">到达内容区域</a>
		<div style="width:400px; height:400px; border: 1px solid #f00;"></div>
		<div id="nn" style="border:1px solid #666">
			<div style="height:900px;">内容区域</div>  
		</div>
    <script>
     //作为一个事件的函数来被调用
  		function onc () {
    		var dd = document.getElementById("nn").scrollIntoView(true);	 //这个意思其实就是将这个元素到顶部来浏览器窗口的顶部来显示
    	}
  	</script>
	</body>
</html>
```
