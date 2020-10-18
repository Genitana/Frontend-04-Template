const net   = require('net');
const parser = require("../../Week_07/src/parser.js");
var CircularJSON = require('circular-json');

class Request{
    constructor(options){
        this.method = options.method || "GET";
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || "/";
        this.body = options.body || {};
        this.headers = options.headers || {};
        //Content-Type是必须的
        if(!this.headers["Content-Type"]){
            this.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        if(this.headers["Content-Type"] === "application/json") {
            this.bodyText = JSON.stringify(this.body);
        }else if(this.headers["Content-Type"] === "application/x-www-form-urlencoded"){
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join("&");
        }
        this.headers["Content-Length"] = this.bodyText.length;
    }

    send(connection){
        console.log('send function...');
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;
            
            //支持已有的connection和新建connection
            if(connection) {
                connection.write(this.toString());
            }else {
                //用net库自己创建连接
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString());
                });
            }
            connection.on("data", (data) => {
                console.log('client on(data):', data.toString());
                
                //收到数据后传给parser
                parser.receive(data.toString());

                //根据parser的状态resolve Promise
                if(parser.isFinished){
                    resolve(parser.response);
                    connection.end();
                }
            });
            connection.on("error", (error) => {
                console.error("client error:", error);
                reject(error);
                connection.end();
            });

        });
    }

    /**
     * 转成HTTP request 的格式，即 请求行、headers、body
     */
    toString(){
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
    }
}

class ResponseParser{
    constructor(){
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1; //\r\n后，status line结束，后面就是headers了
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;    //header name冒号后面的空格
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6; //headers后的空行
        this.WAITING_BODY = 7;
        
        this.current = this.WAITING_STATUS_LINE;  
        this.statusLine = "";
        this.headers = {};
        this.headerName = "";
        this.headerValue = "";
        this.bodyParser = null;
    }
    get isFinished(){
        return this.bodyParser && this.bodyParser.isFinished;
    }

    get response(){
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        };
    }

    receive(string){
        for(let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }
    receiveChar(char){
        if(this.current ===  this.WAITING_STATUS_LINE) {
            if("\r" === char) {
                this.current = this.WAITING_STATUS_LINE_END;
            }else {
                this.statusLine += char; 
            }
        }else if(this.current === this.WAITING_STATUS_LINE_END) {
            if("\n" === char) {
                this.current = this.WAITING_HEADER_NAME; // \r\n，意味着status line结束了
            }
        }else if(this.current === this.WAITING_HEADER_NAME) {
            if(":" === char) { // 等冒号
                this.current = this.WAITING_HEADER_SPACE;
            }else if("\r" === char) { 
                // 如果是\r，说明是空行，说明所有的header已经结束了，进入到WAITING_HEADER_BLOCK_END状态
                this.current = this.WAITING_HEADER_BLOCK_END;
                //node默认的Transfer-Encoding是chunked
                if(this.headers["Transfer-Encoding"] === "chunked"){
                    this.bodyParser = new TrunkedBodyParser();
                }
            }else {
                this.headerName += char;
            }
        }else if(this.current === this.WAITING_HEADER_SPACE) {
            if(" " === char) {
                this.current = this.WAITING_HEADER_VALUE;
            }
        }else if(this.current ===  this.WAITING_HEADER_VALUE){
            if("\r" === char) {
                this.current = this.WAITING_HEADER_LINE_END;
                // 把这一行的header存到headers里
                this.headers[this.headerName] = this.headerValue;
                this.headerName = "";
                this.headerValue = ""
            }else {
                this.headerValue += char;
            }
        }else if(this.current === this.WAITING_HEADER_LINE_END) {
            if("\n" === char) {
                this.current = this.WAITING_HEADER_NAME; //这一行的header结束，到下一行
            }
        }else if(this.current === this.WAITING_HEADER_BLOCK_END) {
            if("\n" === char) {
                this.current = this.WAITING_BODY;
            }
        }else if(this.current === this.WAITING_BODY){
            this.bodyParser.receiveChar(char);
        }
    }
}

class TrunkedBodyParser{
    constructor(){
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_LINE_END = 1;
        this.READING_TRUNK = 2;
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;

        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.current = this.WAITING_LENGTH;
    }
    receiveChar(char){
        if(this.current ===  this.WAITING_LENGTH){
            if("\r" ===  char) {
                if(this.length === 0) {
                    this.isFinished = true;
                }
                this.current = this.WAITING_LENGTH_LINE_END;
            }else {
                this.length *= 16;  //length是16进制的，乘以16，把最后一位空出来
                this.length += parseInt(char, 16);
            }
        }else if(this.current === this.WAITING_LENGTH_LINE_END){
            if("\n" === char) {
                this.current = this.READING_TRUNK;
            }
        }else if(this.current === this.READING_TRUNK) {
            this.content.push(char);
            this.length --;
            if(this.length === 0) {
                this.current = this.WAITING_NEW_LINE;
            }
        }else if(this.current === this.WAITING_NEW_LINE) {
            if("\r" === char) {
                this.current = this.WAITING_NEW_LINE_END;
            }
        }else if(this.current === this.WAITING_NEW_LINE_END){
            if("\n" === char){
                this.current = this.WAITING_LENGTH;
            }
        }
    }
}

void async function(){
    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        port: "8088",
        path: "/",
        headers: {
            ["X-Foo2"]: "customed"
        },
        body: {
            name: "robert"
        }
    });

    let response = await request.send();

    // console.log("response:", response);

    // 解析body部分
    let dom  = parser.parseHTML(response.body);

    // console.log(JSON.stringify(dom, null, "   "));
    console.log(CircularJSON.stringify(dom, null, "   "));
    
}();