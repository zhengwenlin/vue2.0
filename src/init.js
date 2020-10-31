import { compileToFunctions } from "./compiler/index.js";
import { callHook, mountComponent } from "./lifecycle.js";
import { mergeOptions, nextTick } from "./utils.js";
import { initState } from "./state";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        let vm = this;
        // 将用户传入的选项和Vue.options进行合并
        // vm.$options保存的是用户传入的选项
        //将合并后的生命周期啥的配置项和用户传入的options合并，保存到了vm.$options上
        vm.$options = mergeOptions(vm.constructor.options,options)
        //初始化状态前 beforeCreate
        callHook(vm, 'beforeCreate')
        
        //初始化状态有很多
        initState(vm)

        //初始化状态后  created
        callHook(vm, 'created')

        //编译模板，挂载到页面
        if(vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    }
    // nextTick方法
    Vue.prototype.$nextTick = nextTick

    Vue.prototype.$mount = function(el) {
        const vm = this;
        let options = vm.$options;
        
        // 获取el的dom节点
        el = typeof el === 'string' ? document.querySelector(el) : el;
        // vm.$options.el是真实dom节点
        vm.$el = el;

        // 查找模板的顺序：
        // 如果有render函数，直接使用render函数
        // 没有render  看看有没有template
        // 没有template 就使用外部模板

        // 使用模板编译成render函数
        if(!options.render){
            let template = options.template
            if(!template){
                template = el.outerHTML // 外部模板
            }

            //拿到模板，使用模板编译成render函数
            const render =  compileToFunctions(template)
            options.render = render;
        }


        // 有了render函数，挂载页面(组件)
        mountComponent(vm, el)

    }
}