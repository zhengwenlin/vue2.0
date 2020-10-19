
// 将html模板转成ast语法树,核心就是正则匹配，截取字符串
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
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // aa-aa 
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //aa:aa
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 可以匹配到标签名  [1]
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //[0] 标签的结束名字
//    style="xxx"   style='xxx'  style=xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/;


/**
 * 
<div id="app">
    <div id="1" a="2">
        <span style="color:red;">{{name}}}</span>
        <span>haha{{age}}}world</span>
    </div>
</div>
 */
export function parseHTML(html) {
    // ast的根，默认是null
    let root = null;

    // 走n步
    function advance(n){
        html = html.substring(n)
    }
    while(html){
       // indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。
       let textEnd = html.indexOf('<')
       // 如果textEnd == 0的话，说明是标签； >0的话，说明是文本
       if(textEnd === 0){
           // 解析标签

           let startTageMatch = html.match(startTagOpen)
           console.log(startTageMatch, 'startTageMatch')
           if(startTageMatch){
               //开始标签 match[0]是匹配到的字符串<div   match[1]是标签名 div

               advance(startTageMatch[0].length)
               if(!root){
                   root = {
                       tag: startTageMatch[1],
                       type: 1
                   }
               }
               
           }
           break;

       }
    }
}