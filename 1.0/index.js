/**
 * @fileoverview 
 * @author 函谷<hangu.mh@taobao.com>
 * @module sticky
 **/
KISSY.add(function (S, UA, Node, Base) {
	'use strict';
	
	var $ = Node.all,
		doc = $(document),
		stickyPrefix = ['-webkit-', '-ms-', '-o-', '-moz-', ''],
		guid = 0,
		
	    isIE = (UA.ie > 0),
	    isIE6 = (UA.ie == 6);
	    	
	/**
	 * 
	 * @class Sticky
	 * @constructor
	 * @extends Base
	 */
	function Sticky(comConfig) {
	    //调用父类构造函数
	    Sticky.superclass.constructor.call(this, comConfig);
	    this.initializer();
	}
	
	S.extend(Sticky, Base, /** @lends Sticky.prototype*/{
		/**
		 * 初始化
		 */
		initializer: function() {
			var top = this.get('top'),
				bottom = this.get('bottom');
			
			// 没有设置值，返回
			if (top == null && bottom == null) {
				return;
			}
			if (top != null) {
				this._stickyType = 'top';         // sticky类型：top
			} else if (bottom != null) {
				this._stickyType = 'bottom';      // sticky类型：bottom
			}
			
	        this._stickyId = guid ++;
	        this.render();
	        return this;
		},
		/**
		 * 销毁
		 */
		destory: function() {
	        this._restore();
	        this.get('el').data('bind-sticked', false);
	        $(window).detach('scroll.' + this._stickyId);
	        $(window).detach('resize.' + this._stickyId);
	        return this;
		},
		/**
		 * 刷新
		 */
		refresh: function() {
			this.destory().render();
	        return this;
		},
		/**
		 * 实现滚动效果
		 */
		render: function() {
			var el = this.get('el'),
				top = this.get('top');
	
	        // 一个元素只允许绑定一次
	        if (!el.length || el.data('bind-sticked')) {
	            return;
	        }
	
	        // 记录元素原来的位置
	        var originTop = this._originTop = el.offset().top;
	
	        var callFix = false;
	        // 表示需要 fixed，不能用 position:sticky 来实现
	        if (top === Number.MAX_VALUE) {
	            callFix = true;    // 表示调用了 sticky.fix
	            this._stickyType == 'top';       // fixed 只能基于顶部定位
	            this.set('top', top = originTop);
	        }
	        
	        // 基于底部定位，不能用 position:sticky 来实现
	        if (this._stickyType == 'bottom') {
	        	callFix = true;
	        }
	
	        var originStyles = this._originStyles = {
	            position: null,
	            top: null,
	            left: null
	        };
	
	        // 保存原有的样式
	        for (var style in originStyles) {
	            if (originStyles.hasOwnProperty(style)) {
	                this._originStyles[style] = el.css(style);
	            }
	        }
	
	        var scrollFn;
	        // sticky.fix 无法用 sticky 方式来实现； bottom 无法用sticky实现
	        if (this.isPositionStickySupported() && ! callFix) {
	            scrollFn = this._supportSticky;
	
	            // 直接设置 sticky 的样式属性
	            var tmp = '';
	            for (var i = 0; i < stickyPrefix.length; i++) {
	                tmp += 'position:' + stickyPrefix[i] + 'sticky;';
	            }
	            el[0].style.cssText += tmp + 'top: ' + top + 'px;';
	        } else if (this.isPositionFixedSupported()) {
	            scrollFn = this._supportFixed;            
	        } else {
	            scrollFn = this._supportAbsolute;   // ie6
	            // avoid floatImage Shake for IE6
	            // see: https://github.com/lifesinger/lifesinger.
	            //      github.com/blob/master/lab/2009/ie6sticked_position_v4.html
	            $('<style type="text/css"> * html' +
	              '{ background:url(null) no-repeat fixed; } </style>').appendTo('head');
	        }
	
	        // 先运行一次
	        scrollFn.call(this);
	
	        // 监听滚动事件
	        var self = this;
	        $(window).on('scroll.' + this._stickyId, function () {
	        	// 元素不可见不处理
	        	if (! el[0].style.display === 'none' || el[0].style.visibility === 'hidden') {
	                return;
	            }
	            scrollFn.call(self);
	        });
	        
	        // 监听resize事件，由于IE下window.resize会导致浏览器无限loop，造成假死，在IE下放弃刷新
	        if (! isIE && (this._stickyType == 'bottom')) {
	            $(window).on('resize.' + this._stickyId, function () {
	            	
	            	self.refresh();
	            });
	        }
	
	        // 标记已定位
	        el.data('bind-sticked', true);
	        return this;
		},
		
		// scroll handle
		/**
		 * position:absolute 处理
		 */
	    _supportAbsolute: function () {
	        // 计算元素距离当前窗口上方的距离
	        var el = this.get('el'),
	        	top = this.get('top'),
	        	bottom = this.get('bottom'),
	        	distance = this._originTop - doc.scrollTop();
	        
	        if (this._stickyType == 'top') {
	            // 当距离小于等于预设的值时
	            // 将元素设为 fixed 状态
	            if (distance <= top) {
	                // 状态变化只有一次
	                if (!el.data('sticked')) {
	                    this._addPlaceholder();
	                    el.data('sticked', true);
	                    this.get('callback').call(this, true);
	                }
	                el.css({
	                    position: 'absolute',
	                    top: top + doc.scrollTop()
	                });
	            } else if (el.data('sticked') && distance > top) {
	                this._restore();
	            }
	        } else if (this._stickyType == 'bottom') {
	        	var winHeight = S.DOM.viewportHeight(),
	    			_top = winHeight - bottom - el.height();
	        	// 当距离小于等于预设的值时
	            // 将元素设为 fixed 状态
	            if (distance >= _top) {
	                // 状态变化只有一次
	                if (!el.data('sticked')) {
	                    this._addPlaceholder();
	                    el.data('sticked', true);
	                    this.get('callback').call(this, true);
	                }
	                el.css({
	                    position: 'absolute',
	                    top: _top + doc.scrollTop()
	                });
	            } else if (el.data('sticked') && distance < _top) {
	                this._restore();
	            }
	        }
	    },
		/**
		 * position:fixed 处理
		 */
	    _supportFixed: function () {
	        // 计算元素距离当前窗口上方的距离
	        var el = this.get('el'),
	        	top = this.get('top'),
	        	bottom = this.get('bottom'),
	    	 	distance = this._originTop - doc.scrollTop();
	        
	        if (this._stickyType == 'top') {
	        	// 当距离小于等于预设的值时
	            // 将元素设为 fix 状态
	            if (!el.data('sticked') && distance <= top) {
	                this._addPlaceholder();
	
	                el.css({
	                    position: 'fixed',
	                    top: top,
	                    left: el.offset().left
	                });
	                el.data('sticked', true);
	                this.get('callback').call(this, true);
	            } else if (el.data('sticked') && distance > top) {
	                this._restore();
	            }
	        } else if (this._stickyType == 'bottom') {
	        	var winHeight = S.DOM.viewportHeight(),
	        		_top = winHeight - bottom - el.height();
	        	// 当距离大于等于预设的值时
	            // 将元素设为 fix 状态
	            if (!el.data('sticked') && distance >= _top) {
	                this._addPlaceholder();
	
	                el.css({
	                    position: 'fixed',
	                    top: _top,
	                    left: el.offset().left
	                });
	                el.data('sticked', true);
	                this.get('callback').call(this, true);
	            } else if (el.data('sticked') && distance < _top) {
	                this._restore();
	            }
	        }
	    },
	    /**
	     * position:sticky处理
	     */
	    _supportSticky: function () {        
	        // 由于 position:sticky 尚未提供接口判断状态
	        // 因此仍然要计算 distance 以便进行回调
	        var el = this.get('el'),
	        	top = this.get('top'),
	        	callback = this.get('callback'),
	        	distance = this._originTop - doc.scrollTop();
	
	        if (!el.data('sticked') && distance <= top) {
	            el.data('sticked', true);
	            callback.call(this, true);            
	        } else if (el.data('sticked') && distance > top) {
	            callback.call(this, false);    // 不需要恢复样式和去占位符
	        }
	    },
	    
	    // style handle
	    /**
	     * 恢复样式
	     */
	   	_restore: function () {
	        this._removePlaceholder();
	        
	        var el = this.get('el');
	
	        // 恢复原有的样式
	        el.css(this._originStyles);
	        
	        // 设置元素状态
	        el.data('sticked', false);
	    
	        this.get('callback').call(this, false);
	    },
	    /**
	     * 添加占位符
	     * 需要占位符的情况有: position: static or relative，除了 display 不是 block 的情况
	     */
	    _addPlaceholder: function() {
	        var need = false,
	        	el = this.get('el'),
	        	position = el.css('position');
	
	        if (position === 'static' || position === 'relative') {
	            need = true;
	        }
	        if (el.css('display') !== 'block') {
	            need = false;
	        }
	
	        if (need) {
	            // 添加占位符
	            this._placeholder = $('<div style="visibility:hidden;margin:0;padding:0;"></div>');
	            this._placeholder.width(el.outerWidth(true))
	                .height(el.outerHeight(true))
	                .css('float', el.css('float')).insertAfter(el);
	        }
	    },
	    _removePlaceholder: function() {
	        // 如果后面有占位符的话, 删除掉
	        this._placeholder && this._placeholder.remove();
	    },
	    
	    // helper
		/**
		 * 判断是否支持position:fixed
		 */
	    isPositionFixedSupported: function() {
	        return !isIE6;
	    },
		/**
		 * 判断是否支持position:sticky
		 */
	    isPositionStickySupported: function() {
	        if (isIE) return false;
	
	        var container = doc[0].body;
	
	        if (doc[0].createElement && container && container.appendChild && container.removeChild) {
	            var isSupported = false,
	                el = doc[0].createElement('div'),
	                getStyle = function (st) {
	                    if (window.getComputedStyle) {
	                        return window.getComputedStyle(el).getPropertyValue(st);
	                    } else {
	                        return el.currentStyle.getAttribute(st);
	                    }
	                };
	
	            container.appendChild(el);
	
	            for (var i = 0; i < stickyPrefix.length; i++) {
	                el.style.cssText = 'position:' + stickyPrefix[i] + 'sticky;visibility:hidden;';
	                if (isSupported = getStyle('position').indexOf('sticky') !== -1) break;
	            }
	
	            el.parentNode.removeChild(el);
	            return isSupported;
	        }
	    }
	}, {ATTRS : /** @lends Sticky*/{
		/**
		 * 定位元素
		 */
		el: {
			value: null,
			setter: function(el) {
				return $(el);
			}
		},
		/**
		 * 顶部定位
		 */
		top: {
			value: null,
			setter: function(v) {
				if (isNaN(v)) {
					return false;
				}
			}
		},
		/**
		 * 底部定位
		 */
		bottom: {
			value: null,
			setter: function(v) {
				if (isNaN(v)) {
					return false;
				}
			}
		},
		/**
		 * 回调
		 */
		callback: {
			value: function() {}
		}
	}});
	
	// sticky.fixed(el)
	Sticky.fixed =  function (el) {
	    return new Sticky({
	        el: el,
	        top: Number.MAX_VALUE // 无穷大的 top 即表示元素永远 fixed
	    });
	};
	
	return Sticky;

}, {requires:['ua', 'node', 'base']});