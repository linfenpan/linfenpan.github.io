[参考资料-XDomainRequest](https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest)
懒的同学，可以使用[jquery.xDomainRequest.js](https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest/blob/master/jQuery.XDomainRequest.js)

## 背景

记得在ie10+和chrome等浏览器，只要在请求头部，设置 Access-Control-Allow-Origin，即可让前端进行跨域请求。
但是，在ie8/9下，就只能说一声抱歉了。

经常Google以后发现。。。。
IE8以上的版本跨域提交需要使用XDomainRequest 对象。。。。
（IE 为什么每次你都这么另类！，jQuery你为什么不兼容ie8和ie9的跨域提交功能。。加点代码很麻烦么！！！）


## 使用

给个详细的get地址，用法与XMLHttpRequest对象，比较类似:
```html
<!DOCTYPE html>

<html>
<body>
  <h2>XDomainRequest</h2>
  <input type="text" id="tbURL" value="http://www.contoso.com/xdr.txt" style="width: 300px"><br>
  <input type="text" id="tbTO" value="10000"><br>
  <input type="button" onclick="mytest()" value="Get">&nbsp;&nbsp;&nbsp;
    <input type="button" onclick="stopdata()" value="Stop">&nbsp;&nbsp;&nbsp;
    <input type="button" onclick="readdata()" value="Read">
  <br>
  <div id="dResponse"></div>
  <script>
    var xdr;
    function readdata()
    {
      var dRes = document.getElementById('dResponse');
      dRes.innerText = xdr.responseText;
      alert("Content-type: " + xdr.contentType);
      alert("Length: " + xdr.responseText.length);
    }

    function err()
    {
      alert("XDR onerror");
    }

    function timeo()
    {
      alert("XDR ontimeout");
    }

    function loadd()
    {
      alert("XDR onload");
      alert("Got: " + xdr.responseText);
    }

    function progres()
    {
      alert("XDR onprogress");
      alert("Got: " + xdr.responseText);
    }

    function stopdata()
    {
      xdr.abort();
    }

    function mytest()
    {
      var url = document.getElementById('tbURL');
      var timeout = document.getElementById('tbTO');
      if (window.XDomainRequest)
      {
        xdr = new XDomainRequest();
        if (xdr)
        {
          xdr.onerror = err;
          xdr.ontimeout = timeo;
          xdr.onprogress = progres;
          xdr.onload = loadd;
          xdr.timeout = tbTO.value;
          xdr.open("get", tbURL.value);
          // 如果有参数，在xdr.send(params)里发送，params应该是键值对的querystring
          xdr.send();
        }
        else
        {
          alert("Failed to create");
        }
      }
      else
      {
        alert("XDR doesn't exist");
      }
    }
  </script>
</body>
</html>
```

## 其他资料
CORS is supported in the following browsers:

  - Chrome 3+
  - Firefox 3.5+
  - Opera 12+
  - Safari 4+
  - Internet Explorer 8+

简单的创建xhr对象:
```javascript
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

var xhr = createCORSRequest('GET', url);
if (!xhr) {
  throw new Error('CORS not supported');
}
```

[CORS参考](http://www.html5rocks.com/en/tutorials/cors/)
