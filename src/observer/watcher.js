
import { pushTarget, popTarget } from './dep'
import { queueWatcher } from './schedular';
let id = 0; 
class Watcher{
   constructor(vm, exprOrFn, cb, options){
       this.id = id++;
       this.vm = vm;
       this.cb = cb;
       this.options = options;
       this.getter = exprOrFn;

       this.deps = []
       this.depsId = new Set() //dep的id  set数据

       this.get()
   }
   // watcher中保存着dep
   addDep(dep){
      //watcher中不存放相同的dep
      let id = dep.id;
      if(!this.depsId.has(id)){ //dep是非重复的，watcher也是不会重复的
        this.depsId.add(id)
        this.deps.push(dep)
        dep.addSub(this)
      }
   }
   //为什么叫get呢，表示这个方法中会对模板中的数据进行取值
   get(){
      //更新前，将这个watcher(渲染watcher)放到Depd.target属性上
      pushTarget(this) //Dep.target = watcher
      //getter方法走的是更新方法 vm._update(vm._render())
      this.getter() //调用getter方法，会对模板中的数据进行取值操作
      //更新后，重置为null, 防止在模板外修改数据，减少不必要的更新
      popTarget() //Dep.target = null
   }
   //真正的更新方法
   run(){
      this.get()
   }
   //更新操作
   //现在是同步更新，改一次，更新一次，希望是异步更新
   update(){
      //调度执行watcher的更新方法，而且是异步的
      queueWatcher(this)
   }
}

export default Watcher;