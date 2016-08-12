/* ========================================================================
 * Bootstrap: affix.js v3.3.5
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

 // 附加导航
+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================
  // Affix 插件类定义

  var Affix = function (element, options) {
    // 配置项
    this.options = $.extend({}, Affix.DEFAULTS, options)

    // 在 target 对象上监控 scroll 和 click 事件
    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    // 默认调用一次, 初始化一下位置
    this.checkPosition()
  }
  // 版本号
  Affix.VERSION  = '3.3.5'

  // .affix { position: fixed; }
  Affix.RESET    = 'affix affix-top affix-bottom'

  // 默认配置
  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  // 原型方法 getState, 计算 affix 当前应该处于什么状态
  // 参数 scrollHeight : document 高度和 body 高度中的较大值作为滚动高度(文档高度)
  // 参数 height : 元素高度 this.$element.height()
  // 参数 offsetTop/offsetBottom : 传入的 offset 参数
  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    // 获取 target 元素相对滚动条顶部的偏移, 即滚动了多少
    var scrollTop    = this.$target.scrollTop()
    // 获取 element 元素在当前视口的相对偏移, 即 affix 元素的偏移
    var position     = this.$element.offset()
    // 取得 target 元素当前计算的高度值(px), $(window).height() 为浏览器当前窗口可视区域高度
    var targetHeight = this.$target.height()

    // affix 之前为 top 状态
		// 滚动高度小于定义的偏移高度, 表示 affix 处于随顶部一起滚动的状态
    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    // affix 之前为 bottom 状态
    if (this.affixed == 'bottom') {
      // 若 affix 元素的顶部已经跑到可视区域外面去了, 返回 bottom
			// affix 元素还留在可视区域内部则返回 false
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      // 设置的 offsetBottom 已经滚动进入了可视区域, 则返回 bottom
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    // 初始化情形 + 一般情形(affix 元素之前为 affix 状态)
		// 初始化调用的时候, initializing = true
    var initializing   = this.affixed == null
    // 初始化的时候使用 $target 的 scrollTop 和 height
		// 之后都使用元素 $element 的偏移位置和高度了
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    // 无论初始化调用还是一般调用
		// 顶部滚动的高度不大于设置的顶部临界值, affix 设为 top
    if (offsetTop != null && scrollTop <= offsetTop) return 'top'

    // 若为初始化调用(this.affixed == null 时), 底部 offsetBottom 进入可视区域即返回 bottom
		// 若为一般的调用(this.affixed == null 时), affix 元素顶部超过可视区域即返回 bottom
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  // 原型方法 getPinnedOffset, 获取 affix 元素在固定时(处于 affix 状态)距离可视区域顶端的距离
  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset

    // 只保留 affix 样式, 此时 affix 元素固定住了
    this.$element.removeClass(Affix.RESET).addClass('affix')

    // 获取匹配元素相对滚动条顶部的偏移
    var scrollTop = this.$target.scrollTop()

    // 获取匹配元素在当前视口的相对偏移
    var position  = this.$element.offset()

    // 只取垂直方向上的距离
    return (this.pinnedOffset = position.top - scrollTop)
  }

  // 原型方法 checkPositionWithEventLoop, click 事件时调用它来调整位置
  Affix.prototype.checkPositionWithEventLoop = function () {
    // 事件循环都处理完毕后, 才调用 checkPosition
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  // 重新计算位置的方法
  Affix.prototype.checkPosition = function () {
    // 元素不可见就算了
    if (!this.$element.is(':visible')) return

    // affix 元素高度
    var height       = this.$element.height()
    // 设置的 offset
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    // document 高度和 body 高度中的较大值作为滚动高度(文档高度)
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    // 修正参数
    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    // 计算 affix 元素当前应该处于什么状态
    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    // 只有计算出的 affix 和原来的状态不一致, 才进行相应的处理
    if (this.affixed != affix) {
      // 若 unpin 值非空(说明之前为 bottom, 这次为 affix), 清空 top 值
      if (this.unpin != null) this.$element.css('top', '')

      // 判断处于什么类型 affix-top/affix-bottom/affix
      // getState 函数返回 false , affixType 即为 "affix"
      var affixType = 'affix' + (affix ? '-' + affix : '')
      // 设置相应的事件对象
      var e         = $.Event(affixType + '.bs.affix')

      // 触发相应的 affix.bs.affix/affix-top.bs.affix/affix-bottom.bs.affix 事件
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      // 将最新的 affix 状态赋给 this.affixed
      this.affixed = affix
      // 获取固定定位元素的 offset
      // 若是底部定位, this.unpin 为 affix 元素在固定时(处于 affix 状态)距离可视区域顶端的距离
      // 其它定位, 则为 null , 在 getState 的时候不参与计算
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        // 移除所有样式
        .removeClass(Affix.RESET)
        // 添加对应样式
        .addClass(affixType)
        // 触发相应的 affixed.bs.affix/affixed-top.bs.affix/affixed-bottom.bs.affix 事件
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    // 若是 bottom 模式, 则重新设置元素 offset 里的 top 值
    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  // 插件
  function Plugin(option) {
    // 针对所有含有 [data-spy="affix"] 属性的元素
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      // 初始化实例
      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      // 方法调用
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    // 针对所有含有 [data-spy="affix"] 属性的元素
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      // 元素上属性 data-offset-bottom
      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      // 元素上属性 data-offset-top
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      // 插件调用, 传入参数 data
      Plugin.call($spy, data)
    })
  })

}(jQuery);
