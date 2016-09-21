/**
 * Backbone localStorage Adapter
 * Version 1.1.16
 *
 * https://github.com/jeromegn/Backbone.localStorage
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof require === 'function') {
    module.exports = factory(require("backbone"));
  } else if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    // AMD 注册成一个匿名模块
    define(["backbone"], function(Backbone) {
      // Use global variables if the locals are undefined.
      return factory(Backbone || root.Backbone);
    });
  } else {
    factory(Backbone);
  }
}(this, function(Backbone) {
// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Generate four random hex digits.
// 生成 4 个随机的十六进制数
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

// Generate a pseudo-GUID by concatenating random hexadecimal.
// 拼接随机的十六进制数来生成一个伪全局唯一标识符
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function isObject(item) {
  return item === Object(item);
}

// 数组/类数组 array 是否包含 item
function contains(array, item) {
  var i = array.length;
  while (i--) if (array[i] === item) return true;
  return false;
}

// 将 props 中的 属性/值 添加到 obj 中去
function extend(obj, props) {
  for (var key in props) obj[key] = props[key];
  return obj;
}

// object 中的属性 property 对应的值 value 是一个函数，则执行该函数并返回它的返回值
// 否则直接返回属性值 value
function result(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return (typeof value === 'function') ? object[property]() : value;
}

// Our Store is represented by a single JS object in *localStorage*.
// Create it with a meaningful name, like the name you'd give a table.
// window.Store is deprectated, use Backbone.LocalStorage instead
// 构造函数 Backbone.LocalStorage
Backbone.LocalStorage = window.Store = function(name, serializer) {
  if( !this.localStorage ) {
    throw "Backbone.localStorage: Environment does not support localStorage.";
  }

  this.name = name;
  // 没有提供自定义的 serializer 则使用默认的方法
  this.serializer = serializer || {
    // 把 JS 对象序列化成 JSON 字符串
    serialize: function(item) {
      return isObject(item) ? JSON.stringify(item) : item;
    },
    // fix for "illegal access" error on Android when JSON.parse is passed null
    // 把 JSON 字符串解析成原生 JS 值
    deserialize: function (data) {
      return data && JSON.parse(data);
    }
  };

  var store = this.localStorage().getItem(this.name);

  // 数组 records 存储 model 实例的 id
  this.records = (store && store.split(",")) || [];
};

// 扩展 Backbone.LocalStorage 的原型方法
extend(Backbone.LocalStorage.prototype, {

  // Save the current state of the **Store** to *localStorage*.
  // 将数组 records 值用 ',' 拼接并存储在 name 名下
  // 常用于更新 records 数组
  save: function() {
    this.localStorage().setItem(this.name, this.records.join(","));
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already have an id of it's own.
  // 添加一个 model 实例, 若它没有 id 则给他分配一个 guid
  create: function(model) {
    if (!model.id && model.id !== 0) {
      model.id = guid();
      // 设置 model 实例的属性 idAttribute
      model.set(model.idAttribute, model.id);
    }
    // 以 this.name 和 model.id 拼接一个新的 name, 并将 model 实例存储在它的名下
    this.localStorage().setItem(this._itemName(model.id), this.serializer.serialize(model));
    // 将 model 实例的 id 加入数组 records 中
    this.records.push(model.id.toString());
    this.save();

    // 返回 model 实例
    return this.find(model);
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(model) {
    // 保存 model 实例
    this.localStorage().setItem(this._itemName(model.id), this.serializer.serialize(model));

    var modelId = model.id.toString();
    // 如果 records 数组中没有 model 的 id ,加进去
    if (!contains(this.records, modelId)) {
      this.records.push(modelId);
      // 更新 this.name 对应的值
      this.save();
    }
    // 返回 model 实例
    return this.find(model);
  },

  // Retrieve a model from `this.data` by id.
  // 通过 model 实例 id 获取存储的 model 字符串并恢复为 model 对象实例
  find: function(model) {
    return this.serializer.deserialize(this.localStorage().getItem(this._itemName(model.id)));
  },

  // Return the array of all models currently in storage.
  // 返回当前存储在 storage 中的所有 model 实例
  findAll: function() {
    var result = [];

    for (var i = 0, id, data; i < this.records.length; i++) {
      // 某一 model 实例的 id
      id   = this.records[i];

      // 解析出该 model 实例
      data = this.serializer.deserialize(this.localStorage().getItem(this._itemName(id)));

      // model 实例不为 null , 将其加入结果数组 result 中
      if (data != null) result.push(data);
    }
    // 返回所有的 model 实例
    return result;
  },

  // Delete a model from `this.data`, returning it.
  // 删除某个模型实例，并返回删除的模型实例
  destroy: function(model) {
    // 先删掉
    this.localStorage().removeItem(this._itemName(model.id));
    // 再删掉 records 中该 model 的记录
    var modelId = model.id.toString();
    for (var i = 0, id; i < this.records.length; i++) {
      if (this.records[i] === modelId) {
        this.records.splice(i, 1);
      }
    }
    // 更新 records
    this.save();
    // 返回被删除的 model
    return model;
  },

  localStorage: function() {
    return localStorage;
  },

  // Clear localStorage for specific collection.
  _clear: function() {
    var local = this.localStorage(),
      itemRe = new RegExp("^" + this.name + "-");

    // Remove id-tracking item (e.g., "foo").
    local.removeItem(this.name);

    // Match all data items (e.g., "foo-ID") and remove.
    for (var k in local) {
      if (itemRe.test(k)) {
        local.removeItem(k);
      }
    }

    this.records.length = 0;
  },

  // Size of localStorage.
  _storageSize: function() {
    return this.localStorage().length;
  },

  _itemName: function(id) {
    return this.name+"-"+id;
  }

});

// localSync delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
// window.Store.sync and Backbone.localSync is deprecated, use Backbone.LocalStorage.sync instead
Backbone.LocalStorage.sync = window.Store.sync = Backbone.localSync = function(method, model, options) {

  var store = result(model, 'localStorage') || result(model.collection, 'localStorage');

  var resp, errorMessage;
  //If $ is having Deferred - use it.
  // 异步队列
  var syncDfd = Backbone.$ ? (Backbone.$.Deferred && Backbone.$.Deferred()) : (Backbone.Deferred && Backbone.Deferred());

  // CRUD 方法
  try {

    switch (method) {
      case "read":
        // model 实例有 id 则返回这个 model 实例，否则返回全部的 model
        resp = model.id != undefined ? store.find(model) : store.findAll();
        break;
      case "create":
        // 添加一个新的 model 实例，最后会返回这个实例
        resp = store.create(model);
        break;
      case "update":
        // 更新 model 实例，最后返回这个实例
        resp = store.update(model);
        break;
      case "delete":
        // 删除某个模型实例，并返回删除的模型实例
        resp = store.destroy(model);
        break;
    }

  } catch(error) {
    if (error.code === 22 && store._storageSize() === 0)
      errorMessage = "Private browsing is unsupported";
    else
      errorMessage = error.message;
  }

  // 若有返回值
  if (resp) {
    // 执行成功回调函数 options.success
    if (options && options.success) {
      if (Backbone.VERSION === "0.9.10") {
        options.success(model, resp, options);
      } else {
        options.success(resp);
      }
    }

    if (syncDfd) {
      syncDfd.resolve(resp);
    }

  } else {
    errorMessage = errorMessage ? errorMessage : "Record Not Found";

    // 执行失败回调函数 options.error
    if (options && options.error)
      if (Backbone.VERSION === "0.9.10") {
        options.error(model, errorMessage, options);
      } else {
        options.error(errorMessage);
      }

    if (syncDfd)
      syncDfd.reject(errorMessage);
  }

  // add compatibility with $.ajax
  // always execute callback for success and error
  // 为了兼容 $.ajax
  // 执行完成回调函数 options.complete
  if (options && options.complete) options.complete(resp);

  return syncDfd && syncDfd.promise();
};

// 保存 Backbone 原生的 sync 方法
Backbone.ajaxSync = Backbone.sync;

Backbone.getSyncMethod = function(model, options) {
  var forceAjaxSync = options && options.ajaxSync;
  console.log("forceAjaxSync: ", forceAjaxSync);
  if(!forceAjaxSync && (result(model, 'localStorage') || result(model.collection, 'localStorage'))) {
    return Backbone.localSync;
  }

  return Backbone.ajaxSync;
};

// Override 'Backbone.sync' to default to localSync,
// the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
Backbone.sync = function(method, model, options) {
  return Backbone.getSyncMethod(model, options).apply(this, [method, model, options]);
};

return Backbone.LocalStorage;
}));
