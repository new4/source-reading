/* ========================================================================
 * Bootstrap: button.js v3.3.5
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

// 按钮
+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================
  // button 插件类定义

  // Button 类函数
  var Button = function (element, options) {
    this.$element  = $(element)
    // 扩展默认配置
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  // 版本号
  Button.VERSION  = '3.3.5'

  // 默认配置
  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  // 原型方法 setState
  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    // 获取元素上绑定的 data 数据
    var data = $el.data()

    state += 'Text'

    // 元素上没有定义 data-reset-text 属性，则给它一个值
    // 对于 input 元素取其值（ $el.val() ）
    // 其他情况，取内部文本（ $el.html() ）
    // 缓存按钮文本以便后面 $el.button("reset") 恢复
    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    // $.proxy 用于设置函数的作用域
    setTimeout($.proxy(function () {
      // 对于 $el.button("reset")，恢复按钮内部的文本
      $el[val](data[state] == null ? this.options[state] : data[state])

      // 对于 $el.button('loading') 的情况
      if (state == 'loadingText') {
        this.isLoading = true
        // 添加 .disabled 类样式
        // 属性 disabled 也设置为 disabled
        $el.addClass(d).attr(d, d)
      // 其它情况，而且按钮正处在 loading 状态中时
      } else if (this.isLoading) {
        // 取消按钮的 loading 状态
        this.isLoading = false
        // 移除按钮上的 disabled 状态
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  // 原型方法 toggle
  Button.prototype.toggle = function () {
    var changed = true
    // 寻找当前元素最近的含有属性 data-toggle="buttons" 的祖先元素
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    // 找到了
    if ($parent.length) {
      var $input = this.$element.find('input')
      // 对于 radio
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      // 对于 checkbox
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    // 没有找到
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================
  // button 的插件定义，即 button 的 js 函数用法

  function Plugin(option) {
    return this.each(function () {
      // 调用插件方法 button 的元素
      var $this   = $(this)
      // 获取元素上绑定的名为 bs.button 的数据（如果有的话）
      var data    = $this.data('bs.button')
      // 传入了一个对象，将它作为后续初始化的参数之一
      var options = typeof option == 'object' && option

      // 如果没有 data，则通过类函数 Button 生成一个实例并且绑定到元素上
      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      // 对于传入的参数为 'toggle'， 直接调用元素上绑定的原型方法 toggle
      if (option == 'toggle') data.toggle()
      // 其它情况均执行 setState 方法
      else if (option) data.setState(option)
    })
  }

  // 保存 $.fn 中可能已经存在了的 button 插件方法
  var old = $.fn.button

  // 将插件注册到 $.fn 中去
  $.fn.button             = Plugin
  // 通过 Constructor 属性暴露了其原始的构造函数 Button
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================
  // 防冲突处理

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============
  // data-api 用法（纯 HTML）

  // 事件代理
  $(document)
    // 针对具有属性 data-toggle 且其值得前缀为 button 的元素绑定 click 事件响应函数
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      // 触发 click 事件的元素
      var $btn = $(e.target)
      // 若没有 .btn 类样式（不是 button），则查找最近的含有 .btn 样式的祖先元素
      if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
      // 调用插件的 toggle 方法
      Plugin.call($btn, 'toggle')
      // 对于不是 radio 和 checkbox 的情形，阻止默认行为
      if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]'))) e.preventDefault()
    })
    // 针对具有属性 data-toggle 且其值得前缀为 button 的元素绑定 focus 和 blur 事件响应函数
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      // 添加/移除 .focus 类样式
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);
