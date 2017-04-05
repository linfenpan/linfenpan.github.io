/*! author: da宗熊 */
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}};(function($){var Waterfall=function(){function Waterfall(elem,options){_classCallCheck(this,Waterfall);this.$root=typeof elem==="string"?$(elem):elem;this.options={itemWidth:0.25,vertical:10,horizontal:10,fixHeight:true};this.addAnimate=this.removeAnimate=function($elem,next){next()};this.reflowAnimate=function($elem,position,next){$elem.css(position);next()};this.itemInitialStyle={};this.init(options||{})}_createClass(Waterfall,[{key:"init",value:function init(options){var $root=this.$root;var cssPosition="position";if($root.css(cssPosition)=="static"){$root.css(cssPosition,"relative")}this.reset(options)}},{key:"reset",value:function reset(options){var _this=this;$.extend(this.options,options||{});options=this.options;this.itemInitialStyle=options.initStyle||this.itemInitialStyle;var rootWidth=this.$root.outerWidth();this.rootWidth=rootWidth;var caculateIfPercent=function caculateIfPercent(width){if(width<=1){width=_this.rootWidth*width}return width};var itemWidth=this.itemWidth=caculateIfPercent(options.itemWidth);var itemVSpace=this.itemVSpace=caculateIfPercent(options.vertical);var itemHSpace=this.itemHSpace=caculateIfPercent(options.horizontal);var cellCount=Math.floor(rootWidth/itemWidth);while(cellCount*itemWidth+(cellCount-1)*itemHSpace>rootWidth){cellCount--}cellCount=cellCount||1;var leaveSpace=rootWidth-(cellCount*itemWidth+(cellCount-1)*itemHSpace);var startX=leaveSpace/2;this.startX=startX;this.cellCount=cellCount;this.resetCells();return this}},{key:"resetCells",value:function resetCells(){var cellCount=this.cellCount;var itemHSpace=this.itemHSpace;var itemWidth=this.itemWidth;var startX=this.startX;var cells=[];for(var i=0,max=cellCount;i<max;i++){var x=startX+i*(itemHSpace+itemWidth),y=0;cells.push({x:x,y:y})};this.cells=cells}},{key:"placeElement",value:function placeElement($elem){var cell=this.queryMinCell();var vertical=this.itemVSpace;var top=cell.y;var left=cell.x;$elem.css({left:cell.x,top:cell.y});cell.y+=$elem.outerHeight()+vertical;return {top:top,left:left}}},{key:"initElememtStyle",value:function initElememtStyle($elem){$elem.css($.extend({position:"absolute",width:this.itemWidth},this.itemInitialStyle))}},{key:"queryMinCell",value:function queryMinCell(){this.cells.sort(function(a,b){return a.y>b.y?1:-1});var cell=this.cells[0];return cell}},{key:"getChildren",value:function getChildren(){return this.$root.children()}},{key:"setAddAnimate",value:function setAddAnimate(animate){this.addAnimate=animate;return this}},{key:"setRemoveAnimate",value:function setRemoveAnimate(animate){this.removeAnimate=animate;return this}},{key:"setReflowAnimate",value:function setReflowAnimate(animate){this.reflowAnimate=animate;return this}}]);return Waterfall}();;var prototype=Waterfall.prototype;$.extend(prototype,{waitStack:[],isWait:false,wait:function wait(){this.isWait=true;return this},notify:function notify(){this.isWait=false;this.popStack();return this},pushStack:function pushStack(fn,args){var _this2=this;this.waitStack.push(function(){fn.apply(_this2,args)});return this},popStack:function popStack(){if(!this.isWait){var fn=this.waitStack.shift();if(fn){fn();this.popStack()}}return this}});$.extend(prototype,{add:function add(elem,index){var _this3=this;var $elem=$(elem);var $children=this.getChildren();this.initElememtStyle($elem);if(typeof index=="undefined"||index>=$children.size()){$elem.appendTo(this.$root);this.placeElement($elem)}else {$children.eq(index).before($elem);this.reflow()}this.addAnimate($elem,function(){_this3.notify()});return this},remove:function remove(index){var _this4=this;var $children=this.getChildren();var $cur=$children.eq(index);if($cur.size()>0){this.removeAnimate($cur,function(){$cur.remove();_this4.notify();_this4.reflow()})}return this},replace:function replace(index,elem){var $children=this.getChildren();if(index>=$children.size()){this.add(elem)}else {this.remove(index).wait().add(elem,index)}return this},reflow:function reflow(){var _this5=this;var $children=this.getChildren();this.resetCells();var size=$children.size();$children.each(function(i,v){var $elem=$(v);var oldPos=$elem.position();var newPos=_this5.placeElement($elem);$elem.css(oldPos);_this5.reflowAnimate($elem,newPos,function(){if(i+1>=size){_this5.notify()}})});return this},resize:function resize(){this.reset().reflow();return this}});var waitList="add,remove,replace,reflow,wait".split(",");var _loop=function _loop(i,max){var key=waitList[i];var orignalFn=prototype[key];prototype[key]=function(){for(var _len2=arguments.length,args=Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2]}if(this.isWait){this.pushStack(orignalFn,args)}else {orignalFn.apply(this,args)}return this}};for(var i=0,max=waitList.length;i<max;i++){_loop(i,max)};$.fn.extend({waterfall:function waterfall(options){for(var _len=arguments.length,args=Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){args[_key-1]=arguments[_key]}this.each(function(i,v){var dataKey="waterfall";var $elem=$(v);var waterfall=$elem.data(dataKey);var optionsType=typeof options==="undefined"?"undefined":_typeof(options);if(waterfall){switch(optionsType){case "string":var method=waterfall[options];method.apply(waterfall,args);break;case "function":var fn=options;fn.call($elem,waterfall);break;}}else {waterfall=new Waterfall($elem,options);$elem.data(dataKey,waterfall)}});return this}})})($);