const EOF  = Symbol("EOF"); // EOF: End of File

let currentToken = null;

function emit(token) {
    console.log(token);
}
/**
 * HTML里面的tag:开始标签、结束标签、自封闭标签
 */

// HTML标准里把初始状态叫做data
function data(c) {
    if("<" ===  c) {
        return tagOpen;
    }else if(EOF === c){
        emit({
            type: "EOF"
        });
        return;
    }else {
        emit({
            type: "text",
            content: c
        });
        return data;
    }
}

function tagOpen(c) {
    if("/" === c) {
        return endTagOpen; // "</"开头的，是结束标签的开头
    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: "startTag",
            tagName: ""
        };
        return tagName(c);   // "<"后面跟着字母的，要么是开始标签，要么是自封闭标签
    }else {
        return;
    }
}
function endTagOpen(c) {
    if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: "endTag",
            tagName: ""
        };
        return tagName(c);
    }else if(">" === c){

    }else if(EOF === c){

    }else{

    }
}
/** 解析标签名 */
function  tagName(c) {
    /**
     * tagName肯定是以空白符结束的
     * HTML里面有效的空白符有4种：tab符(\t)、换行符(\n)、禁止符(\f)和空格
     */
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName; //空格之后就是属性了
    }else if("/" === c) {
        return selfClosingStartTag; // 如果后面跟着“/”,说明可能是自封闭标签
    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken.tagName += c;
        return tagName;           // 还是字母，说明还在解析标签名
    }else if(">" === c ){
        return data;             // 如果是“>”，说明标签结束了，开始解析下一个标签
    }else {
        return tagName;
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    }else if (">" === c) {
        return data;
    }else if ("=" === c) {
        return beforeAttributeName;
    }else {
        return beforeAttributeName;
    }
}
function selfClosingStartTag(c) {
    if (">" === c) {
        currentToken.selfClosing = true;
    }else if ("EOF" === c) {

    }else {

    }
}
module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for(let c of html){
        state = state(c);
    }
    state = state(EOF);
}