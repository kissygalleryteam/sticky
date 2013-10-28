## sticky

## 综述

sticky 组件是 CSS 属性 position:sticky 的 JS 实现。

position:sticky 是一个新的 CSS3 属性，它的表现类似 position:relative 和 position:fixed 的合体，在目标区域在屏幕中可见时，它的行为就像 position:relative ; 而当页面滚动超出目标区域时，它的表现就像 position:fixed ，它会固定在目标位置。

实现原理是支持 position: sticky 的直接使用 CSS 实现, 不支持的浏览器(除 IE6 外)使用 position: fixed，对 IE6 使用 position:absolute。

sticky 组件参考了 [Arale Sticky](http://aralejs.org/sticky/) 的实现，并对其做了一些扩展。

* 版本：1.1
* demo：[http://gallery.kissyui.com/sticky/1.1/demo/index.html](http://gallery.kissyui.com/sticky/1.1/demo/index.html)

## 初始化组件
	
    S.use('gallery/sticky/1.0/index', function (S, Sticky) {
    	// 创建一个 sticky 元素
    	var sticky = new Sticky({
	       		el: '#stick',
	        	top: 30, 
	        	callback: function(status) { 
	          	}
	        });
	     
	     // 创建一个 fixed 元素
	     Sticky.fixed('#fixed');
    });


## changelog

### V1.1

* 增加配置项target：用于在IE6下指定用于计算的定位父元素，默认为body
* 修复IE7下left计算错误的问题

### V1.0

* 实现页面基于顶部sticky或者基于底部sticky
* 实现兼容各浏览器的fixed效果