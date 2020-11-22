function createElement(type,attributes, ...children){
    let element ; 

    //createElement("div", {id: "a"}) ,也可能是createElement(Div, {id: "a"})， Div是一个class
    if (typeof type === "string") {
        element = new ElementWrapper(type);
    }else {
        element = new type;
    }

    for(let name in attributes) {
        element.setAttribute(name, attributes[name]);
    } 

    for (let child of children) {
        //处理文本节点
        if (typeof child === "string") {
            child = new TextWrapper(child);
        }
        element.appendChild(child)
    }
    return element;
}

class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type);
    }
    setAttribute(name, value){
        this.root.setAttribute(name, value);
    }
    appendChild(child){
        // this.root.appendChild(child);  //这个child也是ElementWrapper类型的，不能直接appendChild(child)
        child.mountTo(this.root);
    }
    mountTo(parent){
        parent.appendChild(this.root);
    }
}
class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content);
    }
    setAttribute(name, value){
        this.root.setAttribute(name, value);
    }
    appendChild(child){
        // this.root.appendChild(child);  //这个child也是ElementWrapper类型的，不能直接appendChild(child)
        child.mountTo(this.root);
    }
    mountTo(parent){
        parent.appendChild(this.root);
    }
}

class Div{
    constructor(){
        this.root = document.createElement("div");

    }
    setAttribute(name, value){
        this.root.setAttribute(name, value);
    }
    appendChild(child){
        child.mountTo(this.root);
    }

    mountTo(parent){

        parent.appendChild(this.root);
    }
}

let a  = <div id="a">
    hello,world
    <span>a</span>
    <span>b</span>
    <span></span>
</div>

// document.body.appendChild(a);

a.mountTo(document.body);