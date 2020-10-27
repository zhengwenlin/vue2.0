
// 将html模板转成ast语法树,核心就是正则匹配，截取字符串

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // aa-aa 
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //aa:aa
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 可以匹配到标签名  [1]
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //[0] 标签的结束名字
//    style="xxx"   style='xxx'  style=xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/;
// ast语法树长什么样？
/*
   {
       tag, // 标签名
       type, //类型
       attrs,// 属性
       parent, // 父节点
       children //孩子节点
   }
*/

/**
 * 
    <div id="1" a="2">
        <span style="color:red;">{{name}}}</span>
        <span>haha{{age}}}world</span>
    </div>
</div>
 */
// 创建ast对象
function createAstElement(tag,attrs){
    return {
        tag,
        type:1,
        attrs,
        parent: null,
        children: []
    }
}
//这个函数最终是要得到一个ast语法树
export function parseHTML(html) {
    // ast的根，默认是null
    let root = null;
    let stack = [] // 使用栈结构存放ast元素，记录父子关系
    let currentParent = null; //当前的父元素
    //处理开始标签的
    function start(tagName, attrs){
        let element = createAstElement(tagName,attrs)
        if(!root){
           root = element
        }
        stack.push(element)
        currentParent = element;

    }
    //处理结束标签的
    function end(tagName){
        // 这里用来处理父子关系
        let element = stack.pop() //取出最后一个
        currentParent = stack[stack.length - 1] // 父级就是前一个元素
        if(currentParent){
            element.parent = currentParent;
            currentParent.children.push(element)
        }
    }
    //处理文本的
    function charts(text){
      text = text.replace(/\s/g, '')
      //空文本不做处理
      if(text){
        currentParent.children.push({
            type: 3,
            text
        })
      }
    }
    // 走n步
    function advance(n) {
        html = html.substring(n)
    }
    // 解析标签
    function parseStartTag() {
        let match = html.match(startTagOpen)
        if (match) {
            advance(match[0].length)
            let matched = {
                tagName: match[1],
                attrs: []
            }
            //解析属性
            //属性可能有多个，属性的位置 >前的
            let end, attr
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                matched.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
            }
            if (end) {
                advance(end[0].length)
                return matched;
            }
            
        }
    }

    while (html) {
        // indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。
        let textEnd = html.indexOf('<')
        // 如果textEnd == 0的话，说明是标签； >0的话，说明是文本
        if (textEnd === 0) {
            //开始标签
            let startTagMatch = parseStartTag()
            if(startTagMatch){
                start(startTagMatch.tagName, startTagMatch.attrs)
            }
            //结束标签
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
            }
        }

        // 匹配文本 从0-匹配到>的位置都是文本的部分
        let text;
        if (textEnd > 0) {
            text = html.substring(0, textEnd)
        }
        if (text) {
            advance(text.length)
            charts(text)
        }
    }
    return root;
}