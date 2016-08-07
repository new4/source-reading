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
    // 正在过渡的标识
    this.transitioning = null

    // 参数中指定了父的选择器
    if (this.options.parent) {
      // 调用原型方法 getParent
      this.$parent = this.getParent()
    } else {
      // 添加辅助工具上的类样式
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    // 执行 toggle 函数
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
    // 没有 width 样式，则操作 height 来 显示/隐藏 元素
    return hasWidth ? 'width' : 'height'
  }

  // 原型方法 show ，显示折叠元素
  Collapse.prototype.show = function () {
    // 正在过渡或者元素上面有 .in 类样式了，直接返回
    // 折叠元素有 .in 类样式表明它已经展开了（已经 show 了）
    // .collapse.in { display:block }
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    // 已经展开的项或者正在展开的项都属于 active 的范围
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      // 获取已经展开的元素上绑定的折叠对象实例
      activesData = actives.data('bs.collapse')
      // 正在过渡动画，返回
      if (activesData && activesData.transitioning) return
    }

    // 定义一个事件对象 startEvent
    var startEvent = $.Event('show.bs.collapse')
    // 折叠元素展开之前触发 show 事件
    this.$element.trigger(startEvent)
    // 可以通过阻止 show 事件来阻止展开
    if (startEvent.isDefaultPrevented()) return

    // 收起已经展开的元素
    if (actives && actives.length) {
      // 调用原型方法 hide 收起
      Plugin.call(actives, 'hide')
      // 移除已经展开元素上绑定的折叠对象实例
      activesData || actives.data('bs.collapse', null)
    }

    // 获取操作元素的维度（规定了在 width/height 维度上 显示/隐藏 元素）
    var dimension = this.dimension()

    // 折叠元素
    this.$element
      // 移除样式 .collapse { display: none }
      .removeClass('collapse')
      // 新添加样式 .collapsing , 过渡样式的起点
      .addClass('collapsing')[dimension](0)
      // 告诉辅助工具折叠元素展开了
      .attr('aria-expanded', true)

    // 触发器元素
    this.$trigger
      // 移除 .collapsed 类样式
      .removeClass('collapsed')
      // 告诉辅助工具触发器元素触发（让折叠元素展开）了
      .attr('aria-expanded', true)

    // 正在过渡
    this.transitioning = 1

    // 定义过渡动画结束后执行的完成函数
    var complete = function () {
      // 过渡元素
      this.$element
        // 移除类样式 .collapsing
        .removeClass('collapsing')
        // 添加样式 .collapse.in ， 此时元素显示
        .addClass('collapse in')[dimension]('')
      // 过渡结束状态
      this.transitioning = 0
      // 折叠元素显示后触发 shown 事件
      this.$element
        .trigger('shown.bs.collapse')
    }

    // 浏览器不支持过渡动画，直接调用完成函数 complete
    if (!$.support.transition) return complete.call(this)

    // scrollHeight/scrollWidth
    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    // 折叠元素
    this.$element
      // 绑定过渡结束事件，执行收尾的一些工作
      .one('bsTransitionEnd', $.proxy(complete, this))
      // 保证过渡结束事件触发，会设置折叠元素的 height/width
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  // 原型方法 hide , 隐藏折叠元素
  Collapse.prototype.hide = function () {
    // 正在过渡或者元素上面没有 .in 类样式，直接返回
    // 没有 .in 类样式表明当前折叠元素没有处于展开状态
    if (this.transitioning || !this.$element.hasClass('in')) return

    // 自定义事件对象 startEvent
    var startEvent = $.Event('hide.bs.collapse')
    // 折叠元素隐藏之前触发 hide 事件
    this.$element.trigger(startEvent)
    // 提供了阻止 hide 发生的选择
    if (startEvent.isDefaultPrevented()) return

    // 显示/隐藏 的维度
    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    // 折叠元素
    this.$element
      // 添加类 .collapsing , 过渡的起点
      .addClass('collapsing')
      // 移除样式 .collaps.in{ display: block }
      .removeClass('collapse in')
      // 告诉辅助工具折叠元素没有展开
      .attr('aria-expanded', false)

    // 触发器元素
    this.$trigger
      // 添加样式 .collapsed 表明其对应的折叠元素处于折叠状态
      .addClass('collapsed')
      // 更新与辅助工具相关的状态
      .attr('aria-expanded', false)

    // 开始过渡动画的标识
    this.transitioning = 1

    // 过渡动画结束后收尾函数
    var complete = function () {
      // 结束过渡动画的标识
      this.transitioning = 0

      // 过渡元素
      this.$element
        // 移除类样式 .collapsing
        .removeClass('collapsing')
        // 重新添加样式 collapse , 此时没有样式 .in 了
        .addClass('collapse')
        // 在元素隐藏后触发事件 hidden
        .trigger('hidden.bs.collapse')
    }

    // 若浏览器不支持过渡动画， 直接调用 complete 函数
    if (!$.support.transition) return complete.call(this)

    // 支持过渡动画的情况
    // 过渡元素
    this.$element
      // height/width 变成 0
      [dimension](0)
      // 监听过渡结束事件，执行函数 complete 函数进行收尾
      .one('bsTransitionEnd', $.proxy(complete, this))
      // 保证一定会执行函数 complete
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  // 切换折叠元素的 show/hide 状态
  Collapse.prototype.toggle = function () {
    // .in 代表折叠元素是显示的
    // 显示的隐藏之，隐藏的显示之
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  // 原型方法 getParent
  // 配置里面指定了 parent 对象的选择器
  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        // 设置一些与状态有关的类样式
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      // 最后返回的还是父元素对象
      .end()
  }

  // 原型方法 addAriaAndCollapsedClass ，设置 触发元素/折叠元素 上与辅助工具有关的类样式
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

      // 折叠元素上没有绑定 collapse 的实例，则初始化一个并绑定
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      // 调用实例上的原型方法
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

  //监听有属性 data-toggle="collapse" 的元素（触发器）上的点击事件
  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {

    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()
    // 获取触发器上指定的折叠元素
    var $target = getTargetFromTrigger($this)
    // 获取折叠元素上绑定的折叠实例对象
    var data    = $target.data('bs.collapse')
    // 有绑定实例，则切换折叠元素的 显示/隐藏 状态
    // 否则传入触发器元素上定义的 data-* 数据对象
    var option  = data ? 'toggle' : $this.data()

    // 调用插件
    Plugin.call($target, option)
  })

}(jQuery);
