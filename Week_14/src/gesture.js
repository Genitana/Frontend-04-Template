
let element  = document.documentElement;

let isListeningMouse =  false;

element.addEventListener("mousedown", event => {

    /** event.button表示鼠标按下的是哪个键，左键：0，右键：2，中键：1  */

    let context = Object.create(null);

    /**
     * (1 << event.button) 表示1移button位，则(1 << event.button)的值会是1，2，4，8...
     * 因为mousemove的event.buttons是掩码，0b00001这种格式的，这样的key可以让mousemove的时候好取一些
     */

    contexts.set("mouse" + (1 << event.button), context);  

    start(event, context);

    let mousemove = event => {
        let button = 1;
        // event.buttons是掩码, 按下的是左键会是ob00001; 右键会是0b00010;
        while (button <= event.buttons) {
            
            if (button & event.buttons) { //&一下，当键按下时，在去move()
                
                // 注意：event.buttons的中键和右键的顺序是反的
                let key;
                if (button === 2) 
                    key = 4;
                else if (button === 4)
                    key = 2;
                else 
                    key = button;
    
                let context = contexts.get("mouse" + key);
                move(event, context);
            }

            button = button << 1;
        }
    }

    let mouseup = event => {
        console.log('end', event.button);
        let context = contexts.get("mouse" + (1 << event.button));
        end(event, context);
        contexts.delete("mouse" + (1 << event.button)); // 结束后删除context

        // 没有按键了再取消监听事件
        if (event.buttons === 0) {
            element.removeEventListener("mousemove", mousemove);
            element.removeEventListener("mouseup", mouseup);
            isListeningMouse = false;
        }
    }

    // 没有监听，则绑定mousemove和mouseup监听事件；如果已经在监听，则不要重复绑定
    if (!isListeningMouse) {
        element.addEventListener("mousemove", mousemove);
        element.addEventListener("mouseup", mouseup);

        isListeningMouse = true;
    }

});

let contexts = new Map(); // 用一个map来保存context

// touch系列的事件跟mouse系列的事件不一样，touch的move跟start一定是触发在同一个元素上的
element.addEventListener("touchstart", event => {
     //changedTouches里可以有多个触点
    for(let touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        start(touch, context);
    }
});

element.addEventListener("touchmove", event => {
    for(let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        move(touch, context);    
    }
});

element.addEventListener("touchend", event => {
    for(let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        end(touch, context);   
 
        contexts.delete(touch.identifier); // 结束的时候要删除context
     }
});

// touchcancel和touchend的区别是，touchcancel表示touch点的序列是以一个异常的模式结束的
element.addEventListener("touchcancel", event => {
    for(let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        cancel(touch, context);

        contexts.delete(touch.identifier); // 结束的时候要删除context
    }
});

/**
 * 从 start开始，如果超过0.5s就是press；如果移动距离超过10px就是pan；如果都没有就是tab
 */

// let handler;
// let startX, startY;
// let isPan = false, isTap = true, isPress = false;

let start = (point, context) => {    

    context.startX = point.clientX;
    context.startY = point.clientY;

    context.isTap = true;
    context.isPan = false;
    context.isPress = false;

    context.handler = setTimeout(() => {
        context.isTap = false;
        context.isPan = false;
        context.isPress = true;
        
        context.handler = null;
        console.log("press");
    }, 500);                   // 0.5s时间判断是否是press
}

let move = (point, context) => {
    let dx = point.clientX - context.startX, dy = point.clientY - context.startY; //x,y轴移动的距离

    // 是否移动了10px
    if(!context.isPan && dx ** 2 + dy ** 2 > 100) {
        context.isTap = false;
        context.isPan = true;            // 移动了10px再移回去也是要触发pan事件，设置isPan是为了这个，只要大于10，就置为true
        context.isPress = false;
        console.log("panstart");
        clearTimeout(context.handler);
    }
    
    if(context.isPan) {
        console.log(dx,dy);  
        console.log("pan");
    }
    // console.log("move",point.clientX, point.clientY);
}

let end = (point, context) => {
    if (context.isTap) {
        console.log("tap");
        clearTimeout(context.handler);
    }
    if(context.isPan) {
        console.log("panEnd");
    }
    if(context.isPress) {
        console.log("pressEnd");
    }
    // console.log("end", point.clientX, point.clientY);
    
}
let cancel = (point, context) => {
    clearTimeout(context.handler);
    console.log("cancel", point.clientX, point.clientY);

}