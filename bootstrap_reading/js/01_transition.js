/* ========================================================================
 * Bootstrap: transition.js v3.3.5
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

// 将浏览器是否支持动画过渡效果的标记赋予 $.support 的 transition 属性
// $.support 是一组用于展示不同浏览器各自特性和 bug 的属性集合，它通过特性检测来实现，而不是用任何浏览器检测
// 其它插件在使用的时候可以直接从 $.support.transition 中获取相应的值
+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

	// 浏览器支持过渡动画的特性检测，返回包含有各浏览器对应的过渡结束事件的对象
	function transitionEnd() {
		// 创建一个元素用于测试
		var el = document.createElement('bootstrap')

		// 针对各浏览器定义一个过渡结束的事件集
    // transitionend 事件会在 CSS 完成过渡后触发
    // 如果过渡在完成前移除，例如 CSS transition-property 属性被移除，过渡事件将不被触发
		var transEndEventNames = {
			WebkitTransition : 'webkitTransitionEnd',             // webkit 浏览器事件
			MozTransition    : 'transitionend',                   // mozilla 浏览器事件
			OTransition      : 'oTransitionEnd otransitionend',   // opera 浏览器事件
			transition       : 'transitionend'                    // 其它浏览器事件
		}

		// 判断方法：根据浏览器支持 CSS 过渡的属性名称返回一个对象 {end ：事件名称}
		for (var name in transEndEventNames) {
			// 特性 style 用于通过CSS 为元素指定样式
      // 在通过 getAttribute() 访问它时，返回的 style 特性值中包含的是 CSS 文本,
      // 而通过属性来访问它则会返回一个对象
			if (el.style[name] !== undefined) {
				return { end: transEndEventNames[name] }
			}
		}

		return false // explicit for ie8 (  ._.)
	}

	// http://blog.alexmaccaw.com/css-transitions
	$.fn.emulateTransitionEnd = function (duration) {
		var called = false    // 过渡结束的事件是否已经触发的标识
		var $el = this

		// 绑定事件 bsTransitionEnd ，过渡结束事件触发后修改触发的标识
		// 使用 one 避免事件多次执行
		$(this).one('bsTransitionEnd', function () { called = true })

		// 一段时间后，若事件未发生，则强制在该元素上触发这个事件
		// 确保过渡之后一定会执行回调函数
		var callback = function () {
			if (!called)
				$($el).trigger($.support.transition.end)
		}
		setTimeout(callback, duration)
		return this
	}

	// 以下部分代码在文件加载后即执行
	$(function () {
		// 检测特性，全局赋值，$.support.transition = { end ：事件名称 }
		$.support.transition = transitionEnd()

		// 不支持过渡的结束事件
		if (!$.support.transition) return

		// 在 jQuery 中注册一个事件, 事件名称定义为 bsTransitionEnd
		$.event.special.bsTransitionEnd = {
			bindType     : $.support.transition.end,
			delegateType : $.support.transition.end,
			handle       : function (e) {
                      if ($(e.target).is(this))
                        // 执行事件处理对象 handleObj 上注册的处理函数 handler
                        return e.handleObj.handler.apply(this, arguments)
                    }
		}
	})

}(jQuery);
