
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

/**
 * 从 start开始，如果超过0.5s就是press；如果移动距离超过10px就是pan；如果都没有就是tab
 */

let handler;
let startX, startY;
let isPan = false, isTap = true, isPress = false;

let start = (point) => {    

    startX = point.clientX;
    startY = point.clientY;

    isTap = true;
    isPan = false;
    isPress = false;

    handler = setTimeout(() => {
        isTap = false;
        isPan = false;
        isPress = true;
        
        handler = null;
        console.log("press");
    }, 500);                   // 0.5s时间判断是否是press
}

let move = (point) => {
    let dx = point.clientX - startX, dy = point.clientY - startY; //x,y轴移动的距离

    // 是否移动了10px
    if(!isPan && dx ** 2 + dy ** 2 > 100) {
        isTap = false;
        isPan = true;            // 移动了10px再移回去也是要触发pan事件，设置isPan是为了这个，只要大于10，就置为true
        isPress = false;
        console.log("panstart");
        clearTimeout(handler);
    }
    
    if(isPan) {
        console.log(dx,dy);  
        console.log("pan");
    }
    // console.log("move",point.clientX, point.clientY);
}

let end = (point) => {
    if (isTap) {
        console.log("tap");
        clearTimeout(handler);
    }
    if(isPan) {
        console.log("panEnd");
    }
    if(isPress) {
        console.log("pressEnd");
    }
    // console.log("end", point.clientX, point.clientY);
    
}
let cancel = (point) => {
    clearTimeout(handler);
    console.log("cancel", point.clientX, point.clientY);

}