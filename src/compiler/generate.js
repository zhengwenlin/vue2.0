// 将ast转换成code代码，代码长什么样子
/*
/* 
<div id="app" a=1 b=2>
    <span style"=color:red">{{name}} <a>hello</a></span>
</div> 
 _c(
    'div',{id:'app',a:1,b:2}
    ,_c(
        'span',
        {style:{color:'red'}}
        ,_s(_v(name)),
        _c(a,undefined,_v('hello'))
        )
)
  三种函数：
  _c 创建元素
  _s stringflfy转成字符串
  _v 处理文本
  _c(
      'div', {id:'app', a:1,b:2},
      _c('span', {style: {color:"red"}}, _s(_v(name)), _c('a', undefined, _v('hello')))
  )
*/
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配{{}}
// 生成子元素
function genChilren(el) {
    let children = el.children 
    if(children){
        return children.map(child => gen(child)).join(',')
    }
}
function gen(node){
    if(node.type === 3){
        //文本
        //文本比较复杂了，文本中可能有1.普通文本或者2.带大括号的 {{name}}aa{{age}}哈哈
        // _v(_s(name) + 'aa' + _s(age) + '哈哈')
        // {{aa}} aaa {{bbb}} ccc
        // 第一次：aa  index: 0   lastIndex:6
        let text = node.text;
        if(defaultTagRE.test(text)){
            //带有{{}}的
            // 全局模式下，exec方法重置正则对象的lastIndex为0
            let lastIndex = defaultTagRE.lastIndex = 0; 
            let match; //匹配的结果
            let index = 0; //index属性值
            let tokens = []
            //只要能匹配到{{}}，就一直循环
            while(match = defaultTagRE.exec(text)) {
                // match[0]匹配到的字符串 1-n 分组结果
                // index match[0]第一个字符在原字符串中的索引位置
                console.log(match)
                index = match.index;
                if(index > lastIndex){
                   // index > lastIndex 说明没有匹配到，说明是普通文本
                   debugger
                   let a;
                   tokens.push(JSON.stringify(a = text.slice(lastIndex,index)));
                   console.log(match, '---')
                   break;
                }
                
                console.log('index', match.index)
                console.log('lastIndex', defaultTagRE.lastIndex)
                // lastIndex = index + match[0].length;
            }
            
        }else{
            // 普通文本
            return `_v(${JSON.stringify(text)})`
        }
    }else if(node.type === 1){
        //标签
        return generate(node)
    }
}
// 生成属性 [{naem:xx,value:xxx}]
function genProps(attrs){
    let str = ''
    for(let i = 0; i< attrs.length; i++){
       let attr = attrs[i]
       if(attr.name === 'style'){
         let temp = attr.value; // style="color:red;background:pink"
         let obj = {}
         temp.split(';').forEach(s => {
             let [sName,sValue] = s.split(':')
             obj[sName] = sValue;
         })
         attr.value = obj;

       }
       str += `${attr.name}:${JSON.stringify(attr.value)},`  
    }
    return `{${str.slice(0, -1)}}` 
}
export function generate(el) {
    let code = `_c('${el.tag}', ${
        el.attrs&&el.attrs.length ? genProps(el.attrs): 'undefined'
    }, ${
        el.children ? (',' + genChilren(el)): ''
    })`
    return code;
}

