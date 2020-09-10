let  object = {
    a: 1,
    b: 2,
}

// 对 po设置属性就会触发操作，对不存在的属性设置值也会触发，对object操作不会
let po = new Proxy(object, {
    set(obj, prop, val){
        console.log(obj, prop, val);
    }
})

function reactive(object) {
    return new Proxy(object, {
                set(obj, prop, val){
                    obj[prop] = val;
                    console.log(obj, prop, val);
                    return obj[prop];
                },
                get(obj, prop){
                    console.log("proxy get",obj[prop])
                    return obj[prop];
                }
    })
}
let  object2 = {
    a: 1,
    b: 2,
}
let po2 = reactive(object2);