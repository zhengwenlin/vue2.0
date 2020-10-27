
// dep主要用来保存watcher和让watcher更新
let id = 0;
export class Dep {
    constructor(){
        this.subs = []
        this.id = id++;
    }
    
    // 让watcher记住这个dep
    depend(){
       Dep.target.addDep(this) 
    }

    //添加一个watcher
    addSub(watcher){
        this.subs.push(watcher)
    }
    //让watcher触发更新
    notify(){
        this.subs.forEach(watcher=>watcher.update())
    }
}   

Dep.target = null; 
export function pushTarget(watcher){
    Dep.target = watcher;
}

export function popTarget(){
   Dep.target = null;
}