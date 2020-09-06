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

for (let token  of tokenize("1024 + 10 * 25")) {
    console.log(token);
}
