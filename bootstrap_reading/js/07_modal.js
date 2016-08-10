/* ========================================================================
 * Bootstrap: modal.js v3.3.5
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

// 模态框
+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================
  // Modal 模态框的类定义

  var Modal = function (element, options) {
    this.options             = options
    // 缓存 document.body
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    // 若设置了 remote ，就加载 remote 所指定 url 的内容到 modal-content 样式的元素内
		// 同时，触发 loaded.bs.modal 事件
    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  // 版本号
  Modal.VERSION  = '3.3.5'
  // 过渡间隔
  Modal.TRANSITION_DURATION = 300
  // 背景的过渡间隔
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,   // 默认单击弹窗以外的地方时自动关闭弹窗
    keyboard: true,   // 默认按 ESC 时关闭弹窗
    show: true        // 单击触发元素时打开弹窗
  }

  // 原型方法 toggle , 切换弹窗的显示状态
  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  // 原型方法 show , 显示模态框
  // _relatedTarget 为模态弹窗关联的元素对象，点击它来触发弹窗（按钮啊什么的）
  // _relatedTarget 为 HTML DOM 对象
  Modal.prototype.show = function (_relatedTarget) {
    // 当前 modal 对象
    var that = this
    // 自定义事件 show
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    // 在弹窗显示之前触发事件 show
    this.$element.trigger(e)

    // 弹窗已经打开了，或者外部通过阻止 show 事件，直接返回不作处理
    if (this.isShown || e.isDefaultPrevented()) return

    // 设置弹窗打开的标识
    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    // 设置 esc 按键是否关闭弹窗
    this.escape()
    this.resize()

    // 弹窗元素监听其内部子元素（ 有属性 data-dismiss="modal" 的元素 ）上的 click 事件，执行关闭弹窗的函数 hide
    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    //
    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    // 添加背景
    this.backdrop(function () {
      // 浏览器支持过渡动画且弹窗上面有类样式 .fade
      var transition = $.support.transition && that.$element.hasClass('fade')

      //
      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        // 显示弹窗
        .show()
        .scrollTop(0)

      that.adjustDialog()

      // 若支持动画，强制刷新 UI 现场，重绘弹窗
      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      // 给弹窗添加类样式 .in
      // .fade.in { opacity: 1; }
      that.$element.addClass('in')

      // 确保打开的弹窗获得焦点状态
      that.enforceFocus()

      // 自定义事件 shown , 用于在弹窗显示之后触发
      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      // 若支持动画，则在动画结束后给弹窗内的元素设置焦点并触发弹窗显示后事件 shown
      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          // 确保触发过渡结束事件
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  // 原型方法 hide , 隐藏模态框
  Modal.prototype.hide = function (e) {
    // 阻止默认行为
    if (e) e.preventDefault()

    // 自定义事件对象 hide
    e = $.Event('hide.bs.modal')
    // 弹窗隐藏之前触发事件 hide
    this.$element.trigger(e)

    // 若弹窗是隐藏的或者阻止了弹窗的隐藏，之间返回
    if (!this.isShown || e.isDefaultPrevented()) return

    // 设置弹窗的显示标识为 false
    this.isShown = false

    this.escape()
    this.resize()

    // 解绑定弹窗上的 focusin 事件
    // 当元素（或在其内的任意元素）获得焦点时发生 focusin 事件。
    $(document).off('focusin.bs.modal')

    // 弹窗元素
    this.$element
      // 移除样式 .in , 移除后 opacity=0
      .removeClass('in')
      // 解绑定 click 事件
      .off('click.dismiss.bs.modal')
      // 解绑定 mouseup 事件
      .off('mouseup.dismiss.bs.modal')

    // 弹窗的主体部分解绑定 mousedown 事件
    this.$dialog.off('mousedown.dismiss.bs.modal')

    // 浏览器支持过渡动画且弹窗上有类样式 .fade
    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        // 过渡动画结束后执行 hideModal 函数
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        // 确保会触发过渡结束事件
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      // 否则，直接执行 hideModal 关闭弹窗
      this.hideModal()
  }

  // 原型方法 enforceFocus , 确保当前打开的弹窗处于焦点状态
  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      // 当元素（或在其内的任意元素）获得焦点时发生 focusin 事件
      .on('focusin.bs.modal', $.proxy(function (e) {
        // 若触发焦点的元素不是当前元素或者不包含当前元素，则强制给当前元素设置焦点
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          // 在弹窗元素上触发 focus 事件
          this.$element.trigger('focus')
        }
      }, this))
  }

  // 原型方法 escape , 按 ESC 键，弹窗是否退出的处理
  Modal.prototype.escape = function () {
    // 弹窗处于显示状态且配置中允许按键
    if (this.isShown && this.options.keyboard) {
      // 弹窗绑定 keydown 事件
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        // 当按键是 ESC 时执行 hide 函数隐藏弹窗
        e.which == 27 && this.hide()
      }, this))
    // 否则，若弹窗处于隐藏状态
    } else if (!this.isShown) {
      // 解绑定弹窗上的 keydown 事件
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  // 原型方法 resize , 处理 resize 事件
  Modal.prototype.resize = function () {
    // 弹窗处于显示状态
    if (this.isShown) {
      // 绑定 resize 事件，执行 handleUpdate 函数
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    // 弹窗处于隐藏状态
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  // 原型方法 hideModal , 在方法 hide 中调用
  Modal.prototype.hideModal = function () {
    var that = this
    // jQuery 方法，隐藏元素
    this.$element.hide()
    // 背景设置
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      // 弹窗隐藏之后触发 hidden 事件
      that.$element.trigger('hidden.bs.modal')
    })
  }

  // 原型方法 removeBackdrop
  Modal.prototype.removeBackdrop = function () {
    // 若有背景，删除背景元素
    this.$backdrop && this.$backdrop.remove()
    // 取消对背景元素的引用
    this.$backdrop = null
  }

  // 原型方法 backdrop ，添加背景，打开弹窗时触发
  Modal.prototype.backdrop = function (callback) {
    var that = this
    // 是否设置了动画过渡效果（fade），是则将 animate 设置为 fade
    // .fade 定义的是过渡的规则
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    // 当前弹窗显示了且规定需要一个背景
    if (this.isShown && this.options.backdrop) {
      // 支持过渡动画，则定义动画标识
      var doAnimate = $.support.transition && animate

      // $backdrop 为 modal 下面的背景对象
      // 在 body 元素上定义背景的 div 元素，并且给背景附加 animate 标识以支持动画
      this.$backdrop = $(document.createElement('div'))
        // 与 opacity 属性有关
        .addClass('modal-backdrop ' + animate)
        // 附加到 body 上
        .appendTo(this.$body)

      // 弹窗绑定 click 事件
      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        // 若规定了忽略点击背景关闭弹窗
        if (this.ignoreBackdropClick) {
          // 改变 ignoreBackdropClick 标识的值
          this.ignoreBackdropClick = false
          return
        }

        // e.currentTarget : 在事件冒泡阶段中的当前DOM元素  即 this
        // e.target : 最初触发事件的DOM元素
        // 通常用于比较 event.target 和 this 来确定事件是不是由于冒泡而触发的
        // 若弹窗上的 click 事件是由于冒泡而触发的，则返回
        if (e.target !== e.currentTarget) return

        // 若 backdrop 设置为 static 时
        this.options.backdrop == 'static'
          // 单击背景时，弹窗获得焦点，不关闭弹窗
          ? this.$element[0].focus()
          // 否则，关闭弹窗
          : this.hide()
      }, this))

      // 若支持动画，强制刷新 UI 现场，重绘弹窗
      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      // 背景添加 .in 样式
      this.$backdrop.addClass('in')

      // 无回调函数，直接返回
      if (!callback) return

      // 若支持动画，则动画结束后执行回调函数；否则直接执行回调函数
      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    // 若弹窗已经关闭，但是背景对象依旧存在
    } else if (!this.isShown && this.$backdrop) {
      // 移除背景上的 .in 类样式
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        // 删除背景
        that.removeBackdrop()
        // 执行回调
        callback && callback()
      }

      // 若支持动画且弹窗元素有样式 fade ，则动画结束后执行函数；否则直接执行函数 callbackRemove
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals
  // 以下方法用于处理内容溢出的弹窗

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================
  // modal 的插件定义，即 modal 的 js 函数用法

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      // 弹窗元素对象
      var $this   = $(this)
      // 弹窗元素对象上绑定的弹窗实例
      var data    = $this.data('bs.modal')
      // 参数
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      // 没有弹窗实例，自己初始化一个并绑定到弹窗元素对象上
      // Modal(this, options) 中的 this 是 HTML DOM 对象（模态弹窗本身）
      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))

      // 若参数 option 是一个 string, 则调用插件中对应的方法
      if (typeof option == 'string') data[option](_relatedTarget)
      // 否则，对规定了 show 参数的调用 show 方法显示弹窗
      else if (options.show) data.show(_relatedTarget)
    })
  }

  // 保存 $.fn 中可能已经存在了的 modal 插件方法
  var old = $.fn.modal

  // 将插件注册到 $.fn 中去
  $.fn.modal             = Plugin
  // 通过 Constructor 属性暴露了其原始的构造函数
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================
  // 防冲突处理

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============
  // data-api 用法（纯 HTML）

  // 给标签中含有 属性 data-toggle="modal" 的元素绑定 click 事件
  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    // $this 为触发 click 事件的元素（点一下会蹦出 modal 的元素 -- 按钮啊什么的）
    var $this   = $(this)
    var href    = $this.attr('href')

    // 优先级：data-target > href ; data-target 属性与 data-toggle 属性属于同一个标签元素
    //  $target 为弹窗元素（模态弹窗本身），由 data-target 指定它的选择符，由 $(选择符) 来选择模态弹窗本身（最外层的 div）
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7

    // 若弹窗元素上已经有该弹窗实例（即已经弹出过一次），则设置 option 值为 toggle
    // 否则，将【 remote 值、弹窗元素上自定义属性集合、触发元素上的自定义属性集合 】合并为 option 对象
    // $this.data() 指 $this 元素中以 "data-" 为前缀的属性名值对，例如：data-target="#myModal" 解析成 'target':'#myModal'
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    // 若元素是 <a> 标签，则取消它的默认行为（链接跳转行为）
    if ($this.is('a')) e.preventDefault()

    // 模态弹窗绑定 show 事件，在 Modal.prototype.show 方法调用时触发，此时弹窗尚未显示
    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })

    // $target 为 Plugin 函数中的 this
    Plugin.call($target, option, this)
  })

}(jQuery);
