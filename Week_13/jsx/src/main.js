import  { Component,createElement }  from "./framework" ;


class Carousel extends Component{
    constructor(){
        super();
        this.attributes = Object.create(null);
    }
    setAttribute(name, value) {
        this.attributes[name] = value;
    }
    render() {
        this.root = document.createElement("div");
        this.root.classList.add("carousel");
        for (let record of this.attributes.src) {
            let child = document.createElement("div");
            child.style.backgroundImage = `url(${record})`;
            this.root.appendChild(child);
        }

        let position = 0;  // 记录当前显示的是第几张图片，下次移动鼠标时，需要从当前位置挪动

        this.root.addEventListener("mousedown", event => {
            let children = this.root.children;
            let startX = event.clientX; // mousedown的鼠标位置

            let move = event => {
                let x = event.clientX - startX; // 鼠标X轴方向上移动的距离

                let current = position - Math.round((x - x % 500) / 500);  //当前在屏幕上元素的位置

                for (let offset of [-1, 0, 1]) {
                    let pos = current + offset;
                    pos = (pos + children.length) % children.length; // 把-1变成3，-2变成2，-3变成1
                    children[pos].style.transition = "none";
                    children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
                }
            }

            let up = event => {
                let x = event.clientX - startX; 
                position = position - Math.round(x / 500);  // 图片拖够了一半，就显示下一张
                
                for (let offset of [0, - Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
                    let pos = position + offset;
                    pos = (pos + children.length) % children.length; // 把-1变成3，-2变成2，-3变成1
                    children[pos].style.transition = "";
                    children[pos].style.transform = `translateX(${- pos * 500 + offset * 500}px)`;
                }

                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
            }
            // 在document上监听mouse up和down，因为鼠标可能会移出图片
            document.addEventListener("mousemove", move) 
            document.addEventListener("mouseup", up);
        })
        /*
        let currentIndex = 0;
        setInterval(() => {
            let children = this.root.children;

            let nextIndex = (currentIndex + 1) % children.length;

            let current = children[currentIndex];
            let next = children[nextIndex];

            next.style.transition = "none";
            next.style.transform = `translateX(${100 - nextIndex * 100}%)`;

            setTimeout(() => {
                next.style.transition = "";
                current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
                next.style.transform = `translateX(${- nextIndex * 100}%)`;

                currentIndex = nextIndex;
            }, 16); // 16ms是浏览器里一帧的时间

        },3000); */

        return this.root;
    }
    mountTo(parent) {
        parent.appendChild(this.render());
    }
}

let d = [
"https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
"https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
"https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
"https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg"
]
// document.body.appendChild(a);

let  a = <Carousel src={d}/>

a.mountTo(document.body);