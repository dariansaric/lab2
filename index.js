const http = require('http');
const fs = require('fs');

let html = fs.readFileSync('index.html');
let js = fs.readFileSync('ws-client.js');
//create server object:
//todo : css??
http.createServer(function (req, res) {
    console.log(req.url);
    switch (req.url) {
        case "/":
        case "/index":
            res.status = 200;
            res.write(html);
            res.end();
            break;
        case "/ws-client.js":
            res.status = 200;
            res.write(js);
            res.end();
            break;
        default:
            res.status = 404;
            res.end();
    }
}).listen(8080);
// kada primim exit komandu, ubij server
process.stdin.on('data', data => {
    console.log('primio sam: %s', data);
    if (data === 'exit\n') {
        console.log("WARNING: prekidam rad servera...");
        process.exit();
    }

});
