const TICK = Symbol("tick");
const TICK_HANDLER = Symbol("tick-handler");
const ANIMATIONS = Symbol("animations");
const START_TIME = Symbol("start-time");
const PAUSE_START = Symbol("pause-start");
const PAUSE_TIME = Symbol("pause-time");

export class Timeline {
        constructor(){
            this[ANIMATIONS ] = new Set();
            this[START_TIME] = new Map();
        }
        start(){
            let startTime = Date.now();
            this[PAUSE_TIME] = 0;
            this[TICK] = () => {
                let now = Date.now();
                for(let animation of this[ANIMATIONS]) {
                    let t ;  // 运行了的时长

                    if(this[START_TIME].get(animation) < startTime)
                        t = now - startTime - this[PAUSE_TIME];  //要减掉暂停的时间
                    else 
                        t = now - this[START_TIME].get(animation) - this[PAUSE_TIME];

                    if (animation.duration < t) {  // 若运行的时长超过了设置的duration，则停止
                        this[ANIMATIONS].delete(animation);
                        t = animation.duration; //避免receive(time)的time超出duration的问题
                    }
                    animation.receive(t); 
                }
                this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
            }
            this[TICK]();
        }
        pause(){
            this[PAUSE_START] = Date.now(); //记录暂停开始时的时间
            cancelAnimationFrame(this[TICK_HANDLER]);
        }
        resume(){
            this[PAUSE_TIME] += Date.now() - this[PAUSE_START]; //暂停的时间
            this[TICK]();
        }
        reset (){}
        add (animation, startTime){
            if (arguments.length < 2) {
                startTime = Date.now();
            }
            this[ANIMATIONS].add(animation);
            this[START_TIME].set(animation, startTime);
        }
}

export class Animation {
    constructor(object, property, startValue, endValue, duration, delay, timingFunction,template) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.timingFunction = timingFunction;
        this.delay = delay;
        this.template = template;
    }

    receive(time) {
        let range = this.endValue - this.startValue;

        this.object[this.property] = this.template(this.startValue + range * time / this.duration);
    }
}