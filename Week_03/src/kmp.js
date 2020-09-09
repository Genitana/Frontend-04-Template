function kmp(source, pattern){
    //计算table
    let table = new Array(pattern.length).fill(0);
    {
        let i = 1;
        let j = 0; //记录重复的次数
        while(i < pattern.length) {
            if(pattern[i] === pattern[j]) {
                ++j, ++i ;
                table[i] = j;
            }else {
                if(j > 0)
                    j = table[j];
                else {
                    i++;
                }    
            }
        }
    }
    {
        let i = 0, j = 0;
        while(i < source.length) {
            if(pattern[j] === source[i]) {
                ++i, ++j;
            }else {
                if(j > 0)
                    j = table[j];
                else
                    ++i;
            }
            if(j === pattern.length)
                return true;
        }
        return false;
    }
}

console.log(kmp("hello,world", "world"));