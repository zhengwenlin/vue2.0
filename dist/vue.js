(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

   // 将html模板转成ast语法树,核心就是正则匹配，截取字符串
   // ast语法树长什么样？

   /*
      {
          tag, // 标签名
          type, //类型
          attrs,// 属性
          parent, // 父节点
          children //孩子节点
      }
   */
   var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // aa-aa 

   var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //aa:aa

   var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 可以匹配到标签名  [1]
   /**
    * 
   <div id="app">
       <div id="1" a="2">
           <span style="color:red;">{{name}}}</span>
           <span>haha{{age}}}world</span>
       </div>
   </div>
    */

   function parseHTML(html) {
     // ast的根，默认是null
     var root = null; // 走n步

     function advance(n) {
       html = html.substring(n);
     }

     while (html) {
       // indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。
       var textEnd = html.indexOf('<'); // 如果textEnd == 0的话，说明是标签； >0的话，说明是文本

       if (textEnd === 0) {
         // 解析标签
         var startTageMatch = html.match(startTagOpen);
         console.log(startTageMatch, 'startTageMatch');

         if (startTageMatch) {
           //开始标签 match[0]是匹配到的字符串<div   match[1]是标签名 div
           advance(startTageMatch[0].length);

           if (!root) {
             root = {
               tag: startTageMatch[1],
               type: 1
             };
           }
         }

         break;
       }
     }
   }

   // 将模板编译成render函数
   function compileToFunctions(template) {
     // 将html模板转成ast语法树
     var ast = parseHTML(template);
   }

   function _typeof(obj) {
     "@babel/helpers - typeof";

     if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
       _typeof = function (obj) {
         return typeof obj;
       };
     } else {
       _typeof = function (obj) {
         return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
       };
     }

     return _typeof(obj);
   }

   function _classCallCheck(instance, Constructor) {
     if (!(instance instanceof Constructor)) {
       throw new TypeError("Cannot call a class as a function");
     }
   }

   function _defineProperties(target, props) {
     for (var i = 0; i < props.length; i++) {
       var descriptor = props[i];
       descriptor.enumerable = descriptor.enumerable || false;
       descriptor.configurable = true;
       if ("value" in descriptor) descriptor.writable = true;
       Object.defineProperty(target, descriptor.key, descriptor);
     }
   }

   function _createClass(Constructor, protoProps, staticProps) {
     if (protoProps) _defineProperties(Constructor.prototype, protoProps);
     if (staticProps) _defineProperties(Constructor, staticProps);
     return Constructor;
   }

   // 数据劫持，数组的处理逻辑，主要是方法的重写
   // 老的数组的方法
   var oldArrayMethods = Array.prototype; // 这7个方法都是能修改原数组的方法

   var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
   /**
    * 相当于
    * function create(proto){
    *   let Fn = function(){}
    *   Fn.prototype = proto
    *   return new Fn()
    * }
    * proto.__proto__ = Array.prototype 相当于多了一层
    */

   var arrayMethods = Object.create(Array.prototype); // 重写数组的方法
   // 删除元素的方法不管，增加元素的方法，如果元素是对象，进行监测

   methods.forEach(function (method) {
     arrayMethods[method] = function () {
       var _oldArrayMethods$meth;

       for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
         args[_key] = arguments[_key];
       }

       // 调用老的方法
       var result = (_oldArrayMethods$meth = oldArrayMethods[method]).call.apply(_oldArrayMethods$meth, [this].concat(args));

       var inserted;
       var ob = this.__ob__; // Observer的实例
       // 自己的逻辑

       switch (method) {
         case 'push':
         case 'unshift':
           inserted = args;
           break;

         case 'splice':
           // splice(0, 1, xxx)
           inserted = args.slice(2);
       } // 如果有插入的元素


       if (inserted) {
         // inserted是一个数组，数组中可能有插入的对象元素，监测数组
         // 检测数组可以调用Observer的 observeArray 方法，但是需要得到Observer的实例
         // 这里的this是什么，数组调用的方法，this指的是数组数据，可以将Observer实例挂载到this上
         ob.observeArray(inserted);
       }

       return result;
     };
   }); // 导出重写后的方法

   var Observer = /*#__PURE__*/function () {
     function Observer(data) {
       _classCallCheck(this, Observer);

       //这样写发现死循环了 Maximum call stack size exceeded
       //因为data多了一个__ob__属性，walk的时候，循环data，ob是一个对象，又new Observer，又走walk，又
       //有一个__ob__，就死循环了
       //data.__ob__ = this; // 将this挂载到数据上
       // 将__ob__变成不可枚举即可,使用Object.defineProperty
       Object.defineProperty(data, '__ob__', {
         value: this,
         enumerable: false,
         //不能枚举
         configurable: false //不能删除

       }); // 如果数据是一个数组的话，默认会将数组的每一个元素都设置了get和set，性能差
       // 默认数组单独处理

       if (Array.isArray(data)) {
         // 处理数组的逻辑 这里的data是数组，有数组的方法
         // 1. 改写数组的方法（能修改原数组的方法）,因为如果原数组改变了，也应该触发视图更新
         // 通过重写原型方法的方式 data.__proto__ = arrayMethods
         Object.setPrototypeOf(data, arrayMethods); // 2. 如果元素是对象，进行监测，如果是普通值，不管

         this.observeArray(data);
       } else {
         this.walk(data);
       }
     } // 观测数据，走一步


     _createClass(Observer, [{
       key: "walk",
       value: function walk(data) {
         // value是对象
         Object.keys(data).forEach(function (key) {
           // 定义响应式数据 obj  key  value
           defineReactive(data, key, data[key]);
         });
       } // 数组元素监测

     }, {
       key: "observeArray",
       value: function observeArray(data) {
         for (var i = 0; i < data.length; i++) {
           observe(data[i]);
         }
       }
     }]);

     return Observer;
   }(); // 将一个对象定义成响应式（Object.defineProperty）


   function defineReactive(obj, key, value) {
     // value可能是对象
     observe(value);
     Object.defineProperty(obj, key, {
       get: function get() {
         return value;
       },
       set: function set(newVal) {
         if (newVal === value) {
           return;
         } // 设置的值可能是对象


         observe(newVal);
         value = newVal;
       }
     });
   } // 观测数据，数据劫持

   function observe(data) {
     // 如果不是对象的话，不管
     if (_typeof(data) !== 'object' || data === null) {
       return;
     } // 如果数据有__ob__属性，说明被监测过了，不用再次监测


     if (data.__ob__) {
       return;
     } // 使用Observer类观测


     return new Observer(data);
   }

   function initState(vm) {
     var options = vm.$options; // 初始化数据，数据劫持

     if (options.data) {
       initData(vm);
     }
   } // 将vm._data的数据代理的vm实例上，用户体验好

   function proxy(target, source, key) {
     Object.defineProperty(target, key, {
       get: function get() {
         return target[source][key];
       },
       set: function set(newValue) {
         target[source][key] = newValue;
       }
     });
   } // 初始化data数据


   function initData(vm) {
     // 初始化数据，就是对数据的劫持
     var data = vm.$options.data; // vm._data中保存着数据

     data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 用户看数据只能在vm._data上看，可以将vm._data上的数据代理到vm实例上，通过vm.xx访问数据

     for (var key in data) {
       proxy(vm, '_data', key);
     } // 数据劫持，观测数据 data和vm._data是同一个引用


     observe(data);
   }

   function initMixin(Vue) {
     Vue.prototype._init = function (options) {
       var vm = this;
       vm.$options = options; // vm.$options保存的是用户传入的选项
       //初始化状态有很多

       initState(vm); //编译模板，挂载到页面

       if (vm.$options.el) {
         vm.$mount(vm.$options.el);
       }
     };

     Vue.prototype.$mount = function (el) {
       var vm = this;
       var options = vm.$options; // 获取el的dom节点

       el = typeof el === 'string' ? document.querySelector(el) : el; // vm.$options.el是真实dom节点

       vm.$options.el = el; // 查找模板的顺序：
       // 如果有render函数，直接使用render函数
       // 没有render  看看有没有template
       // 没有template 就使用外部模板
       // 使用模板编译成render函数

       if (!options.render) {
         var template = options.template;

         if (!template) {
           template = el.outerHTML; // 外部模板
         } //拿到模板，使用模板编译成render函数


         var render = compileToFunctions(template);
         options.render = render;
       }
     };
   }

   function Vue(options) {
     this._init(options);
   } // 混入的初始化方法
   // 原型模式，将原型的方法拆分到不同的文件中


   initMixin(Vue);

   return Vue;

})));
//# sourceMappingURL=vue.js.map
