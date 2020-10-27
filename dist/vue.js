(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

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

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // 将ast转换成code代码，代码长什么样子

  /*
  /* 
  <div id="app" a=1 b=2>
      <span style"=color:red">{{name}} <a>hello</a></span>
  </div> 
   _c(
      'div',{id:'app',a:1,b:2}
      ,_c(
          'span',
          {style:{color:'red'}}
          ,_s(_v(name)),
          _c(a,undefined,_v('hello'))
          )
  )
    三种函数：
    _c 创建元素
    _s stringflfy转成字符串
    _v 处理文本
    _c(
        'div', {id:'app', a:1,b:2},
        _c('span', {style: {color:"red"}}, _s(_v(name)), _c('a', undefined, _v('hello')))
    )
  */
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配{{}}
  // 生成子元素

  function genChilren(el) {
    var children = el.children;

    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }

  function gen(node) {
    if (node.type === 3) {
      //文本
      //文本比较复杂了，文本中可能有1.普通文本或者2.带大括号的 {{name}}aa{{age}}哈哈
      // _v(_s(name) + 'aa' + _s(age) + '哈哈')
      // {{aa}} aaa {{bbb}} ccc
      // 第一次：aa  index: 0   lastIndex:6
      var text = node.text;

      if (defaultTagRE.test(text)) {
        //带有{{}}的
        // 全局模式下，exec方法重置正则对象的lastIndex为0
        var lastIndex = defaultTagRE.lastIndex = 0;
        var match; //匹配的结果

        var index = 0; //index属性值

        var tokens = []; //只要能匹配到{{}}，就一直循环

        while (match = defaultTagRE.exec(text)) {
          // match[0]匹配到的字符串 1-n 分组结果
          // index match[0]第一个字符在原字符串中的索引位置
          index = match.index;

          if (index > lastIndex) {
            // index > lastIndex 说明没有匹配到，说明是普通文本
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join("+"), ")");
      } else {
        // 普通文本
        return "_v(".concat(JSON.stringify(text), ")");
      }
    } else if (node.type === 1) {
      //标签
      return generate(node);
    }
  } // 生成属性 [{naem:xx,value:xxx}]


  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var temp = attr.value; // style="color:red;background:pink"

          var obj = {};
          temp.split(';').forEach(function (s) {
            var _s$split = s.split(':'),
                _s$split2 = _slicedToArray(_s$split, 2),
                sName = _s$split2[0],
                sValue = _s$split2[1];

            obj[sName] = sValue;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function generate(el) {
    var code = "_c('".concat(el.tag, "', ").concat(el.attrs && el.attrs.length ? genProps(el.attrs) : 'undefined', " ").concat(el.children ? ',' + genChilren(el) : '', ")");
    return code;
  }

  // 将html模板转成ast语法树,核心就是正则匹配，截取字符串
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // aa-aa 

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //aa:aa

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 可以匹配到标签名  [1]

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //[0] 标签的结束名字
  //    style="xxx"   style='xxx'  style=xxx

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var startTagClose = /^\s*(\/?)>/; // ast语法树长什么样？

  /*
     {
         tag, // 标签名
         type, //类型
         attrs,// 属性
         parent, // 父节点
         children //孩子节点
     }
  */

  /**
   * 
      <div id="1" a="2">
          <span style="color:red;">{{name}}}</span>
          <span>haha{{age}}}world</span>
      </div>
  </div>
   */
  // 创建ast对象

  function createAstElement(tag, attrs) {
    return {
      tag: tag,
      type: 1,
      attrs: attrs,
      parent: null,
      children: []
    };
  } //这个函数最终是要得到一个ast语法树


  function parseHTML(html) {
    // ast的根，默认是null
    var root = null;
    var stack = []; // 使用栈结构存放ast元素，记录父子关系

    var currentParent = null; //当前的父元素
    //处理开始标签的

    function start(tagName, attrs) {
      var element = createAstElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      stack.push(element);
      currentParent = element;
    } //处理结束标签的


    function end(tagName) {
      // 这里用来处理父子关系
      var element = stack.pop(); //取出最后一个

      currentParent = stack[stack.length - 1]; // 父级就是前一个元素

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    } //处理文本的


    function charts(text) {
      text = text.replace(/\s/g, ''); //空文本不做处理

      if (text) {
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    } // 走n步


    function advance(n) {
      html = html.substring(n);
    } // 解析标签


    function parseStartTag() {
      var match = html.match(startTagOpen);

      if (match) {
        advance(match[0].length);
        var matched = {
          tagName: match[1],
          attrs: []
        }; //解析属性
        //属性可能有多个，属性的位置 >前的

        var _end, attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          matched.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          advance(_end[0].length);
          return matched;
        }
      }
    }

    while (html) {
      // indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。
      var textEnd = html.indexOf('<'); // 如果textEnd == 0的话，说明是标签； >0的话，说明是文本

      if (textEnd === 0) {
        //开始标签
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
        } //结束标签


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
        }
      } // 匹配文本 从0-匹配到>的位置都是文本的部分


      var text = void 0;

      if (textEnd > 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        charts(text);
      }
    }

    return root;
  }

  // 将模板编译成render函数
  function compileToFunctions(template) {
    // 将html模板转成ast语法树
    var ast = parseHTML(template); // 将ast 转换成code

    var code = generate(ast); // with生成render代码

    var renderCode = "with(this){ return ".concat(code, "}"); // 生成render函数

    var fn = new Function(renderCode);
    return fn;
  }

  // dep主要用来保存watcher和让watcher更新
  var id = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.subs = [];
      this.id = id++;
    } // 让watcher记住这个dep


    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        Dep.target.addDep(this);
      } //添加一个watcher

    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      } //让watcher触发更新

    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();
  Dep.target = null;
  function pushTarget(watcher) {
    Dep.target = watcher;
  }
  function popTarget() {
    Dep.target = null;
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    for (var i = 0; i < callbacks.length; i++) {
      var callback = callbacks[i];
      callback();
    }

    callbacks = [];
    waiting = false;
  } // 批处理 只更新列表， 之后执行更新逻辑


  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      waiting = true;
      Promise.resolve().then(flushCallbacks);
    }
  }
  var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestory', 'destored']; //策略模式

  var strats = {}; //合并生命周期方法
  //主要是将生命周期合并成一个数组
  //第一次  parentVal是空的  childVal有值
  //key肯定是生命周期名字，所以parentVal和childVal至少有一个有值，第一次parentVal为空，所以
  //调用这个方法时，childVal肯定有值

  function mergeHook(parentVal, childVal) {
    if (childVal) {
      if (parentVal) {
        return parentVal.concat(childVal);
      } else {
        return [childVal];
      }
    } else {
      return parentVal;
    }
  } //生命周期的处理策略


  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook; // 合并生命周期函数 
  });
  function isObject(val) {
    return _typeof(val) === 'object' && val !== null;
  } // 组件compoents的合并策略

  strats.components = function (parentVal, childVal) {
    var res = Object.create(parentVal);

    for (var key in childVal) {
      res[key] = childVal[key];
    }

    return res;
  }; // 合并选项


  function mergeOptions(parent, child) {
    var options = {}; //1. 普通属性的合并策略
    //如果父亲有，儿子也有，就用儿子的
    //如果父亲有，儿子没有，就用父亲的
    //如果父亲没有，而儿子有，就用儿子的

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      //key有可能是生命周期钩子 beforecreate created
      //非普通属性的策略模式，钩子函数、directive component
      if (strats[key]) {
        return options[key] = strats[key](parent[key], child[key]);
      } //如果parent[key] child[key]都是对象，就用儿子的覆盖父亲的


      if (isObject(parent[key]) && isObject(child[key])) {
        options[key] = _objectSpread2(_objectSpread2({}, parent[key]), child[key]);
      } else {
        //合并以儿子为主
        if (child[key]) {
          options[key] = child[key];
        } else {
          options[key] = parent[key];
        }
      }
    }

    return options;
  }

  function makeUp(str) {
    var has = {};
    str.split(',').forEach(function (tagName) {
      has[tagName] = true;
    });
    return function (tag) {
      return has[tag] || false;
    };
  } // 是否是原生标签 高阶函数


  var isReservedTag = makeUp('a,p,div,ul,li,span,input,button,b');

  var queue = [];
  var has = {};
  var pending = false;

  function flushSchedularQueue() {
    for (var i = 0; i < queue.length; i++) {
      var watcher = queue[i];
      watcher.run();
    }

    queue = [];
    has = {};
    pending = false;
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;

      if (!pending) {
        pending = true; //进入等待状态
        //如果不是等待状态,异步执行数组中的watcher

        nextTick(flushSchedularQueue);
      }
    }
  }

  var id$1 = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.id = id$1++;
      this.vm = vm;
      this.cb = cb;
      this.options = options;
      this.getter = exprOrFn;
      this.deps = [];
      this.depsId = new Set(); //dep的id  set数据

      this.get();
    } // watcher中保存着dep


    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        //watcher中不存放相同的dep
        var id = dep.id;

        if (!this.depsId.has(id)) {
          //dep是非重复的，watcher也是不会重复的
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this);
        }
      } //为什么叫get呢，表示这个方法中会对模板中的数据进行取值

    }, {
      key: "get",
      value: function get() {
        //更新前，将这个watcher(渲染watcher)放到Depd.target属性上
        pushTarget(this); //Dep.target = watcher
        //getter方法走的是更新方法 vm._update(vm._render())

        this.getter(); //调用getter方法，会对模板中的数据进行取值操作
        //更新后，重置为null, 防止在模板外修改数据，减少不必要的更新

        popTarget(); //Dep.target = null
      } //真正的更新方法

    }, {
      key: "run",
      value: function run() {
        this.get();
      } //更新操作
      //现在是同步更新，改一次，更新一次，希望是异步更新

    }, {
      key: "update",
      value: function update() {
        //调度执行watcher的更新方法，而且是异步的
        queueWatcher(this);
      }
    }]);

    return Watcher;
  }();

  // 创建组件的真实元素
  function createComponent(vnode) {
    var i = vnode.data;

    if ((i = i.hook) && (i = i.init)) {
      i(vnode);

      if (vnode.componentInstance) {
        return true;
      }
    }

    return false;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        key = vnode.key,
        children = vnode.children,
        text = vnode.text,
        vm = vnode.vm;

    if (typeof tag === 'string') {
      //可能是组件，也可能是普通的元素
      if (createComponent(vnode)) {
        // 返回组件的真实dom节点
        return vnode.componentInstance.$el;
      } //创建标签
      //虚拟节点的el属性上映射真实dom


      vnode.el = document.createElement(tag); //更新属性

      updateProperties(vnode); // 创建子节点

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      //创建文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProperties(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        key = vnode.key,
        children = vnode.children,
        text = vnode.text,
        vm = vnode.vm;
    var elm = vnode.el;
    Object.keys(data).forEach(function (key) {
      if (key === 'style') {
        for (var styleName in data['style']) {
          elm.style[styleName] = data['style'][styleName];
        }
      } else if (key === 'class') {
        elm.className = data['class'];
      } else {
        elm.setAttribute(key, data[key]);
      }
    });
  }

  function patch(oldVnode, vnode) {
    // 组件： oldVnode没有，就直接创建元素
    if (!oldVnode) return createElm(vnode); // 初次渲染，oldVnode是#app真实dom节点

    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      //初次渲染
      var oldElm = oldVnode; // 老的真实dom节点

      var parentNode = oldElm.parentNode; // 父节点

      var el = createElm(vnode); // 根据虚拟节点创建出真实dom 新的真实dom
      //将新的真实dom插入到老的节点下一个节点的前边

      parentNode.insertBefore(el, oldElm.nextSibiling); // 移除老的节点

      parentNode.removeChild(oldElm); //返回新的节点

      return el;
    }
  }

  // 挂载的逻辑，有了render函数，使用render函数生成vdom虚拟dom，然后渲染到页面上
  function lifecycleMixin(Vue) {
    //将虚拟dom转换成真实dom渲染到页面
    Vue.prototype._update = function (vnode) {
      var vm = this; // vm.$el是真实dom节点

      vm.$el = patch(vm.$el, vnode);
    };
  } // 渲染靠的是watcher  - 渲染watcher

  function mountComponent(vm, el) {
    // 更新渲染组件的方法
    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    }; // 使用渲染watcher渲染页面


    new Watcher(vm, updateComponent, function () {}, true); // true为渲染watcher
  }
  /**
   * 调用声明周期钩子
   * @param {*} vm 
   * @param {*} hook 
   */

  function callHook(vm, hook) {
    //vm.$options上可以获取到合并后的生命周期函数数组
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
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
      } //调用了数组的方法，更新视图


      ob.dep.notify();
      return result;
    };
  }); // 导出重写后的方法

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //data有可能是一个数组
      //数组的依赖收集
      this.dep = new Dep(); //这样写发现死循环了 Maximum call stack size exceeded
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
  }();

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i]; //如果有__ob__属性，说明是对象或者数组，也要收集依赖

      current.__ob__ && current.__ob__.dep.depend(); //如果这个元素是数组，递归收集

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  } // 将一个对象定义成响应式（Object.defineProperty）


  function defineReactive(obj, key, value) {
    // value可能是对象
    var childOb = observe(value); //observer的实例

    var dep = new Dep(); // 给每个属性都创建一个dep，用于收集依赖

    Object.defineProperty(obj, key, {
      get: function get() {
        //渲染的时候，js单线程机制，模板渲染会进行取值操作，走get方法
        //让这个属性key能记住这个watcher
        if (Dep.target) {
          // 对对象进行依赖收集,将Dep.target这个渲染watcher放到这个dep中
          dep.depend(); //让这个属性自己的dep记住这个watcher，也要让watcher记住这个dep

          if (childOb) {
            //收集数组或者对象本身的依赖 {arr:[]}
            childOb.dep.depend(); //如果元素中也有数组，也要递归收集，将元素的依赖收集起来

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newVal) {
        if (newVal === value) {
          return;
        } // 设置的值可能是对象


        observe(newVal);
        value = newVal;
        dep.notify();
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
      var vm = this; // 将用户传入的选项和Vue.options进行合并
      // vm.$options保存的是用户传入的选项
      //将合并后的生命周期啥的配置项和用户传入的options合并，保存到了vm.$options上

      vm.$options = mergeOptions(vm.constructor.options, options);
      console.log(vm.$options, 'vm.$options'); //初始化状态前 beforeCreate

      callHook(vm, 'beforeCreate'); //初始化状态有很多

      initState(vm); //初始化状态后  created

      callHook(vm, 'created'); //编译模板，挂载到页面

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    }; // nextTick方法


    Vue.prototype.$nextTick = nextTick;

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options; // 获取el的dom节点

      el = typeof el === 'string' ? document.querySelector(el) : el; // vm.$options.el是真实dom节点

      vm.$el = el; // 查找模板的顺序：
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
      } // 有了render函数，挂载页面(组件)


      mountComponent(vm);
    };
  }

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    // 这里的tag有可能是个组件，要区分是组件还是原生标签
    if (isReservedTag(tag)) {
      return vnode(vm, tag, data, data.key, children, undefined);
    } else {
      var Ctor = vm.$options.components[tag];
      return createComponent$1(vm, tag, data, data.key, children, Ctor);
    }
  }

  function createComponent$1(vm, tag, data, key, children, Ctor) {
    // Ctor有可能是一个对象或者函数
    if (isObject(Ctor)) {
      Ctor = vm.$options._base.extend(Ctor);
    } // 给组件的虚拟dom的属性上添加一个hook生命周期方法


    data.hook = {
      init: function init(vnode) {
        var child = vnode.componentInstance = new vnode.componentOptions.Ctor({});
        child.$mount();
      }
    };
    return vnode(vm, "vue-component-".concat(Ctor.cid, "-").concat(tag), data, key, undefined, undefined, {
      Ctor: Ctor
    });
  }

  function createTextNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, data, key, children, text, componentOptions) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text,
      componentOptions: componentOptions
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return createElement.apply(void 0, [this].concat(args));
    };

    Vue.prototype._v = function (text) {
      return createTextNode(this, text);
    };

    Vue.prototype._s = function (val) {
      return val == null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      return vnode;
    };
  }

  function initGlobalAPI(Vue) {
    //用来存储全局的配置
    Vue.options = {}; //混入，就是将这些配置项混入到用户传入的配置项中
    //调用mixin方法，会将mixin配置项合并到Vue.options选项中

    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this;
    };

    Vue.options._base = Vue; // 保存Vue构造函数
    //将所有的组件都保存到这个对象中

    Vue.options.components = {}; //component方法
    //Vue.component方法内部调用的Vue.extend方法，传入对象，返回组件的构造函数

    Vue.component = function (id, definition) {
      debugger;
      definition.name = definition.name || id; //调用extend方法，返回组件的构造函数

      definition = this.options._base.extend(definition); //将组件的构造函数保存到Vue.options.components对象中

      this.options.components[id] = definition;
    };

    var cid = 0;

    Vue.extend = function (options) {
      debugger;
      var Super = this; //Super指向Vue
      //创建Vue子类的构造函数

      var Sub = function VueComponent(options) {
        this._init(options);
      };

      Sub.cid = cid++; // 原型继承

      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub; // 拷贝静态方法

      Sub.component = Super.component; // 每次定义一个组件，这个组件应该能够父级的定义

      Sub.options = mergeOptions(Super.options, options);
      return Sub;
    };
  }

  function Vue(options) {
    this._init(options);
  } // 混入的初始化方法
  // 原型模式，将原型的方法拆分到不同的文件中


  initMixin(Vue);
  lifecycleMixin(Vue); //在Vue原型上扩展_update方法

  renderMixin(Vue); // 在Vue原型上扩展_render方法

  initGlobalAPI(Vue); //混入全局方法

  return Vue;

})));
//# sourceMappingURL=vue.js.map
