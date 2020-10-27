import { nextTick } from "../utils";


let queue = []
let has = {}
let pending = false;

function flushSchedularQueue(){
   for(let i =0; i< queue.length; i++) {
       let watcher = queue[i]
       watcher.run()
   }
   queue = []
   has = {}
   pending = false;
}
export function queueWatcher(watcher){
    let id = watcher.id;
    if(!has[id]){
        queue.push(watcher)
        has[id] = true;
  
        if(!pending){
            pending = true; //进入等待状态
            //如果不是等待状态,异步执行数组中的watcher
            nextTick(flushSchedularQueue)
        }
    }
}