import { mergeOptions } from "../utils";


export function initGlobalAPI(Vue) {
    //用来存储全局的配置
    Vue.options = {}
    //混入，就是将这些配置项混入到用户传入的配置项中
    //调用mixin方法，会将mixin配置项合并到Vue.options选项中
    Vue.mixin = function (mixin) {
        this.options = mergeOptions(this.options, mixin)
        return this;
    }
    Vue.options._base = Vue // 保存Vue构造函数

    //将所有的组件都保存到这个对象中
    Vue.options.components = {}

    //component方法
    //Vue.component方法内部调用的Vue.extend方法，传入对象，返回组件的构造函数
    Vue.component = function (id, definition) {
        definition.name = definition.name || id;
        //调用extend方法，返回组件的构造函数
        definition = this.options._base.extend(definition)
        //将组件的构造函数保存到Vue.options.components对象中
        this.options.components[id] = definition
    }
    let cid = 0;
    Vue.extend = function (options) {
        let Super = this; //Super指向Vue
        //创建Vue子类的构造函数
        let Sub = function VueComponent(options) {
            this._init(options)
        }
        Sub.cid = cid++;
        // 原型继承
        Sub.prototype = Object.create(Super.prototype)
        Sub.prototype.constructor = Sub

        // 拷贝静态方法
        Sub.component = Super.component;

        // 每次定义一个组件，这个组件应该能够父级的定义
        Sub.options = mergeOptions(Super.options, options)
        return Sub;
    }
}