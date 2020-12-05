
let element  = document.documentElement;

element.addEventListener("mousedown", event => {

    start(event);

    let mousemove = event => {
        move(event);
    }

    let mouseup = event => {
        end(event);
        element.removeEventListener("mousemove", mousemove);
        element.removeEventListener("mouseup", mouseup);
    }

    element.addEventListener("mousemove", mousemove);
    element.addEventListener("mouseup", mouseup);


});

// touch系列的事件跟mouse系列的事件不一样，touch的move跟start一定是触发在同一个元素上的
element.addEventListener("touchstart", event => {
     //changedTouches里可以有多个触点
    for(let touch of event.changedTouches) {
        start(touch);
    }
});

element.addEventListener("touchmove", event => {
    for(let touch of event.changedTouches) {
        move(touch);    
    }
});

element.addEventListener("touchend", event => {
    for(let touch of event.changedTouches) {
        end(touch);   
     }
});

// touchcancel和touchend的区别是，touchcancel表示touch点的序列是以一个异常的模式结束的
element.addEventListener("touchcancel", event => {
    for(let touch of event.changedTouches) {
        cancel(touch);
    }
});

let start = (point) => {    
    console.log("start", point.clientX, point.clientY);
}
let move = (point) => {
    console.log("move", point.clientX, point.clientY);
    
}
let end = (point) => {
    console.log("end", point.clientX, point.clientY);
    
}
let cancel = (point) => {
    console.log("cancel", point.clientX, point.clientY);

}