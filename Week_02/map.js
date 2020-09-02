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

/**
 * 广度优先搜索
 * @param {*} map 地图
 * @param {*} start  开始搜寻的位置
 * @param {*} end  结束的位置
 * 
 * 如果把这里的push和shift改为push和pop,queue就变成了栈，整个算法就变成了深度优先搜索
 */
function path(map, start, end) {
    //这个集合，是所有搜索算法的灵魂，所有的搜索算法的差异部分其实完全就在于这个queue集合里面
    let queue = [start];

    function insert(x, y){

        // 等于100应该也是可以的
        if (x < 0 || x >=100 || y < 0 || y >= 100) {
            return;
        }
        if (map[y*100 + x]) {
            return;
        }
        //遍历过的标记为2
        map[y*100 + x] = 2;
        queue.push([x, y]);
    }

    while (queue.length > 0) {
        // 如果找到了end，则退出
        let [x, y] = queue.shift();
        console.log(x, y)
        if (x === end[0] && y === end[1]) {
            return true;
        }
        // 把上下左右的都加入queue
        insert(x+1, y);
        insert(x-1, y);
        insert(x, y+1);
        insert(x, y-1);

    }
    return false;
}