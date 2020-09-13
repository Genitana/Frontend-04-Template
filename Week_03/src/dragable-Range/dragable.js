
let dragable = document.getElementById("dragable");

// 保存已有的translate值
let baseX = 0;
let baseY = 0;

dragable.addEventListener("mousedown", function(event){
    //鼠标点击的起始位置
    let startX = event.clientX;
    let startY = event.clientY;

    let up = (event) => {
        baseX = baseX + event.clientX - startX;
        baseY = baseY + event.clientY - startY;
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
    };

    let move = event => {
        // console.log(event)
        // 用transform的translate实现拖移
        dragable.style.transform = `translate(${baseX + event.clientX - startX}px, ${baseY + event.clientY - startY}px)`;
    };

    /**
     * mousemove的监听要写在dragable的"mousedown"事件里面，避免不必要的损耗
     * 用dragable监听可能会发生鼠标移动太快跑出目标区域之外，发生拖断的现象，所以要用document进行监听
     * 用document进行监听，在整个浏览器都能监听到
     */
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
})