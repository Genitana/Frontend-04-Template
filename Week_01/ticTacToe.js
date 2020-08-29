let pattern = [
    2,1,0,
    0,0,0,
    0,0,0
];
let color = 1;
function show() {
    let board = document.getElementById("board");
    board.innerHTML = "";

    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            var cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerText = 
                pattern[i*3 +j] === 2 ? "❌" :
                pattern[i*3 +j] === 1 ? "⭕️" : "";
            cell.addEventListener("click", ()=> move(j, i))    
            board.appendChild(cell);
        }
        board.appendChild(document.createElement("br"));
    }
}

function move(x, y) {
    pattern[y*3 +x] = color;
    if (check(pattern, color)){
        alert(color === 2 ? "❌ is winner !" : "⭕️ is winner !")
    }
    color = 3 - color;
    show();
    if (willWin(pattern, color)) {
        console.log(color === 2 ? "❌ will win !" : "⭕️ will win !")
    }
}

function check(pattern, color) {
    // 横向 
    for (let i = 0; i < 3; i++) {
        let win = true;
        for(let j = 0; j < 3; j++) {
            if (pattern[i*3 + j] !== color) {
                win = false;
            }
        }
        if (win) {
            return true;
        }
    }
    // 纵向
    for (let i = 0; i < 3; i++) {
        let win = true;
        for (let j = 0; j < 3; j++) {
            if (pattern[j*3 +i] !== color) {
                win = false;
            }
        }
        if (win) {
            return true;
        }
    }
    // 左斜线
    {
        let win = true;
        for (let i = 0; i < 3; i++) {
            if (pattern[i*3 +i] !== color) {
                win = false;
            }
        }
        if (win) {
            return true;
        }
    }
    
    // 右斜线
    {
        let win = true;
        for (let i = 0; i < 3; i++) {
            if (pattern[i*3 + 2 - i] !== color) {
                win = false;
            }
        }
        if(win) {
            return true;
        }
    }
}

function clone(pattern) {
    return JSON.parse(JSON.stringify(pattern));
}

function willWin(pattern, color){
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++) {
            if(pattern[i*3 +j]) {
                continue;
            }
            let tmp =  clone(pattern);
            tmp[i*3 +j] = color;
            if (check(tmp, color)) {
                return [j, i];
            }
        }
    } 
    return null;
}

/**
* 找出最好的步骤
*  1:赢，0：和局，-1：输
*/
function bestChoice(pattern, color){
    let p ;
    if (p = willWin(pattern, color)) {
        return {
            point: p,
            result: 1,
        }
    }
    let result = -2;
    let point = null;
    for (let i = 0; i< 3;i++){
        for (let j = 0;j<3;j++){
            if(pattern[i*3 + j]){
                continue;
            }
            let tmp = clone(pattern);
            tmp[i*3 + j] = color;
            // 测试对手的棋是好是坏
            let r = bestChoice(tmp, 3 - color).result;
            //对手的棋很坏，则说明我方下得好
            if (-r > result) {
                result = -r;
                point = [j,i];
            }
        }
    }
    return {
        point: point,
        result: point ? result: 0,
    }
}

show();
console.log("最好的结果：",bestChoice(pattern,color));