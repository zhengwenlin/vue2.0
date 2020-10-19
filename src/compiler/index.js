// 将模板编译成render函数

import { parseHTML } from "./parse";


export function compileToFunctions(template) {
    // 将html模板转成ast语法树
    let ast = parseHTML(template)
}