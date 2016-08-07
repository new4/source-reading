/* ========================================================================
 * Bootstrap: dropdown.js v3.3.5
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

// 下拉菜单
+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  // 弹出下拉菜单时的背景样式
  var backdrop = '.dropdown-backdrop'

  // 下拉菜单的触发元素
  var toggle   = '[data-toggle="dropdown"]'

  // 下拉菜单 Dropdown 的类定义
  var Dropdown = function (element) {
    // 绑定 click 事件， 执行切换 展开/收起 的操作
    $(element).on('click.bs.dropdown', this.toggle)
  }

  // 版本号
  Dropdown.VERSION = '3.3.5'

  // 获取下拉菜单的父元素容器
  function getParent($this) {
    // 元素上有 data-target 属性来指定目标
    var selector = $this.attr('data-target')

    // 没有 data-target 属性，则看有没有 href 属性
    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    // 获取目标对象
    var $parent = selector && $(selector)

    // 若没有 data-target/href 则使用当前触发元素的父元素
    return $parent && $parent.length ? $parent : $this.parent()
  }

  // 关闭所有的下拉菜单
  function clearMenus(e) {
    // 鼠标右键不予处理
    if (e && e.which === 3) return

    $(backdrop).remove()

    // 遍历每一个触发元素
    $(toggle).each(function () {
      // 触发元素
      var $this         = $(this)
      // 父容器
      var $parent       = getParent($this)
      // 设置触发元素为事件中的相关元素
      var relatedTarget = { relatedTarget: this }

      // 对应的下拉菜单处于关闭状态，直接返回
      if (!$parent.hasClass('open')) return

      // 忽略文本输入框上的 click 事件
      if (e &&
          e.type == 'click' &&
          /input|textarea/i.test(e.target.tagName) &&
          $.contains($parent[0], e.target)) return

      // 菜单收起前触发 hide 事件
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      // 提供阻止 hide 的方法
      if (e.isDefaultPrevented()) return

      // 告诉辅助工具当前下拉菜单处于收起状态
      $this.attr('aria-expanded', 'false')
      // 父容器移除 .open 样式
      // 菜单收起后触发 hidden 事件，传入参数 relatedTarget
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  // 原型方法 toggle , 切换下拉菜单的 展开/收起 操作
  Dropdown.prototype.toggle = function (e) {

    var $this = $(this)

    // 触发元素上面有禁用的标识就不予处理
    if ($this.is('.disabled, :disabled')) return

    // 获取父容器
    var $parent  = getParent($this)
    // 当前元素是否处于展开状态的标识
    var isActive = $parent.hasClass('open')

    // 收起所有的展开菜单
    clearMenus()

    // 当前菜单不是展开的，下面进行展开
    // 否则，表明菜单之前是展开的，上一步执行 clearmenu 的时候已经将它闭合了
    if (!isActive) {
      // 移动端的处理
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      // 在菜单展开前先触发 show 事件
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))
      // 可以监听 show 事件来阻止展开
      if (e.isDefaultPrevented()) return

      // 获取焦点
      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }

    return false
  }

  // 原型方法 keydown
  Dropdown.prototype.keydown = function (e) {
    // 若键盘按键不是 up arrow(38) down arrow(40) esc(27) spacebar(32) 这四者
    if (!/(38|40|27|32)/.test(e.which) ||
    // 或者是文本输入框 input/textarea 上的键盘按键事件，直接返回不予处理
        /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)
    // 阻止默认行为
    e.preventDefault()
    // 阻止冒泡
    e.stopPropagation()

    // 元素上有禁用标识，直接返回
    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    // 下拉菜单是否展开的标识
    var isActive = $parent.hasClass('open')

    // 下拉菜单没有展开且不是 esc 退出（展开的时候按 esc 会导致菜单收起）
    // 或者, 下拉菜单展开了且按键是 esc
    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      //
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0       // 异常

    // 第 index 个下拉菜单项获得焦点
    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================
  // dropdown 的插件定义，即 dropdown 的 js 函数用法

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      // 获取元素上绑定的实例
      var data  = $this.data('bs.dropdown')
      // 没有实例就自己实例化一个兵进行绑定
      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      // 传入的参数是字符串的话就调用同名的原型方法
      if (typeof option == 'string') data[option].call($this)
    })
  }

  // 保存 $.fn 中可能已经存在了的 dropdown 插件方法
  var old = $.fn.dropdown

  // 将插件注册到 $.fn 中去
  $.fn.dropdown             = Plugin
  // 通过 Constructor 属性暴露了其原始的构造函数
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================
  // 防冲突处理

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================
  // data-api 用法（纯 HTML）

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);
