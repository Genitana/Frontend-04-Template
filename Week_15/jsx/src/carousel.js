import  { Component }  from "./framework" ;
import {enableGesture} from  "./gesture.js";
import {Timeline,Animation} from  "./animation.js";
import {ease} from  "./ease.js";

export class Carousel extends Component{
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

        enableGesture(this.root);

        let timeline = new Timeline();
        timeline.start();

        let handler = null;

        let children = this.root.children;

        let position = 0;  // 记录当前显示的是第几张图片，下次移动鼠标时，需要从当前位置挪动

        let t = 0;
        let ax = 0; // 动画造成的x的位移，就是点击之前动画自己的位移

        this.root.addEventListener("start", event => {
            timeline.pause();
            clearInterval(handler);
            ax = 0;
            let progress = (Date.now() - t) / 1500; // 计算动画时间的进度， （当前时间 - 动画开始时间）/ 动画总的时长 ，这个就是动画播放的进度
            ax = ease(progress) * 500 - 500;
        });

        this.root.addEventListener("pan", event => {
            let x = event.clientX - event.startX - ax;
            let current = position - Math.round((x - x % 500) / 500);  //当前在屏幕上元素的位置
            for (let offset of [-1, 0, 1]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length; // 把-1变成3，-2变成2，-3变成1  // 处理可能出现负数的情况，pos可能为负数，对pos先用children.length取余，然后加上children.length，结果一定为正
                children[pos].style.transition = "none";
                children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
            }
        })

        this.root.addEventListener("end", event => {

            timeline.reset();
            timeline.start();
            handler = setInterval(nextPicture, 3000); 
            
            let x = event.clientX - event.startX - ax;
            let current = position - Math.round((x - x % 500) / 500);  //当前在屏幕上元素的位置

            let direction = Math.random((x % 500) / 500);  // -1, 0 ,1 这样的值
            
            if (event.isFlick){
                if(event.velocity < 0) {
                    direction = Math.ceil((x % 500) / 500); 
                }else {
                    direction = Math.floor((x % 500) / 500); 

                }
            }

            for (let offset of [-1, 0, 1]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length; // 把-1变成3，-2变成2，-3变成1  // 处理可能出现负数的情况，pos可能为负数，对pos先用children.length取余，然后加上children.length，结果一定为正
                children[pos].style.transition = "none";

                timeline.add(new Animation(children[pos].style, "transform",
                     - pos * 500 + offset * 500 + x % 500, 
                     - pos * 500 + offset * 500 + direction * 500, 
                     500, 0, ease, v => `translateX(${v}px)`));

            }

            position = position - ((x - x % 500) / 500) - direction;
            position = (position % children.length + children.length) % children.length
        })


       let nextPicture = () => {
            let children = this.root.children;

            let nextIndex = (position + 1) % children.length;

            let current = children[position];
            let next = children[nextIndex];

            t = Date.now();

            timeline.add(new Animation(current.style, "transform", - position * 500, -500 - position * 500, 500, 0, ease, v => `translateX(${v}px)`));
            timeline.add(new Animation(next.style, "transform", - position * 500, -500 - position * 500, 500, 0, ease, v => `translateX(${v}px)`));

            position = nextIndex;
    }

        handler = setInterval(nextPicture, 3000); 

        return this.root;
    }
    mountTo(parent) {
        parent.appendChild(this.render());
    }
}