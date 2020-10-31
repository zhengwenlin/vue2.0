
// 挂载的逻辑，有了render函数，使用render函数生成vdom虚拟dom，然后渲染到页面上

import Watcher from "./observer/watcher"
import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue) {
    //将虚拟dom转换成真实dom渲染到页面
    Vue.prototype._update = function (vnode) {
        let vm = this;
        const prevVnode = vm._vnode; // 保留上一次的vnode
        vm._vnode = vnode;

        if(!prevVnode){
            // vm.$el是真实dom节点
            vm.$el = patch(vm.$el, vnode)
        }else{
            vm.$el = patch(prevVnode,vnode); // 更新时做diff操作
        }
    }
}


// 渲染靠的是watcher  - 渲染watcher
export function mountComponent(vm, el) {
    // 更新渲染组件的方法
    const updateComponent = () => {
        vm._update(vm._render())
    }
    // 使用渲染watcher渲染页面
    new Watcher(vm, updateComponent, () => { }, true) // true为渲染watcher
}

/**
 * 调用声明周期钩子
 * @param {*} vm 
 * @param {*} hook 
 */
export function callHook(vm, hook) {
    //vm.$options上可以获取到合并后的生命周期函数数组
    const handlers = vm.$options[hook]
    if (handlers) {
        handlers.forEach(handler => handler.call(vm))
    }
}