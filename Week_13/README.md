## 处理帧的3种方案
1. setInterval
2. setTimeout
3. requestAnimationFrame

一帧16ms

```
setInterval(()=>{}, 16);

let tick = () => {
    setTimeout(tick, 16);
}

let tick = () => {
    
    requestAnimationFrame(tick);
    
}

```