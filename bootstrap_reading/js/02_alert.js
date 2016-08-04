/* ========================================================================
 * Bootstrap: alert.js v3.3.5
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

 // 警告框插件就是在警告框组件的基础上，提供单击 'X' 号关闭警告框的功能
 // <div class="alert alert-warning fade in">
 //   <button data-dismiss="alert" class="close" type="button">&times;</button>
 //   <h4>警告标题</h4>
 //   <p>Change this and have a try again</p>
 // </div>

+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================
  // alert 插件类定义

  var dismiss = '[data-dismiss="alert"]'
  // Alert 类函数
  // 传入元素 el ,若元素内有自定义属性 data-dismiss="alert" ，则 click 事件触发原型上的 close 方法
  var Alert = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  // 版本号
  Alert.VERSION = '3.3.5'

  // 过渡动画的时间 150ms
  Alert.TRANSITION_DURATION = 150

  // 定义 Alert 类函数的原型方法 close
  Alert.prototype.close = function (e) {
    // 被单击的元素
    var $this    = $(this)
    // 取元素上属性 data-target 的值
    var selector = $this.attr('data-target')

    // 若元素上没有定义属性 data-target
    if (!selector) {
      // 再看看上面有没有定义属性 href
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    // 获取 data-target 或者 href 所指向的元素
    // 通常这个元素即是期望被关闭的元素
    var $parent = $(selector)

    // 阻止默认事件
    if (e) e.preventDefault()

    // 如果上面没有成功获取想关闭的对象 $parent
    if (!$parent.length) {
      // 寻找元素 $this 的最近的含有 .alert 类的祖先元素
      // 将这个祖先元素作为要被关闭的对象
      $parent = $this.closest('.alert')
    }

    // 在元素 $parent 上面触发事件 close.bs.alert
    // 这个事件是关闭之前触发
    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    // 移除类 .in
    // $parent 元素上的样式 opacity 值从 1 --> 0，表明警告框逐渐消失
    $parent.removeClass('in')

    // 在触发 closed 事件之后再删除 $parent 元素
    // ---
    // detach() 从DOM中删除所有匹配的元素
    // 这个方法不会把匹配的元素从jQuery对象中删除，因而可以在将来再使用这些匹配的元素。
    // 与remove()不同的是，所有绑定的事件、附加的数据等都会保留下来。
    // ---
    // remove 这个方法不会把匹配的元素从jQuery对象中删除，因而可以在将来再使用这些匹配的元素。
    // 但除了这个元素本身得以保留之外，其他的比如绑定的事件，附加的数据等都会被移除。
    function removeElement() {
      // detach from parent, fire event then clean up data
      // closed 事件是在警告框关闭之后触发
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    // 若浏览器支持过渡动画且被关闭的元素上面有样式类 .fade
    $.support.transition && $parent.hasClass('fade') ?
      $parent
        // 则在过渡结束后执行 removeElement 回调
        .one('bsTransitionEnd', removeElement)
        // 确保会触发过渡结束事件，从而保证会调用 removeElement
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      // 否则，直接删除 $parent 元素
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================
  // alert 的插件定义，即 alert 的 js 函数用法

  function Plugin(option) {
    return this.each(function () {
      // 调用插件 alert 的元素
      var $this = $(this)
      // 获取元素上绑定的名为 bs.alert 的数据（如果有的话）
      var data  = $this.data('bs.alert')

      // 如果没有 data，则通过类函数 Alert 生成一个实例并且绑定到元素上
      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      // 如果调用元素的 alert 方法时传入了一个字符串作为参数，
      // 那么到 Alert 类实例上去找同名的原型方法并执行。
      if (typeof option == 'string') data[option].call($this)
    })
  }

  // 保存 $.fn 中可能已经存在了的 alert 插件方法
  var old = $.fn.alert

  // 将插件注册到 $.fn 中去
  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================
  // 防冲突处理

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============
  // HTML 用法

  // 事件代理
  // 为声明式的元素（含有自定义属性 data-dismiss="alert" 的元素）绑定 click 事件
  // 会调用原型方法 close
  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);
