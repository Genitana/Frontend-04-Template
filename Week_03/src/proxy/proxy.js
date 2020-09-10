let callbacks = [];
let  object = {
    a: 1,
    b: 2,
}

// 对 po设置属性就会触发操作，对不存在的属性设置值也会触发，对object操作不会
let po = reactive(object)
effect(() => console.log("callback,", po.a));

function effect(callback) {
    callbacks.push(callback);
}

function reactive(object) {
    return new Proxy(object, {
                set(obj, prop, val){
                    obj[prop] = val;
                    for(let callback of callbacks){
                        callback();
                    }
                    return obj[prop];
                },
                get(obj, prop){
                    console.log("proxy get",obj[prop])
                    return obj[prop];
                }
    })
}