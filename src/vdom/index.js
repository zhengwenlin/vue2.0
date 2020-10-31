import { isObject, isReservedTag } from "../utils"

// _c('div', {a:1,b:2}, _c())
export function createElement(vm, tag, data={}, ...children){
    // 这里的tag有可能是个组件，要区分是组件还是原生标签
    if(isReservedTag(tag)){
        return vnode(vm, tag, data, data.key, children, undefined)
    }else{
        let Ctor = vm.$options.components[tag]
        return createComponent(vm, tag, data, data.key, children, Ctor)
    }
    
}

function createComponent(vm, tag, data, key, children, Ctor){
    // Ctor有可能是一个对象或者函数
    if(isObject(Ctor)){
        Ctor = vm.$options._base.extend(Ctor)
    }
    // 给组件的虚拟dom的属性上添加一个hook生命周期方法
    data.hook = {
        init(vnode){
            let child = vnode.componentInstance = new vnode.componentOptions.Ctor({})
            child.$mount()
        }
    }
    return vnode(vm, `vue-component-${Ctor.cid}-${tag}`, data, key, undefined, undefined, { Ctor })
}

export function createTextNode(vm, text){
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}


function vnode(vm, tag, data, key, children, text, componentOptions){
    return {
        vm,
        tag,
        data,
        key,
        children,
        text,
        componentOptions
    }
}
// tag和key一样说明是一个虚拟节点
export function isSameVnode(oldVnode, newVnode){
    return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key
}