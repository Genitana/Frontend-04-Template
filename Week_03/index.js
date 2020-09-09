
let $ = Symbol("$");
class Trie{
    constructor(){
        this.root = Object.create(null);
    }

    /**
     * 生成字典树
     * 子节点下子节点的结构
     * @param {*} word 
     */
    insert(word){
        let node = this.root;
        for(let c of word){
            if(!node[c]){
                node[c] = Object.create(null);
            }
            node = node[c];
        }
        // 字符串结束时，在后面添加一个结束符
        if(!($ in node)){
            node[$] = 0;
        }
        node[$]++;
    }

    /**
     * 计算出现最多次数的Word
     */
    most(){
        let max = 0;
        let maxWord = null;
        let visit = (node, word) => {
            if (node[$] && node[$] > max) {
                max = node[$];
                maxWord = word;
            }
            for(let p in node) {
                visit(node[p], word + p);
            }
        }
        visit(this.root, "");
        console.log(maxWord, max);
    }
}

function randomWord(length){
    let s = "";
    for (let i = 0; i < length; i++) {
        s += String.fromCharCode(Math.random()*26 + "a".charCodeAt(0));
    }
    return s;
}

let trie = new Trie();
for (let i = 0; i < 10000; i++) {
    trie.insert(randomWord(4));
}