import { initMixin } from "./init";
import { renderMixin } from './render'
import { lifecycleMixin } from './lifecycle'
import { initGlobalAPI } from "./global-api/index";
import { compileToFunctions } from "./compiler/index";
import { patch,createElm  } from "./vdom/patch";
// Vue的入口文件
function Vue(options) {
  this._init(options)
}

// 混入的初始化方法
// 原型模式，将原型的方法拆分到不同的文件中
initMixin(Vue)
lifecycleMixin(Vue) //在Vue原型上扩展_update方法
renderMixin(Vue) // 在Vue原型上扩展_render方法


initGlobalAPI(Vue) //混入全局方法



// domdiff--------

// let vm1 = new Vue({
//   data() {
//     return { name: 'zf' }
//   }
// })

// let render1 = compileToFunctions(`<div>
//   <li key="A">A</li>
//   <li key="D">D</li>
//   <li key="B">B</li>
//   <li key="E">E</li>
//   <li key="C">C</li>
// </div>`)
// let vnode1 = render1.call(vm1)

// let vm2 = new Vue({
//   data() {
//     return { name: 'zwl' }
//   }
// })
// // 初次渲染后，才能做diff
// let el = createElm(vnode1)
// document.body.appendChild(el)
// // diff
// let render2 = compileToFunctions(`<div>
//   <li key="D">D</li>
//   <li key="A">A</li>
//   <li key="B">B</li>
//   <li key="C">C</li>
//   <li key="E">E</li>
// </div>`)
// let vnode2= render2.call(vm2)

// setTimeout(() => {
//   patch(vnode1, vnode2)
// }, 2000)

export default Vue;