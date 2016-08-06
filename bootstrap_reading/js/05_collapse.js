/* ========================================================================
 * Bootstrap: collapse.js v3.3.5
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

// 折叠
+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================
  // collapse 插件类定义

  var Collapse = function (element, options) {
    // 折叠元素
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    // 触发元素，用于触发当前折叠元素发生折叠动画
    // 触发元素需要有属性 data-toggle="collapse" 且通过 href/data-target 指定了它所对应的折叠元素的 id
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    // 参数中指定了父
    if (this.options.parent) {
      // 调用原型方法 getParent
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    //
    if (this.options.toggle) this.toggle()
  }

  // 版本号
  Collapse.VERSION  = '3.3.5'

  // 过渡动画的时间
  Collapse.TRANSITION_DURATION = 350

  // 默认配置
  Collapse.DEFAULTS = {
    toggle: true  // 默认切换
  }

  // 原型方法 dimension
  Collapse.prototype.dimension = function () {
    // 判断折叠元素上有无 width 类样式
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  // 原型方法 show
  Collapse.prototype.show = function () {
    // 正在过渡或者元素上面有 .in 类样式了，直接返回
    // 折叠元素有 .in 类样式表明它已经展开了（已经 show 了）
    // .collapse.in { display:block }
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    // 定义一个事件对象 startEvent
    var startEvent = $.Event('show.bs.collapse')
    // 触发 show 事件
    this.$element.trigger(startEvent)
    // 可以阻止 show 事件来阻止 show 动画执行
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    //
    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  // 切换折叠元素的 show/hide 状态
  Collapse.prototype.toggle = function () {
    // .in 代表折叠元素是显示的
    // 显示的隐藏之，隐藏的显示之
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  // 原型方法 getParent
  // 配置里面指定了 parent
  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  // 原型方法 addAriaAndCollapsedClass
  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    // 折叠元素是否展开的标识
    var isOpen = $element.hasClass('in')
    // 告诉辅助工具当前折叠元素的展开状态
    $element.attr('aria-expanded', isOpen)
    // 触发元素
    $trigger
      // 触发元素上的样式相应作出改变（折叠元素 展开/闭合 了则相应 无/有 类样式 collapse）
      .toggleClass('collapsed', !isOpen)
      // 告诉辅助工具触发元素上触发了对应折叠元素的 展开/闭合 状态
      .attr('aria-expanded', isOpen)
  }

  // 原型方法 getTargetFromTrigger
  // 根据触发元素上的属性 data-target 或者 href 来确定其对应的折叠元素
  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    // 返回目标折叠元素
    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================
  // collapse 插件定义，即 collapse 的 js 函数用法

  function Plugin(option) {
    return this.each(function () {
      // 每个折叠元素
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  // 保存 $.fn 中可能已经存在了的 collapse 插件方法
  var old = $.fn.collapse

  // 将插件注册到 $.fn 中去
  $.fn.collapse             = Plugin
  // 通过 Constructor 属性暴露了其原始的构造函数
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================
  // 防冲突处理

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================
  // data-api 用法（纯 HTML）

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);
