const http = require('http');

http.createServer((request, response) => {
    let body = [];
    let bodyText = "";
    request.on('error', (error) => {
        console.error(error);
    }).on('data', (chunk) => {
        console.log('on data:', chunk.toString());
        body.push(chunk.toString());
    }).on('end', () => {
        console.log('on end, body:', body);
        // body = Buffer.concat(body).toString(); // 这里是有问题的，Buffer.concat()的api的入参类型是list: Uint8Array[],而这里body里面是string，会报错
        body.forEach(element => bodyText =  bodyText + element.toString());
        console.log("body:", bodyText);
        response.writeHead(200, {'Content-Type':'text/html'});
        response.end('hello world \n!');
    });
}).listen(8088);

console.log('server started...');


// console.log( Buffer.concat([]).toString() );