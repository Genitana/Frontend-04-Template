
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
        // dragable.style.transform = `translate(${baseX + event.clientX - startX}px, ${baseY + event.clientY - startY}px)`;

        let range = getNearest(event.clientX, event.clientY);
        range.insertNode(dragable); // 为什么不移除原来的？ 如果原来的已经在DOM树上，会默认移除
    };

    /**
     * mousemove的监听要写在dragable的"mousedown"事件里面，避免不必要的损耗
     * 用dragable监听可能会发生鼠标移动太快跑出目标区域之外，发生拖断的现象，所以要用document进行监听
     * 用document进行监听，在整个浏览器都能监听到
     */
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
})


// 用Range建一张能拖的表，把能插的空隙列出来

let ranges = [];
let container = document.getElementById("container");

// 我们要取到文本节点的文字的长度，所以取了childNodes[0]，然后取它的textContent，就得到里面的文字
for(let i = 0; i < container.childNodes[0].textContent.length; i++) {
    
    /**
     * container里面只有一个textNode,只有找到textNode,也就是它的childNodes[0]
     */
    let range = document.createRange();
    range.setStart(container.childNodes[0], i);
    range.setEnd(container.childNodes[0], i); 

    // range.getBoundingClientRect()拿到range的位置
    console.log(range.getBoundingClientRect());

    ranges.push(range);
}

/**
 * 从ranges里面找到离某个point最近的range
 */
function getNearest(x, y){
    let min = Infinity;
    let nearest = null;

    for(range of ranges){
        // BoundingClientRect是CSSOM，界面发生了变化，它也会发生变化；range是不会变的
        let rect = range.getBoundingClientRect(); 
        let distance = (rect.x  - x) ** 2 + (rect.y - y) ** 2;
        if (distance < min) {
            min = distance;
            nearest = range;
        }
    }
    return nearest;
}

document.addEventListener("selectstart", event => event.preventDefault());

/**
 * 本课主要是Range和CSSOM跟DOM API结合的一些应用 （Range也属于DOM API的一部分）
 * 我们要实现一些视觉效果，基本上都离不开CSSOM
 * 什么是CSSOM？
    CSSOM是CSS Object Model的缩写
    大体上来说，CSSOM是一个建立在web页面上的 CSS 样式的映射
    它和DOM类似，但是只针对CSS而不是HTML
    浏览器将DOM和CSSOM结合来渲染web页面
 */