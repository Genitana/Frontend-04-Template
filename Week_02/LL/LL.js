//第一个括号匹配数字和点，第二个匹配空白(空格和tab符)，第三个匹配换行符，第四个匹配*，...
// 如果正则表达式加上g修饰符，则可以使用多次exec()方法，下一次搜索的位置从上一次匹配成功结束的位置开始。
var regexp = /([0-9\.]+)|([ \t]+)|([\r\t]+)|(\*)|(\/)|(\+)|(\-)/g;

var dictionary = ["Number", "Whitespace", "LineTerminator", "*", "/", "+", "-"];

function tokenize(source) {
    var result = null;
    while(true) {
        result = regexp.exec(source);

        if (!result) break;

        for(let i = 1; i <= dictionary.length; i++) {
            if (result[i]) {
                console.log(dictionary[i-1]);
            }
        }
        console.log("result", result);
    }
}

tokenize("1024 + 10 * 25");