// 数据劫持，数组的处理逻辑，主要是方法的重写

// 老的数组的方法
let oldArrayMethods = Array.prototype;

// 这7个方法都是能修改原数组的方法
const methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'reverse',
    'sort'
]
/**
 * 相当于
 * function create(proto){
 *   let Fn = function(){}
 *   Fn.prototype = proto
 *   return new Fn()
 * }
 * proto.__proto__ = Array.prototype 相当于多了一层
 */
const arrayMethods = Object.create(Array.prototype)

// 重写数组的方法
// 删除元素的方法不管，增加元素的方法，如果元素是对象，进行监测
methods.forEach(method => {
    arrayMethods[method] = function(...args) {
        // 调用老的方法
        let result = oldArrayMethods[method].call(this, ...args)
        let inserted;
        let ob = this.__ob__ // Observer的实例
        // 自己的逻辑
        switch(method){
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':  // splice(0, 1, xxx)
                inserted = args.slice(2)
            default:
                break;
        }
        // 如果有插入的元素
        if(inserted) {
           // inserted是一个数组，数组中可能有插入的对象元素，监测数组
           // 检测数组可以调用Observer的 observeArray 方法，但是需要得到Observer的实例
           // 这里的this是什么，数组调用的方法，this指的是数组数据，可以将Observer实例挂载到this上
           ob.observeArray(inserted)
        }
        return result;
        
    }
})
// 导出重写后的方法
export default arrayMethods;