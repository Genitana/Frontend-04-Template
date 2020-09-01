let map = localStorage["map"] ? JSON.parse(localStorage["map"]) : Array(200).fill(0);
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
document.addEventListener("contextmenu", e => e.preventDefault); 