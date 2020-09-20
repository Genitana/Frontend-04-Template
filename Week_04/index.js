function UTF8_Encoding(string) {
    //仅考虑3字节的情况 
    let codeList =[];
    for (let i = 0; i < string.length; i++) { 
        let c = string.charCodeAt(i) 
        if (c <= 0x7F) { 
            codeList.push(c)
        } else if (c <= 0x7FF) {
            codeList. push( (c >> 6) | 192) // 取前5位拼上 110(即 192 11000000) 
            codeList. push((c & 63) | 128) // 取后6位拼上 10(EP128 10000000)
        } else if (c <= OxFFFF) {
            codeList. push( (c >> 12)| 224) // 取前4位拼上 1110(gP224 11100000) 
            codeList.push(((c >> 6) & 63) | 128) // 取中间6位拼上 10(即 128 10000000) 
            codeList.push((c & 63) | 128) // 取后6位拼上 10
            return Buffer.from(codeList)
        }
    }
}

console.log(UTF8_Encoding("qw"));