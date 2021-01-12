const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');  

const wss = require("./websocket").WebSocketServer;

const server = http.createServer((request, response) => {


    const contentTypes = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpg",
    }

    const return404 = (msg="") => {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end(`404: cannot find ${requestURL.pathname}${msg}`, 'utf-8');
    }

    const requestURL = new URL(request.url, "http://localhost");
    var filePath = 'public' + requestURL.pathname;
    console.log("Request", filePath);
    //if (filePath == 'public/') filePath = 'public/index.html';
    if(fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        if(!filePath.endsWith("/")) filePath += "/";

        const indexFile = filePath + "index.html"
        if (fs.existsSync(indexFile)) {
            filePath = indexFile;
        }
        else {
            return404();
        }
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                return404();
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end(); 
            }
        }
        else {
            const contentType = contentTypes[path.extname(filePath)] || "text/plain";
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});

server.on('upgrade', function upgrade(request, socket, head) {
    const requestURL = new URL(request.url, "ws://localhost");
    const pathname = requestURL.pathname;

    if (pathname === '/') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
    } else {
        socket.destroy();
    }
});


exports.start = function(port) {  
    console.log(`${Date()}: Server started`);
    server.listen(port);
}