import arrayMethods from "./array"
import {Dep} from './dep'
class Observer {
    constructor(data) { //data有可能是一个数组
        //数组的依赖收集
        this.dep = new Dep()
        //这样写发现死循环了 Maximum call stack size exceeded
        //因为data多了一个__ob__属性，walk的时候，循环data，ob是一个对象，又new Observer，又走walk，又
        //有一个__ob__，就死循环了
        //data.__ob__ = this; // 将this挂载到数据上
        // 将__ob__变成不可枚举即可,使用Object.defineProperty
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false, //不能枚举
            configurable: false //不能删除
        })

        // 如果数据是一个数组的话，默认会将数组的每一个元素都设置了get和set，性能差
        // 默认数组单独处理
        if (Array.isArray(data)) {
            // 处理数组的逻辑 这里的data是数组，有数组的方法
            // 1. 改写数组的方法（能修改原数组的方法）,因为如果原数组改变了，也应该触发视图更新
            // 通过重写原型方法的方式 data.__proto__ = arrayMethods
            Object.setPrototypeOf(data, arrayMethods)
            // 2. 如果元素是对象，进行监测，如果是普通值，不管
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }

    // 观测数据，走一步
    walk(data) {
        // value是对象
        Object.keys(data).forEach(key => {
            // 定义响应式数据 obj  key  value
            defineReactive(data, key, data[key])
        })
    }

    // 数组元素监测
    observeArray(data) {
        for (let i = 0; i < data.length; i++) {
            observe(data[i])
        }
    }
}

function dependArray(value){
    for(let i = 0; i < value.length; i++){
        let current = value[i]
        //如果有__ob__属性，说明是对象或者数组，也要收集依赖
        current.__ob__ && current.__ob__.dep.depend()

        //如果这个元素是数组，递归收集
        if(Array.isArray(current)){
            dependArray(current)
        }
    }
}

// 将一个对象定义成响应式（Object.defineProperty）
export function defineReactive(obj, key, value) {
    // value可能是对象
    let childOb = observe(value) //observer的实例
    let dep = new Dep() // 给每个属性都创建一个dep，用于收集依赖
    Object.defineProperty(obj, key, {
        get() {
            //渲染的时候，js单线程机制，模板渲染会进行取值操作，走get方法
            //让这个属性key能记住这个watcher
            if(Dep.target){
                // 对对象进行依赖收集,将Dep.target这个渲染watcher放到这个dep中
                dep.depend() //让这个属性自己的dep记住这个watcher，也要让watcher记住这个dep
                
                if(childOb){ //收集数组或者对象本身的依赖 {arr:[]}
                    childOb.dep.depend()
                    //如果元素中也有数组，也要递归收集，将元素的依赖收集起来
                    if(Array.isArray(value)){
                        dependArray(value)
                    }
                }
                
            }
            return value;
        },
        set(newVal) {
            if (newVal === value) {
                return;
            }
            // 设置的值可能是对象
            observe(newVal)
            value = newVal;

            dep.notify()
        }
    })
}

// 观测数据，数据劫持
export function observe(data) {
    // 如果不是对象的话，不管
    if (typeof data !== 'object' || data === null) {
        return;
    }
    // 如果数据有__ob__属性，说明被监测过了，不用再次监测
    if (data.__ob__) {
        return;
    }
    // 使用Observer类观测
    return new Observer(data)

}