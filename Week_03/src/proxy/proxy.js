let callbacks = new Map();
let reactivities = new Map();

let useReactivities = [];

let  object = {
    r: 1,
    g: 2,
    b: 3,
}

// 对 po设置属性就会触发操作，对不存在的属性设置值也会触发，对object操作不会
let po = reactive(object);

effect(() => {
    document.getElementById("r").value = po.r;  //把数据绑定到界面（input框）
});
effect(() => {
    document.getElementById("g").value = po.g;
});
effect(() => {
    document.getElementById("b").value = po.b;
});

effect(() => {
    document.getElementById("color").style.backgroundColor = `rgb(${po.r},${po.g},${po.b})`;
});

//把界面的input框数据绑定到 绑定input事件，更新po的值
document.getElementById("r").addEventListener("input", event => po.r = event.target.value); 
document.getElementById("g").addEventListener("input", event => po.g = event.target.value);
document.getElementById("b").addEventListener("input", event => po.b = event.target.value);


function effect(callback) {
    // callbacks.push(callback);
    useReactivities = []; //先清空
    callback(); //在这里调用一下，如果用到了proxy的对象，get属性时会知道
    console.log(useReactivities);

    //reactivity是数组[obj,prop],是在get的时候设置的，所以reactivity[0]是obj,reactivity[1]是prop
    for(let reactivity of useReactivities){  
        if(!callbacks.has(reactivity[0])){
            callbacks.set(reactivity[0], new Map());
        }
        if(!callbacks.get(reactivity[0]).has(reactivity[1])){
            callbacks.get(reactivity[0]).set(reactivity[1], []);
        }
        callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
    }
}

/**
 * 生成代理对象
 * @param {*} object 
 */
function reactive(object) {
    if(reactivities.has(object)) {
        return reactivities.get(object);
    }
    let proxy =  new Proxy(object, {
                set(obj, prop, val){
                    obj[prop] = val;
                    if(callbacks.get(object) && callbacks.get(object).get(prop)){

                        for(let callback of callbacks.get(object).get(prop)){
                            callback();
                        }
                    }
                    return obj[prop];
                },
                get(obj, prop){
                    useReactivities.push([obj, prop]);
                    if(typeof obj[prop] === "object"){
                        return reactive(obj[prop]);
                    }
                    return obj[prop];
                }
    });
    reactivities.set(object, proxy); // 把生成的proxy对象存起来
    return proxy;
}