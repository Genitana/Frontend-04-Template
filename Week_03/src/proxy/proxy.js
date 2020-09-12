let callbacks = new Map();
let useReactivities = [];

let  object = {
    a: 1,
    b: 2,
}

// 对 po设置属性就会触发操作，对不存在的属性设置值也会触发，对object操作不会
let po = reactive(object)
effect(() => console.log("callback,", po.a));

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

function reactive(object) {
    return new Proxy(object, {
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
                    console.log("proxy get",obj[prop]);
                    return obj[prop];
                }
    })
}