const css  = require("css");
const layout = require("../../Week_08/src/layout.js");
const EOF  = Symbol("EOF"); // EOF: End of File

let currentToken = null;
let currentAttribute = null;
let stack = [{type: "document", children:[]}];
let currentTextNode = null;

// 加入一个新的函数，addCSSRules，这里我们把css规则暂存到一个数组里
let rules = [];

function addCSSRules(text) {
    var ast = css.parse(text);    // 用css包提供的parse函数把text解析成AST
    rules.push(...ast.stylesheet.rules);
}

/**
 * 元素和选择器是否匹配   
 * 这里只考虑选择器都是简单选择器：.a 、 #a  、 div  
 * 1,以点开头的class选择器：.a  
 * 2，以#号开头的ID选择器：#a  
 * 3，tagName选择器：div
 * @param {*} element 元素
 * @param {*} selector 选择器
 */
function match(element, selector){
    //! element.attributes判断是否是一个文本节点，如果是文本节点，那根本不用看匹不匹配，直接返回false
    if(!selector || ! element.attributes)
        return false;

    if(selector.charAt(0) === "#"){
        var attr = element.attributes.filter(e => e.name === "id")[0];
        if(attr && attr.value === selector.replace("#", "")){
            return true;
        }
    }else if(selector.charAt(0) === "."){
        var attr = element.attributes.filter(e => e.name === "class")[0];
        if(attr && attr.value === selector.replace(".", "")){
            return true;
        }
    }else {
        if(element.tagName === selector){
            return true;
        }
    }
    return false;
}

function specificity(selector){
    var p = [0, 0, 0, 0];
    // 只考虑 复合选择器里只有简单选择器的情况
    var selectorParts = selector.split(" ");
    for(var part of selectorParts){
        if(part.charAt(0) === "#"){
            //id选择器，第二位加一 
            p[1] += 1;
        }else if(part.charAt(0) === "."){
            //class选择器，第三位加一
            p[2] += 1;
        }else {
            //tag选择器，第三位加一
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1, sp2){
    //高位能比出来，直接return

    if(sp1[0] - sp2[0]){
        return sp1[0] - sp2[0];
    }else if(sp1[1] - sp2[1]){
        return sp1[1] - sp2[1];
    }else if(sp1[2] - sp2[2]){
        return sp1[2] - sp2[2];
    }

    return sp1[3] - sp2[3];
}

/**
 * 计算CSS
 */
function computeCSS(element){
    //获取父元素序列  ( slice()是避免后面stack被操作了，现在先复制一份)
    var elements = stack.slice().reverse();

    if(!element.computedStyle){
        element.computedStyle = {};

        //去匹配所有的css规则rules
        for(let rule of rules){
            // 对复杂选择器根据空格拆分 （为了跟elements顺序一致，把选择器也reserve）
            var selectorParts = rule.selectors[0].split(" ").reverse();

            // 当前元素跟selectorParts[0]是否匹配
            if(!match(element, selectorParts[0])){
                continue;
            }

            /**
             * 双循环选择器和元素的父元素，去找到他们是否能够进行匹配
             * 这是两个数组同时进行的循环，这块的算法是整个选择器匹配算法的里面的一个小小的难点
             *  elements是当前元素element的父级数组，selectorParts是当前CSS匹配规则数组
             */

            let matched = false;

            /**
             * 用当前元素的父级elements，挨个去匹配CSS选择器规则，如果能匹配上，说明CSS规则匹配上了这个元素
             * 例如：第一个img元素的父级elements：[div元素, body元素, html元素, document元素]
             *      第一个img元素的选择器selectorParts：['#myid','div','body']
             *      如果能匹配上selectorParts的所有规则，则说明当前CSS规则是适用于当前element元素的
             */

            var j = 1; //j：当前选择器的位置
            for(var i = 0; i < elements.length; i++){  
                //elements是当前元素element的父级
                if(match(elements[i], selectorParts[j])){
                    // 一旦元素能够匹配一个选择器，就让j自增
                    j++;
                }
            }
            //是否所有的选择器都被匹配到了
            if(j >= selectorParts.length) {
                //如果都匹配到了，则匹配成功
                matched = true;
            }

            if(matched){
                console.log("css匹配成功，element:", element.tagName, ", matched rule:", rule.selectors[0]);
                
                // 如果匹配到，把rules里面的所有css属性应用到这个元素上

                var sp = specificity(rule.selectors[0]);
                var computedStyle = element.computedStyle;
                //rule.declarations就是css的样式
                for(var declaration of rule.declarations){
                    if(!computedStyle[declaration.property]){
                        computedStyle[declaration.property] = {};
                    }

                    if(!computedStyle[declaration.property].specificity){
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;

                        // 比较css优先级
                    }else if(compare(computedStyle[declaration.property].specificity, sp) < 0){
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;
                    }
                }
                console.log(element.computedStyle);
            }
        }
    }
}

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
        
        console.log('computeCSS:', element.tagName)
        computeCSS(element);

        top.children.push(element);
        element.parent = top;
        
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
            /***** 遇到style标签，执行添加css规则的操作  (暂时不处理link标签的情况)  *****/
            if(top.tagName === "style"){
                addCSSRules(top.children[0].content);
            }

            /**
             * flex布局是需要知道子元素的， 而子元素在结束标签之前肯定就已经都知道了，所以在endTag这里执行layout()函数
             */
            layout(top);


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
        currentTextNode.content += token.content;
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
        emit({
            type: "text",
            content: c
        });
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
        currentToken.tagName += c;
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
        return data;
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
        currentAttribute.value += c;
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
        //todo 感觉这一步要做个判断，从双引号来的，return doubleQuotedAttributeValue；
        // 从单引号来的，要 return singleQuotedAttributeValue;
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
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    }else if ("EOF" === c) {

    }else {

    }
}
module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for(let c of html){
        if(typeof state !== "function"){
            console.error("qqqq");
        }
        try {
            
            state = state(c);
        } catch (error) {
            console.error(error);
        }
    }
    state = state(EOF);
    console.log(stack[0]);
    return stack[0];
}