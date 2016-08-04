# Bootstrap JavaScript 插件部分

2016-08-03

---

## 插件列表

- transition
- alert
- button
- carousel
- collapse
- dropdown
- modal
- tooltip
- popover
- scrollspy
- tab
- affix

## 插件总体结构

Bootstrap 中所有的插件都具有一致的结构：

```javascript
+function(){
  // CLASS DEFINITION
  // ======================
  // 插件的类定义，包括静态属性方法以及原型方法
  // blabla...

  // PLUGIN DEFINITION
  // =======================
  // 插件定义，插件会被注册到 $.fn 中去
  // blabla...

  // NO CONFLICT
  // =================
  // 插件的防冲突处理
  // blabla...

  // DATA-API
  // ==============
  // data-api 用法（纯 HTML）
  // blabla...

}(jQuery);
```



## 过渡效果 transition
---


## 警告框 alert
---


## 按钮 button
---


## 轮播 carousel
---


## 折叠 collapse
---


## 下拉菜单 dropdown
---


## 模态框 modal
---


## 工具提示 tooltip
---


## 弹出框 popover
---


## 滚动监听 scrollspy
---


## 标签页 tab
---


## 附加导航 affix
---
