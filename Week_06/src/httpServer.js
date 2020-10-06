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
        response.setHeader("Content-Type", "text/html");
        response.setHeader("X-Foo", "bar");
        response.writeHead(200, {'Content-Type':'text/plain'});
        response.end(
`<html maaa=a >
<head>
    <style>
            body div #myid{
                width: 100px;
                background-color: #ff5000;
            }
            body div img{
                width: 30px;
                background-color: #ff1111;
            }
    </style>
</head>
<body>
    <div>
            <img id="myid"/>
            <img />
    </div>
</body>
</html>
`);
    });
}).listen(8088);

console.log('server started...');


// console.log( Buffer.concat([]).toString() );