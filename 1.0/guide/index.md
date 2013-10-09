## 综述

sticky 组件是 CSS 属性 position:sticky 的 JS 实现。

position:sticky 是一个新的 CSS3 属性，它的表现类似 position:relative 和 position:fixed 的合体，在目标区域在屏幕中可见时，它的行为就像 position:relative ; 而当页面滚动超出目标区域时，它的表现就像 position:fixed ，它会固定在目标位置。

实现原理是支持 position: sticky 的直接使用 CSS 实现, 不支持的浏览器(除 IE6 外)使用 position: fixed，对 IE6 使用 position:absolute。

sticky 组件参考了 [Arale Sticky](http://aralejs.org/sticky/) 的实现，并对其做了一些扩展。

* 版本：1.0
* 作者：函谷
* 标签：sticky, fixed兼容
* demo：[http://gallery.kissyui.com/sticky/1.0/demo/index.html](http://gallery.kissyui.com/sticky/1.0/demo/index.html)

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

## API说明

#### new Sticky({config})

- `el` {String|HTMLElement} 
	
    需要跟随滚动的目标元素
	
- `top` {Number} 
	
	基于顶部跟随滚动时设置；当元素距离当前可视窗口顶部的距离等于这个值时，开始触发跟随状态。

- `bottom` {Number} 
	
	基于底部跟随滚动时设置；当元素距离当前可视窗口底部的距离等于这个值时，开始触发跟随状态。

- `callback` {Function} 
	
	更改状态的回调函数，具有一个参数 status, 为 true 表示是 stick 状态, 为 false 为 unstick 状态。

需要注意的是：

1) 当同时设置 top 和 bottom 的值时，只有 top 会生效。

2) Sticky 对于 position: static or relative 且 display 不为 none 的情况下, 会在当前元素后面插入宽高与元素相同的占位符，防止页面布局被破坏。

#### Sticky.fixed(el)

- `el` {String|HTMLElement} 
	
    设置fixed的目标元素，元素的 top 和 left 需在 CSS 中自行设置
 
## 方法说明 

- `refresh()`

   刷新元素位置，在页面内容高度发生变化时需要重新计算元素位置，即可调用此方法。
   
   注意：在基于底部跟随滚动时，在 window.resize 时需要重新计算位置。针对此问题，Sticky 在非IE浏览器中直接绑定了此方法，在 IE 下中由于 resize 会重复触发，造成浏览器假死，因此未做处理。

- `destroy()`

   销毁sticky对象，并重置元素位置。
