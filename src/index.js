import { initMixin } from "./init";

// Vue的入口文件
function Vue (options){
  this._init(options)  
}

// 混入的初始化方法
// 原型模式，将原型的方法拆分到不同的文件中
initMixin(Vue)


export default Vue;