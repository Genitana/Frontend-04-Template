//第一个括号匹配数字和点，第二个匹配空白(空格和tab符)，第三个匹配换行符，第四个匹配*，...
// 如果正则表达式加上g修饰符，则可以使用多次exec()方法，下一次搜索的位置从上一次匹配成功结束的位置开始。
var regexp = /([0-9\.]+)|([ \t]+)|([\r\t]+)|(\*)|(\/)|(\+)|(\-)/g;

var dictionary = ["Number", "Whitespace", "LineTerminator", "*", "/", "+", "-"];

function* tokenize(source) {
    var result = null;
    var lastIndex = 0;
    while(true) {
        lastIndex = regexp.lastIndex;
        result = regexp.exec(source);

        if (!result) break;

        // 如果匹配的长度大于返回值得长度，说明里面有我们不认识的字符或格式，break
        if (regexp.lastIndex - lastIndex > result[0].length) 
           break;

        let token = {
            type: null,
            value: null,
        }

        for(let i = 1; i <= dictionary.length; i++) {
            if (result[i]) {
                token.type = dictionary[i-1]
            }
        }
        token.value = result[0];
        // todo 
        // 当我们要返回一个序列的时候，可以用yield
        yield token;
    }
    yield {
        type: "EOF"
    }
}

let source = [];

for (let token  of tokenize("10 * 25 / 2")) {
    if(token.type !== "Whitespace" && token.type !== "LineTerminator"){
        source.push(token);
    }
}

function Expression(tokens) {

}

function AdditiveExpression(source){

}
/**
 * MultiplicativeExpression的产生式有3个，所以对应三种逻辑
 * 1, Number  (一个)
 * 2，MultiplicativeExpression * Number （三个）
 * 3，MultiplicativeExpression / Number （三个）
 * @param {*} source 
 */
function MultiplicativeExpression(source){
    if(source[0].type === "Number") {
       let node = {
           type: "MultiplicativeExpression",
           children: [source[0]]
       } 
       source[0] = node;
       // 递归
       return MultiplicativeExpression(source);
    }
    if(source[0].type === "MultiplicativeExpression" && source[1].type === "*"){
        let node = {
            type: "MultiplicativeExpression",
            operator: "*",
            children:[]
        }
        //这里是符合第二个产生式，所以把前面3个封装成一个node
        node.children.push(source.shift())
        node.children.push(source.shift())
        node.children.push(source.shift())
        source.unshift(node);
        return MultiplicativeExpression(source);
    }
    if(source[0].type === "MultiplicativeExpression" && source[1].type === "/"){
        let node = {
            type: "MultiplicativeExpression",
            operator: "/",
            children:[]
        }
        //这里是符合第三个产生式，所以把前面3个封装成一个node
        node.children.push(source.shift())
        node.children.push(source.shift())
        node.children.push(source.shift())
        source.unshift(node);
        return MultiplicativeExpression(source);
    }
    // 递归结束的条件
    if(source[0].type === "MultiplicativeExpression") {
        return source[0]
    }
    // 正常情况应该走不到这句
    return MultiplicativeExpression(source);
}

console.log(MultiplicativeExpression(source));