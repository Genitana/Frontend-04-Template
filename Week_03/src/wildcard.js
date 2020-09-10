function find(source, pattern){

    // 统计pattern里的“*”号
    let startCount = 0;
    for(let i = 0;i < pattern.length; i++) {
        if(pattern[i] === "*")
            startCount++;
    }

    // 没有“*”号，需要一一匹配
    if(startCount === 0) {
        for(let i = 0; i < pattern.length; i++) {
            if(pattern[i] !== source[i] && pattern[i] !== "?")
                return false;
        }
        return;
    }

    // 处理第一个“*”号之前的部分
    let i = 0;  // pattern的位置
    let lastIndex = 0;  //source的位置
    for(i = 0; pattern[i] !== "*"; i++) {
        if(pattern[i] !== source[i] && pattern[i] !== "?")
            return false;
    }

    lastIndex = i;

    for(let p = 0; p < startCount - 1; p++) {
        i++;
        let subPattern = "";
        while(pattern[i] !== "*") {
            subPattern += pattern[i];
            i++;
        } 

        let reg = new RegExp(subPattern.replace(/\?/g, "[\\s\\S]"), "g"); //把？号替换成正则的语法
        reg.lastIndex = lastIndex; //接着前面找
        
        // console.log(reg.exec(source));
        if(!reg.exec(source))
            return false;
        
        lastIndex = reg.lastIndex;

        // 匹配尾部的部分，匹配最后一个“*”号后面的部分
        for(let j = 0; j <= source.length - lastIndex && pattern[pattern.length - j] !== "*"; j++){
            if(pattern[pattern.length - j] !== source[source.length - j]
                && pattern[pattern.length - j] !== "?")
                return false;
        }
        return true;
    }
}

console.log(find("abcabcabxaac","a*b*bx*c"));
console.log(find("abcabcabxaac","a*b?*bx*c"));