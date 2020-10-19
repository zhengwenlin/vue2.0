import { observe } from "./observer/index.js";

// 用于初始化状态，状态由很多种 props data methods computed watch
export function initState(vm) {
  let options = vm.$options

  // 初始化数据，数据劫持
  if(options.data){
      initData(vm)
  }
}

// 将vm._data的数据代理的vm实例上，用户体验好
function proxy(target, source, key){
  Object.defineProperty(target, key, {
    get(){
      return target[source][key]
    },
    set(newValue){
      target[source][key] = newValue;
    }
  })
}

// 初始化data数据
function initData(vm) {
    // 初始化数据，就是对数据的劫持
    let data = vm.$options.data
    // vm._data中保存着数据
    data = vm._data = typeof data === 'function' ? data.call(vm): data;

    // 用户看数据只能在vm._data上看，可以将vm._data上的数据代理到vm实例上，通过vm.xx访问数据
    for(let key in data){
       proxy(vm, '_data', key)
    }

    // 数据劫持，观测数据 data和vm._data是同一个引用
    observe(data)

}