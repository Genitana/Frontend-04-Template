const EOF  = Symbol("EOF"); // EOF: End of File

let currentToken = null;
let currentAttribute = null;
let stack = [{type: "document", children:[]}];
let currentTextNode = null;

/**
 * 用token构建DOM树
 */
function emit(token) {
    
    let top = stack[stack.length - 1]; //栈顶

    if(token.type === "startTag"){
        let element = {
            type: "element",
            children: [],
            attributes: []
        };

        element.tagName = token.tagName;

        //赋值属性
        for(let p in token){
            if(p !== "type" && p !== "tagName"){
                element.attributes.push({
                    name: p,
                    value: token[p]
                });
            }
        }
        top.children.push(element);
        element.parent = top;
        // todo 
        if(!token.isSelfClosing){
            // 不是自封闭标签，就push进stack。(push进stack的目的是干啥？就为了配对？)
            stack.push(element);
        }
        currentTextNode = null;
    }else if(token.type === "endTag"){
        if(top.tagName !== token.tagName){
            //不配对就抛错
            throw new Error("Tag start end doesn't match!");
        }else{
            stack.pop();
        }
        currentTextNode = null;
    }else if(token.type === "text"){
        // 处理文本节点

        if(currentTextNode === null) {
            currentTextNode = {
                type: "text",
                content: ""
            };
            top.children.push(currentTextNode);
        }
        // 多个文本节点要合并
        currentTextNode += token.content;
    }
}
/**
 * HTML里面的tag:开始标签、结束标签、自封闭标签
 */

/** 
 * HTML标准里把初始状态叫做data 
 * 解析tag
 */ 
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
        emit(currentToken);
        return data;             // 如果是“>”，说明标签结束了，开始解析下一个标签
    }else {
        return tagName;
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    }else if (">" === c || "/" === c ||EOF === c) {
        return afterAttributeName(c);
    }else if ("=" === c) {

    }else {
        currentAttribute = {
            name: "",
            value: ""
        };
        return attributeName(c);
    }
}
/**
 * 解析属性
 */
function attributeName(c) {
    if(c.match(/^[\t\n\f ]$/) || "/" === c || ">" === c || EOF === c){
        return afterAttributeName(c);
    }else if("=" === c){
        return beforeAttributeValue;
    }else if("\u0000" === c){

    }else if("\"" === c || "'" === c || "<" === c){

    }else{
        currentAttribute.name += c;
        return attributeName;
    }
}
/**
 * 到这里说明属性解析完了，只等一个“/”或者“>”来结束了
 */
function afterAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)){
        // 有空格的话，后面可能还有属性
        return beforeAttributeName;
    }else if ("/" === c){
        return selfClosingStartTag;
    }else if("=" === c){
        return beforeAttributeValue;
    }else if(">" === c){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(EOF === c){

    }else{
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute.value = {
            name: "",
            value: ""
        }
        return attributeName(c);
    }
}
function beforeAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/) || "/" === c || ">" === c || EOF === c){
        return beforeAttributeValue;
    }else if("\"" === c){
        return doubleQuotedAttributeValue; //双引号
    }else if("\'" === c){
        return singleQuotedAttributeValue; //单引号
    }else if(">" === c){

    }else {
        return unquotedAttributeValue(c);
    }
}
/** 双引号的情况 */
function doubleQuotedAttributeValue(c) {
    if("\"" === c){
        //如果等号后面是一个双引号
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if("\u0000" === c){

    }else if(EOF === c){

    }else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}
/** 单引号的情况 */
function singleQuotedAttributeValue(c) {
    if("\'" === c){
        //如果等号后面是一个单引号
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if("\u0000" === c){

    }else if(EOF === c){

    }else{
        currentAttribute += c;
        return singleQuotedAttributeValue;
    }
}
function afterQuotedAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if("/" === c){
        return selfClosingStartTag
    }else if(">" === c){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(EOF === c){

    }else{
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}
function unquotedAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    }else if("/" === c){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    }else if(">" === c){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if("\u0000" === c){

    }else if("\"" === c || "\'" === c || "<" === c || "=" === c || "`" === c){

    }else if(EOF === c){

    }else{
        currentAttribute.value += c;
        return unquotedAttributeValue;
    }
}
function selfClosingStartTag(c) {
    if (">" === c) {
        currentToken.selfClosing = true;
        return data;
    }else if ("EOF" === c) {

    }else {

    }
}
module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    let lastState = null;
    for(let c of html){
        if(typeof state !== "function"){
            console.error("qqqq");
        }
        try {
            
            state = state(c);
        } catch (error) {
            console.error(error);
            return;
        }
    }
    state = state(EOF);
    console.log(stack[0]);
}