export function createElement(type,attributes, ...children){
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

export class Component {
    constructor() {
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

class ElementWrapper extends Component{
    constructor(type){
        this.root = document.createElement(type);
    }

}
class TextWrapper extends Component{
    constructor(content){
        this.root = document.createTextNode(content);
    }
}