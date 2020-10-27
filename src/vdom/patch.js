// 创建组件的真实元素
function createComponent(vnode){
    let i = vnode.data
    if((i = i.hook) && (i = i.init)){
         i(vnode)
         if(vnode.componentInstance){
             return true;
         }
    }

    return false;
}

function createElm(vnode){
    let {tag, data, key, children, text, vm} = vnode
    if(typeof tag === 'string'){
       
        //可能是组件，也可能是普通的元素

        if(createComponent(vnode)){ // 返回组件的真实dom节点
            return vnode.componentInstance.$el;
        }
        //创建标签
        //虚拟节点的el属性上映射真实dom
        vnode.el = document.createElement(tag)
        //更新属性
        updateProperties(vnode)
        // 创建子节点
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    }else{
        //创建文本
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function updateProperties(vnode){
    let {tag, data, key, children, text, vm} = vnode
    let elm = vnode.el;
    Object.keys(data).forEach(key => {
        if(key === 'style'){
            for(let styleName in data['style']){
                elm.style[styleName] = data['style'][styleName]
            }
        }else if(key === 'class'){
            elm.className = data['class']
        }else {
            elm.setAttribute(key, data[key])
        }
    }) 
}
export function patch(oldVnode, vnode){
    // 组件： oldVnode没有，就直接创建元素
    if(!oldVnode) return createElm(vnode)
    // 初次渲染，oldVnode是#app真实dom节点
    const isRealElement = oldVnode.nodeType;

    if(isRealElement){
        //初次渲染
        let oldElm = oldVnode; // 老的真实dom节点
        let parentNode = oldElm.parentNode; // 父节点
        let el = createElm(vnode) // 根据虚拟节点创建出真实dom 新的真实dom
        
        //将新的真实dom插入到老的节点下一个节点的前边
        parentNode.insertBefore(el, oldElm.nextSibiling)

        // 移除老的节点
        parentNode.removeChild(oldElm)
        //返回新的节点
        return el;
    }else{
        //diff
    }
    
}