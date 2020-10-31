import { isSameVnode } from './index'
// 创建组件的真实元素
function createComponent(vnode) {
    let i = vnode.data
    if ((i = i.hook) && (i = i.init)) {
        i(vnode)
        if (vnode.componentInstance) {
            return true;
        }
    }

    return false;
}
// 给vnode虚拟节点创建真实节点，并且可以通过vnode.el获取到真实的节点
export function createElm(vnode) {
    let { tag, data, key, children, text, vm } = vnode
    if (typeof tag === 'string') {

        //可能是组件，也可能是普通的元素

        if (createComponent(vnode)) { // 返回组件的真实dom节点
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
    } else {
        //创建文本
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function updateProperties(vnode, oldProps = {}) {
    let newProps = vnode.data || {}
    let elm = vnode.el;

    // 1. 老的有，新的没有，干掉老的
    for (let key in oldProps) {
        if (!newProps[key]) { //移除老的属性
            elm.removeAttribute(key)
        }
    }

    //2. style一样
    let oldStyle = oldProps.style || {}
    let newStyle = newProps.style || {}

    for (let key in oldStyle) {
        if (!newStyle[key]) {
            elm.style[key] = ''
        }
    }
    //添加新的属性
    Object.keys(newProps).forEach(key => {
        if (key === 'style') {
            for (let styleName in newProps['style']) {
                elm.style[styleName] = newProps['style'][styleName]
            }
        } else if (key === 'class') {
            elm.className = newProps['class']
        } else {
            elm.setAttribute(key, newProps[key])
        }
    })
}

function updateChildren(parent, oldChildren, newChildren) {
    // vue中的diff都是同层节点的比对
    // vue中的diff采用的是双指针的方式进行比较

    // 1.创建双指针
    let oldStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let oldStartVnode = oldChildren[0]
    let oldEndVnode = oldChildren[oldChildren.length - 1]

    let newStartIndex = 0;
    let newEndIndex = newChildren.length - 1;
    let newStartVnode = newChildren[0]
    let newEndVnode = newChildren[newChildren.length - 1]

    // 因为乱序对比时，要看新的虚拟节点在老的中有没有，所以要创建一个老的key-index的映射表
    // 通过key可以取到index，从而获取到这个vnode
    function mkIndexByKey(oldChildren = []) {
        let map = {}
        oldChildren.forEach((child, index) => {
            map[child.key] = index
        })
        return map
    }
    let map = mkIndexByKey(oldChildren)
    // 2.不停的移动使用while循环，
    // 条件是 oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // diff的优化策略
        // 向后插入，向前插入，头移动到尾，尾移动到头部，正序和反序

        if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        } else if (isSameVnode(oldStartVnode, newStartVnode)) {
            //1. 向后插入  ABCD -> ABCDE
            // 如果是相同的元素，老的指针和新的指针都往后移动
            // 调用patch，比较属性和儿子
            patch(oldStartVnode, newStartVnode)
            //指针向后移动
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]

        } else if (isSameVnode(oldEndVnode, newEndVnode)) {//2. 向前插入 ABCD -> EABCD
            // 调用patch，比较属性和儿子
            patch(oldEndVnode, newEndVnode)
            //指针向后移动
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) { // 3. 头移动尾部
            patch(oldStartVnode, newEndVnode)
            // 将老的开始的节点的元素插入到尾指针的下一个节点的前边
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibiling)
            // 老的开始的指针向后移动，新的结束指针向前移动
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldEndVnode, newStartVnode)) { // 4. 尾部移动头部
            patch(oldEndVnode, newStartVnode)
            // 将老的节点的结束节点移动到老的头部前边
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else { // 乱序比对
            // 头和头、尾和尾 、头和尾、尾和头 都不一样，就使用乱序比对
            // 乱序比对： 看看新的节点中，老的中有没有，有的话就复用，没有就创建新的

            // 看看老的中有没有
            let moveIndex = map[newStartVnode.key]
            if (moveIndex === undefined) {
                // 老的中没有，就创建新的，插入到老的开始位置的前边
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)

            } else {
                // 老的中有，就移动老的节点，将原来的重置为null空
                let moveIndexVnode = oldChildren[moveIndex] // 要移动的节点
                oldChildren[moveIndex] = undefined;
                patch(moveIndexVnode, newStartVnode) // 复用老的节点，继续patch
                parent.insertBefore(moveIndexVnode.el, oldStartVnode.el)
            }
            //新的start指针移动
            newStartVnode = newChildren[++newStartIndex]
        }
    }
    //如果新的多，要插入
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let nextEle = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
            // appendChild 和 insertBefore 也可以进行合并
            // 如果insertBefore 传入null 等价于appendChild
            parent.insertBefore(createElm(newChildren[i]), nextEle)
        }
    }

    //如果老的多，要删除
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            let current = oldChildren[i]
            if (current != undefined) {
                parent.removeChild(child.el)
            }
        }
    }

}
export function patch(oldVnode, vnode) {
    // 组件： oldVnode没有，就直接创建元素
    if (!oldVnode) return createElm(vnode)
    // 初次渲染，oldVnode是#app真实dom节点
    const isRealElement = oldVnode.nodeType;

    if (isRealElement) {
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
    } else {
        //diff
        // 1. 如果标签名都不一样，就不用比了，直接干掉老的，插入新的
        if (oldVnode.tag !== vnode.tag) {
            return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
        }

        // 2. 如果标签名相同，可能是文本 text: {tag:undefined}
        // 文本内容不一样，用新的替换老的
        if (!oldVnode.tag) {
            if (oldVnode.text !== vnode.text) {
                return oldVnode.el.textContent = vnode.text;
            }
        }
        //3. 都是元素，标签名字相同，就复用老的节点
        let el = vnode.el = oldVnode.el;
        console.log(el, '**el**')
        //属性可能不一样，老的属性和新的节点比对
        updateProperties(vnode, oldVnode.data)
        //4. 更新儿子
        let oldChildren = oldVnode.children || []
        let newChildren = vnode.children || []
        // 1. 如果老的有儿子，新的也有 diff算法
        if (oldChildren.length > 0 && newChildren.length > 0) {
            updateChildren(el, oldChildren, newChildren)
        } else if (oldChildren.length > 0) { // 2. 如果老的有儿子，新的没有，直接干掉老的
            oldVnode.el.innerHTML = ''

        } else if (newChildren.length > 0) { // 3. 如果老的没有儿子，新的有儿子，插入新的儿子
            newChildren.forEach(child => el.appendChild(createElm(child)))
        }


    }

}