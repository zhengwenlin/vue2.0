import { compileToFunctions } from "./compiler/index.js";
import { initState } from "./state";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        
        let vm = this;
        vm.$options = options; // vm.$options保存的是用户传入的选项

        //初始化状态有很多
        initState(vm)


        //编译模板，挂载到页面
        if(vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    }

    Vue.prototype.$mount = function(el) {
        const vm = this;
        let options = vm.$options;
        
        // 获取el的dom节点
        el = typeof el === 'string' ? document.querySelector(el) : el;
        // vm.$options.el是真实dom节点
        vm.$options.el = el;

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

    }
}