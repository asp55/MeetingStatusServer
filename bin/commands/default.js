const uuid = require("uuid");
const http = require('http');
const url = require('url');
const fs = require('fs');

exports.command = "$0 [options]";

exports.describe = "the default command, starts the server";

exports.builder = {"p": { alias: "port", describe: "Port to run the server on", type: "number", default: 8080 }}

exports.handler = function (options) {

    const roomsFile = "private/rooms.json";
    let rooms = JSON.parse(fs.readFileSync(roomsFile));
    let roomKeys = Object.keys(rooms);
    let roomInfo = {};
    roomKeys.forEach(key=>{roomInfo[key]={name:rooms[key], status:"offline"}});

    const WebSocket = require('ws');

    console.log(`${Date()}: Server started`);


    const server = http.createServer((req, response) => {
    /*
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('okay');
    */
    fs.readFile("public/index.html", function(error, content) {
        if (error) {
        if(error.code == 'ENOENT'){
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end("404 Error", 'utf-8');
        }
        else {
            response.writeHead(500);
            response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            response.end(); 
        }
        }
        else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(content, 'utf-8');
        }
    });
    });
    const wss = new WebSocket.Server({ noServer: true/*port: options.port*/ });

    function sendUpdateToMonitors(key) {
    console.log("Broadcasting");

    let update = {};
    update.action = "update";
    update.room = key;
    update.roomInfo = roomInfo[key];
    const data = JSON.stringify(update);

    wss.clients.forEach(client => {
        console.log(client.info);
        if (client.info.type === "monitor" && client.readyState === WebSocket.OPEN) {
        client.send(data);
        }
    });
    }

    wss.on('connection', ws => {
    console.log(`${Date()}: Connection Opened`);
    ws.id = uuid.v4();
    ws.info = {type:"new"};
    console.log(ws.info)

    ws.on('message', data =>{
        data = data.toString();
        const {action, status, key, ...message} = JSON.parse(data);

        console.log(`${Date()}: Message Received`, data);
        
        if(action === "identify") {
        ws.info = {...ws.info, ...message};
        if(message.type === "monitor") {
            //Send initial status of rooms
            ws.send(JSON.stringify({action:"initialize", rooms:roomKeys, roomInfo:roomInfo}));
        }
        else if(message.type === "room") {
            //check if key is valid
            if(!roomKeys.includes(key)) {
            ws.key = false
            console.log("Invalid Key");
            ws.send(JSON.stringify({error:`${key} does not exist`, errorType:"badkey"}));
            ws.terminate()
            }
            else {
            ws.key = key;
            roomInfo[key].status = status;
            sendUpdateToMonitors(key);
            console.log("Valid Key");
            }
        }
        }
        else if(action === "update" && ws.info.type === "room") {
        roomInfo[ws.key].status = message;

        sendUpdateToMonitors(ws.key);
        }

        console.log(ws.info);
    });
    ws.on('close', (code, reason) => {
        if(ws.info.type === "room" && ws.key) {
        roomInfo[ws.key].status = "Offline";
        }
        console.log(`${Date()}: Connection Closed`, code, reason);
    });
    });


    server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
    });

    server.listen(options.port);
}