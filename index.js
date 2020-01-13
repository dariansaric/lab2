http = require('http');
fs = require('fs');

let html = fs.readFileSync('index.html');
// console.log(html.toString());
//create server object:
http.createServer(function (req, res) {
    res.status = 200;
    res.write(html);
    res.end();
}).listen(8080);
