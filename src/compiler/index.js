// 将模板编译成render函数

import { generate } from "./generate";
import { parseHTML } from "./parse";


export function compileToFunctions(template) {
    // 将html模板转成ast语法树
    let ast = parseHTML(template)

    // 将ast 转换成code
    let code = generate(ast)
    
    // with生成render代码
    let renderCode = `with(this){ return ${code}}`

    // 生成render函数
    let fn = new Function(renderCode)

    return fn
}