document.createEvent 和 element.dispatchEvent，这一对，今天就来揭晓一下他们的神秘面孔。

-------------------------

## 作用

document.createEvent 用于创建事件，如点击、鼠标移动、键盘输入等事件。
``` javascript
	var clickEvent = document.createEvent("HTMLEvents");
	clickEvent.initEvent("click");
```
事件声明，初始化后，即能发布出去:
``` javascript
	document.getElementById("btn").dispatchEvent(clickEvent);
```
上述代码，触发了 ``` btn ``` 元素的点击事件。

脑筋一转，这不就跟 ``` btn.click() ``` 一样吗？何必大费周章呢。BUT，有见过 ``` btn.keydown() ``` 的吗？

PS:
dom元素内置了 click/blur/focus 等常用api，快捷发布事件。


------------------------

## 使用

事件从创建到发布，一共3步。

### createEvent

``` document.createEvent(EventName) ``` 接受1个参数，EventName可用的值，暂时发现有4个: HTMLEvents、UIEvents、MouseEvents、MutationEvents

前3个用得最为广泛。其中，每个事件，能创建的事件，各不相同:

HTMLEvents:

- abort
- blur
- focus
- change
- error
- load
- reset
- resize
- scroll
- select
- submit
- unload
- click [也可以用 MouseEvents ]



UIEvents:

- DOMActive
- DOMFocusIn
- DOMFocusOut
- keydown
- keyup
- keypress


MouseEvents

- click
- mousedown
- mousemove
- mouseout
- mouseover
- mouseup


MutationEvents

- DOMAttrModified [没效
- DOMNodeInserted
- DOMNodeRemoved
- DOMCharacterDataModified [文本更变时
- DOMNodeInsertedIntoDocument
- DOMNodeRemovedFromDocument
- DOMSubtreeModified [子元素更变时


### 事件初始

创建事件之后，不用的事件，需要不同的初始化:
HTMLEvents:  event.initEvent("click");
UIEvents:  event.initUIEvent("keydown");
MouseEvents:  event.initMouseEvent("mousedown");
MutationEvents:  event.initMutationEvent("DOMNodeInserted");

所有 initEvent 的方法，可接受的参数，都大同小异。
参考如下:
``` javascript
event.initEvent(EventType, canBubble, canPreventDefault, windowObject, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);
```
常用的，可设置 1 或 3 个参数，其它参数，按需设置，建议如下设置:

``` javascript
	var keydownEvent = document.createEvent("UIEvents");
	keydownEvent.initUIEvent("keydown", false, false);

	// 在这设置其它参数，更为合理
	keydownEvent.keyCode = 13;

	element.dispatchEvent(keydownEvent);
```


### 发布事件

在需要触发事件的元素上，调用 ``` dispatchEvent ``` 即可，发布的事件，必须先调用相关的initEvent方法。
``` javascript
element.dispatchEvent(event);
```
