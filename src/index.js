import { initMixin } from "./init";
import { renderMixin } from './render'
import { lifecycleMixin } from './lifecycle'
import { initGlobalAPI } from "./global-api/index";
// Vue的入口文件
function Vue (options){
  this._init(options)  
}

// 混入的初始化方法
// 原型模式，将原型的方法拆分到不同的文件中
initMixin(Vue)
lifecycleMixin(Vue) //在Vue原型上扩展_update方法
renderMixin(Vue) // 在Vue原型上扩展_render方法


initGlobalAPI(Vue) //混入全局方法
export default Vue;