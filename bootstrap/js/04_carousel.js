/* ========================================================================
 * Bootstrap: carousel.js v3.3.5
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

// 轮播
+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================
  // carousel 插件类定义

  var Carousel = function (element, options) {
    this.$element    = $(element)
    // 查找指示符元素的集合
    this.$indicators = this.$element.find('.carousel-indicators')

    this.options     = options
    // 暂停标记
    this.paused      = null
    // 轮播标记
    this.sliding     = null
    // 轮播间隔循环的标记
    this.interval    = null
    // 当前活动的帧对象
    this.$active     = null
    // 所有轮播的帧集合
    this.$items      = null

    // 监听轮播元素上的 keydown 事件
    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    // 若设置的选项中规定了当鼠标悬停到轮播组件上时
    this.options.pause == 'hover' &&
    // 而且，不是在有触摸事件 ontouchstart 的移动端
    !('ontouchstart' in document.documentElement) &&
    // 在轮播组件上绑定鼠标的 mouseenter/mouseleave 事件的相应函数
    this.$element
      // 鼠标进入，执行原型对象方法 pause 进行暂停轮播
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      // 鼠标移出，执行原型对象方法 cycle 重新开启轮播
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  // 版本号
  Carousel.VERSION  = '3.3.5'

  // 过渡时间
  Carousel.TRANSITION_DURATION = 600

  // 默认配置
  Carousel.DEFAULTS = {
    interval: 5000,   // 默认轮播动画间隔时间 5s
    pause: 'hover',   // 默认鼠标移动到轮播上，轮播动画就停止播放
    wrap: true,       // 默认轮播支持循环
    keyboard: true    // 相应键盘按键事件
  }

  // 原型方法 keydown ，用来作为 keydown 事件的相应函数
  Carousel.prototype.keydown = function (e) {
    // 对文本输入框 input/textarea 中的按键事件不予理会
    if (/input|textarea/i.test(e.target.tagName)) return
    // e.which 获取键盘按键键码值比较好
    switch (e.which) {
      // 对于 "left arrow"，执行原型方法 prev
      case 37: this.prev(); break
      // 对于 "right arrow"，执行原型方法 next
      case 39: this.next(); break
      // 其它的按键不予理会
      default: return
    }

    // 阻止对 left/right arrow 按键事件的默认处理
    e.preventDefault()
  }

  // 原型方法 cycle ，开启轮播动画，轮播动画，默认从左到右进行轮播
  Carousel.prototype.cycle = function (e) {
    // 若没有传入 e ，将 paused 设为 false , 表示取消轮播的暂停
    e || (this.paused = false)

    // 清除轮播间隔循环的标记
    this.interval && clearInterval(this.interval)

    // 若选项中配置了轮播间隔时间
    this.options.interval
    // 而且，轮播不是处于暂停状态
      && !this.paused
    // 设置一个循环定时器不断播放轮播的下一帧
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  // 原型方法 getItemIndex, 获取轮播帧 item 的索引
  Carousel.prototype.getItemIndex = function (item) {
    // 更新下所有的轮播的帧
    // 含有 .item 类样式的元素是轮播的主体元素（帧）
    this.$items = item.parent().children('.item')
    // 没有找到 item 则返回当前正在轮播的元素的索引值
    return this.$items.index(item || this.$active)
  }

  // 原型方法 getItemForDirection , 获取当前帧在方向 direction 上的下一帧
  // direction 可以取 prev/next
  Carousel.prototype.getItemForDirection = function (direction, active) {
    // 获取当前正在轮播的帧的索引值
    var activeIndex = this.getItemIndex(active)
    // 判断是否需要进行循环播放
    // 当前轮播帧是第一个且即将播放它的上一帧; 或者，当前轮播帧是最后一个且即将播放它的下一帧
    // 此时处于边界条件，表示即将进行循环处理
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    // 需要循环时，但是选项中规定了不支持循环，直接返回当前正在显示的帧
    if (willWrap && !this.options.wrap) return active

    // 选项中规定了支持轮播循环
    // -1 表示下一次播放上一帧
    //  1 表示下一次播放下一帧
    var delta = direction == 'prev' ? -1 : 1
    // 取余，获得下一帧索引
    var itemIndex = (activeIndex + delta) % this.$items.length
    // 获取下一帧
    return this.$items.eq(itemIndex)
  }

  // 原型方法 to ， 直接指定轮播的帧
  Carousel.prototype.to = function (pos) {
    var that        = this
    // 获取当前帧的索引，同时会更新轮播对象的属性 $active
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    // 指定的 pos 超出了帧数目的边界，直接返回
    if (pos > (this.$items.length - 1) || pos < 0) return

    // 轮播正在进行的时候，绑定 slid 事件，在轮播结束后再执行 to 方法
    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    // 指定的帧就是当前帧，先执行 pause 方法再执行 cycle 方法
    if (activeIndex == pos) return this.pause().cycle()

    //
    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  // 原型方法 pause ， 停止轮播
  Carousel.prototype.pause = function (e) {
    // 没有 e 则设置轮播处于暂停状态
    e || (this.paused = true)

    // 若存在 .next/.prev 元素，而且浏览器支持过渡动画
    if (this.$element.find('.next, .prev').length && $.support.transition) {
      // 直接触发过渡结束事件
      this.$element.trigger($.support.transition.end)

      // 开始轮播下一帧
      this.cycle(true)
    }

    // 清除循环定时器
    this.interval = clearInterval(this.interval)
    // 返回 this 链式操作
    return this
  }

  // 原型方法 next , 播放下一帧
  Carousel.prototype.next = function () {
    // 正在轮播，直接返回
    if (this.sliding) return
    // 调用 slide, 传入参数 next
    return this.slide('next')
  }

  // 原型方法 prev
  Carousel.prototype.prev = function () {
    // 正在轮播，直接返回
    if (this.sliding) return
    // 调用 slide, 传入参数 prev
    return this.slide('prev')
  }

  // 原型方法 slide
  Carousel.prototype.slide = function (type, next) {
    // 当前帧元素
    var $active   = this.$element.find('.item.active')
    // 没有指定下一次播放的帧，则获取当前帧在某一方向（type 指定）上的下一帧
    var $next     = next || this.getItemForDirection(type, $active)
    // 正在轮播
    var isCycling = this.interval

    // 获取轮播的方向 left/right
    // left  表示下一帧滑动方向是向左
    // right 表示下一帧滑动方向是向右
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    // 下一帧即是当前帧 ， 轮播状态设置成 false
    if ($next.hasClass('active')) return (this.sliding = false)

    // 设置轮播触发的事件以及要暴露的参数
    var relatedTarget = $next[0]
    // 自定义事件对象 slideEvent
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    // 触发事件 slide
    this.$element.trigger(slideEvent)
    // 可以监听事件 slide 并阻止它
    if (slideEvent.isDefaultPrevented()) return

    // 标记轮播正在进行
    this.sliding = true

    // 若正在轮播则暂停
    isCycling && this.pause()

    // 若指定了指示符元素
    if (this.$indicators.length) {
      // 移除之前帧对应的指示符的 .active 状态
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      // 给将显示的帧对应的指示符添加高亮样式
      $nextIndicator && $nextIndicator.addClass('active')
    }

    // 自定义事件对象 slidEvent
    var slidEvent = $.Event('slid.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    }) // yes, "slid"

    // 支持过渡动画且设置了 slide 样式
    if ($.support.transition && this.$element.hasClass('slide')) {
      // 给要轮播的帧加上 type 类型的样式（如：next/prev）
      $next.addClass(type)
      // 强制刷新
      $next[0].offsetWidth // force reflow
      // 给帧添加样式 .left/.right
      // 当前帧向 direction 方向运动
      $active.addClass(direction)
      // 下一帧向 direction 方向运动
      $next.addClass(direction)

      $active
      // 当前帧监听过渡动画结束的事件
        .one('bsTransitionEnd', function () {
          // 下一帧的类样式设置成当前帧的样式
          $next.removeClass([type, direction].join(' ')).addClass('active')
          // 当前帧上面移除相应的类样式
          $active.removeClass(['active', direction].join(' '))
          // 标记轮播结束
          that.sliding = false
          // 触发轮播结束的事件 slid
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        // 确保会触发过渡结束事件
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      // 直接移除 .active 类样式，隐藏
      $active.removeClass('active')
      // 直接添加 .active 类样式，显示
      $next.addClass('active')
      // 标记轮播结束
      this.sliding = false
      // 触发轮播结束的事件 slid
      this.$element.trigger(slidEvent)
    }

    // 若正在轮播，重新开始（间隔后）自动执行
    isCycling && this.cycle()

    // 为了链式操作，this 指 data-ride = "carousel" 容器元素
    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================
  //  carousel 的插件定义，即 carousel 的 js 函数用法

  function Plugin(option) {
    return this.each(function () {
      // 调用插件 carousel 的元素
      var $this   = $(this)
      // 插件上绑定的 bs.carousel 数据
      var data    = $this.data('bs.carousel')
      // 初始化轮播的参数
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      // 传入字符串来调用原型方法
      // 其它情况会默认调用方法 slide
      var action  = typeof option == 'string' ? option : options.slide

      // 若轮播元素上面没有绑定轮播的实例，则初始化一个并绑到轮播元素上去
      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      // 传入一个数字，则认为这个数字代表想要显示的帧的索引，会调用原型方法 to
      if (typeof option == 'number') data.to(option)
      // 调用 action 对应名字的原型方法
      else if (action) data[action]()
      // 自定义了轮播动画的时间间隔，先暂停再轮播
      else if (options.interval) data.pause().cycle()
    })
  }

  // 保存 $.fn 中可能已经存在了的 carousel 插件方法
  var old = $.fn.carousel

  // 将插件注册到 $.fn 中去
  $.fn.carousel             = Plugin
  // 通过 Constructor 属性暴露了其原始的构造函数
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================
  // 防冲突处理
  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================
  // data-api 用法（纯 HTML）

  // click 事件处理函数
  var clickHandler = function (e) {
    var href
    // this 是含有属性 data-slide 的元素（前进/后退元素）
    // 或者，是含有属性 data-slide-to 的元素（指示符元素）
    var $this   = $(this)
    // 轮播对象元素
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    // 轮播对象需要含有 carousel 类样式方可
    if (!$target.hasClass('carousel')) return

    // 通常 data-slide 上绑定的是字符串 prev/next
    // 而 data-slide-to 上绑定的则是数字 0/1/2/3...
    var options = $.extend({}, $target.data(), $this.data())
    // 针对指示符元素
    var slideIndex = $this.attr('data-slide-to')
    // 若是在指示符元素上的 click 事件，定义下 options.interval 为 false
    if (slideIndex) options.interval = false

    // 对于 前进/后退元素（含有 data-slide 的元素）会调用 slide 方法
    Plugin.call($target, options)

    // 对于指示符元素，直接调用原型方法 to 显示对应的帧
    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    // 阻止 click 事件的默认行为
    e.preventDefault()
  }

  // 事件代理
  $(document)
    // 在含有属性 data-slide 的元素（前进/后退元素）上绑定 click 事件的处理函数 clickHandler
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    // 在含有属性 data-slide-to 的元素（指示符元素）上绑定 click 事件的处理函数 clickHandler
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  // 监听 load 事件
  $(window).on('load', function () {
    // 对每一个含有属性 data-ride="carousel" 的元素生成一个轮播对象实例
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      // 实例化插件，并且传入元素上的 data- 数据作为生成实例时的参数
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);
