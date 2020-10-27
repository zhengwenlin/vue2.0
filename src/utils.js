
let callbacks = []
let waiting = false;
function flushCallbacks() {
    for (let i = 0; i < callbacks.length; i++) {
        let callback = callbacks[i]
        callback()
    }
    callbacks = []
    waiting = false;
}
// 批处理 只更新列表， 之后执行更新逻辑
export function nextTick(cb) {
    callbacks.push(cb)
    if (!waiting) {
        waiting = true;
        Promise.resolve().then(flushCallbacks)
    }

}
const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestory',
    'destored'
]
//策略模式
const strats = {}
//合并生命周期方法
//主要是将生命周期合并成一个数组
//第一次  parentVal是空的  childVal有值
//key肯定是生命周期名字，所以parentVal和childVal至少有一个有值，第一次parentVal为空，所以
//调用这个方法时，childVal肯定有值
function mergeHook(parentVal, childVal) {
    if (childVal) {
        if (parentVal) {
            return parentVal.concat(childVal)
        } else {
            return [childVal]
        }
    } else {
        return parentVal
    }
}
//生命周期的处理策略
LIFECYCLE_HOOKS.forEach(hook => {
    strats[hook] = mergeHook // 合并生命周期函数 
})
export function isObject(val) {
    return typeof val === 'object' && val !== null;
}


// 组件compoents的合并策略
strats.components = function (parentVal, childVal) {
    let res = Object.create(parentVal)
    for(let key in childVal){
        res[key] = childVal[key]
    }
    return res;
}


// 合并选项
export function mergeOptions(parent, child) {
    let options = {}
    //1. 普通属性的合并策略
    //如果父亲有，儿子也有，就用儿子的
    //如果父亲有，儿子没有，就用父亲的
    //如果父亲没有，而儿子有，就用儿子的
    for (let key in parent) {
        mergeField(key)
    }

    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }

    function mergeField(key) {
        //key有可能是生命周期钩子 beforecreate created
        //非普通属性的策略模式，钩子函数、directive component
        if (strats[key]) {
            return options[key] = strats[key](parent[key], child[key])
        }


        //如果parent[key] child[key]都是对象，就用儿子的覆盖父亲的
        if (isObject(parent[key]) && isObject(child[key])) {
            options[key] = { ...parent[key], ...child[key] }
        } else {
            //合并以儿子为主
            if (child[key]) {
                options[key] = child[key]
            } else {
                options[key] = parent[key]
            }
        }
    }

    return options;
}

function makeUp(str) {
    let has = {}
    str.split(',').forEach(tagName => {
        has[tagName] = true;
    })

    return (tag) => has[tag] || false;
}

// 是否是原生标签 高阶函数
export const isReservedTag = makeUp('a,p,div,ul,li,span,input,button,b')