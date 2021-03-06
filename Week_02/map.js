class Sorted {
    /**
     * @param {*} data 数组
     * @param {*} compare compare函数(能传compare函数是非常重要的)
     */
    constructor(data, compare){
        this.data = data.slice(); //slice()没有参数，实际上等于返回一个原数组的拷贝。
        this.compare = compare || ((a,b) => a - b);
    }
    take(){
        if (!this.data.length) {
            return; //如果data为空，返回undefined
        }
        let min = this.data[0];
        let minIndex = 0;
        for(let i = 1; i < this.data.length; i++) {
            if (this.compare(this.data[i], min) < 0){
                min = this.data[i];
                minIndex = i;
            }
        }
        // 把最后一个的值覆盖到最小的位置，然后把最后一个pop出去
        //min之前已经赋值了的
        this.data[minIndex] = this.data[this.data.length -1];
        this.data.pop();
        return min;
    }

    give(v){
        this.data.push(v);
    }
    get length(){
        return this.data.length;
    }

}

let map = localStorage["map"] ? JSON.parse(localStorage["map"]) : Array(10000).fill(0);
let container = document.getElementById("container");
for (let y = 0; y < 100 ; y++) {
    for( let x = 0; x < 100; x++) {

      let cell  = document.createElement("div");
      cell.classList.add("cell");
      
      if (map[y*100 + x] === 1) {
          cell.style.backgroundColor = "black";
      }
      cell.addEventListener("mouseover", () => {
          if(mousedown){
              if (clear) {
                map[y*100 + x] = 0;
                cell.style.backgroundColor = "";
            }else {
                map[y*100 + x] = 1;
                cell.style.backgroundColor = "black";
            }
          }
      })
      container.appendChild(cell);
    }
}

let mousedown = false;
let clear = false;
document.addEventListener("mousedown", e => {
    mousedown = true;
    // 鼠标是否按的是右键
    clear = (e.which === 3)
});
document.addEventListener("mouseup", () =>  mousedown = false);

//因为要使用右键，所以要把contextmenu事件preventDefault掉，不然会弹出菜单
document.addEventListener("contextmenu", e => e.preventDefault()); 

function sleep(milliseconds) {
    return new Promise(function (resolve){
        setTimeout(resolve, milliseconds);
    })
}

/**
 * 广度优先搜索
 * @param {*} map 地图
 * @param {*} start  开始搜寻的位置
 * @param {*} end  结束的位置
 * 
 * 如果把这里的push和shift改为push和pop,queue就变成了栈，整个算法就变成了深度优先搜索
 */
async function findPath(map, start, end) {
    
    //let queue = [start];//这个集合，是所有搜索算法的灵魂，所有的搜索算法的差异部分其实完全就在于这个queue集合里面
    let queue = new Sorted([start], (a, b) => distance(a) - distance(b));

    let table = Object.create(map);

    /**
     * 往队列里插入值
     * @param {*} pre 上一个的点的位置
     */
    async function insert(x, y, pre){
        // 等于100应该也是可以的
        if (x < 0 || x >=100 || y < 0 || y >= 100) {
            return;
        }
        if (table[y*100 + x]) {
            return;
        }
        // await sleep(10);
        container.children[y*100 + x].style.backgroundColor = "lightgreen";
        //遍历过的标记为2
        // map[y*100 + x] = 2;
        table[y*100 + x] = pre; //把前一个节点存起来
        queue.give([x, y]);
    }

    /**
     * 比较point跟end点之前的距离，因为只是比较大小，所以不用开根号算距离
     * @param {*} point 
     */
    function distance(point){
        return (point[0] - end[0]) ** 2 + (point[1] - end[1]) ** 2 ;
    }

    while (queue.length) {
        // 如果找到了end，则退出
        let [x, y] = queue.take();
        // console.log(x, y)
        if (x === end[0] && y === end[1]) { //找到终点
            let path = [];
            while(x !== start[0] || y !== start[1]) {
                path.push(map[y*100 +x]);
                [x,y] = table[y*100 + x];
                await sleep(30);
                container.children[y*100 + x].style.backgroundColor = "purple";
            }
            return path;
        }
        // 把上下左右的都加入queue
       await insert(x+1, y, [x,y]);
       await insert(x-1, y,[x,y]);
       await insert(x, y+1,[x,y]);
       await insert(x, y-1,[x,y]);
       //斜线
       await insert(x+1, y-1, [x,y]);
       await insert(x-1, y-1,[x,y]);
       await insert(x-1, y+1,[x,y]);
       await insert(x+1, y+1,[x,y]);

    }
    return null;
}