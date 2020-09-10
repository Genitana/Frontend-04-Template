let  object = {
    a: 1,
    b: 2,
}

// 对 po设置属性就会触发操作，对不存在的属性设置值也会触发，对object操作不会
let po = new Proxy(object, {
    set(obj, pro, val){
        console.log(obj, pro, val);
    }
})