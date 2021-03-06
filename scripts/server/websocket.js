const WebSocket = require('ws');
const uuid = require("uuid");
const rooms = require("../rooms");

let roomInfo = {};

function initializeRooms() {
    rooms.keys.forEach(key=>{roomInfo[key]={name:rooms.name(key), status:roomInfo[key]?roomInfo[key].status:"offline"}}); 
}

initializeRooms();

rooms.watch.on("change", ()=>{
    console.log("Rooms Updated, re-init"); 
    initializeRooms();
    broadcastToMonitors(initializationMessage());
});
 
const WebSocketServer = new WebSocket.Server({ noServer: true });

function initializationMessage() {
    return JSON.stringify({action:"initialize", rooms:rooms.keys, roomInfo:roomInfo});
}

function broadcastToMonitors(data) {
    console.log("Broadcasting", data);

    WebSocketServer.clients.forEach(client => {
        if (client.info.type === "monitor" && client.readyState === WebSocket.OPEN) {
        client.send(data);
        }
    });
}

function sendUpdateToMonitors(key) {
    let update = {};
    update.action = "update";
    update.room = key;
    update.roomInfo = roomInfo[key];
    const data = JSON.stringify(update);
    broadcastToMonitors(data);
}

WebSocketServer.on('connection', ws => {
    console.log(`${Date()}: Connection Opened`);
    ws.id = uuid.v4();
    ws.info = {type:"new"};
    
    ws.on('message', data =>{
        data = data.toString();
        const {action, status, key, ...message} = JSON.parse(data);

        console.log(`${Date()}: Message Received`, data);
        
        if(action === "identify") {
            ws.info = {...ws.info, ...message};
            if(message.type === "monitor") {
                //Send initial status of rooms
                const data = initializationMessage();
                console.log(`Initializing monitor<${ws.id}> `,data)
                ws.send(data);
            }
            else if(message.type === "room") {
                //check if key is valid
                if(!rooms.keys.includes(key)) {
                    ws.key = false
                    ws.send(JSON.stringify({error:`${key} does not exist`, errorType:"badkey"}));
                    ws.terminate()
                }
                else {
                    ws.key = key;
                    roomInfo[key].status = status;
                    sendUpdateToMonitors(key);
                }
            }
        }
        else if(action === "update" && ws.info.type === "room") {
            roomInfo[ws.key].status = message;

            sendUpdateToMonitors(ws.key);
        }
        else if(action === "add room") {
            try {
                rooms.add(message.name);
                ws.send(JSON.stringify({action:"add room", name:message.name, success:true}));
            }
            catch(e) {
                ws.send(JSON.stringify({action:"add room", name:message.name, error:e}));
                console.log(e);
            }
        }
        else if(action === "remove room") {
            try {
                rooms.remove(key);
                ws.send(JSON.stringify({action:"remove room", key:key, success:true}));
            }
            catch(e) {
                ws.send(JSON.stringify({action:"remove room", key:key, error:e}));
                console.log(e);
            }
        }
    });
    ws.on('close', (code, reason) => {
        if(ws.info.type === "room" && ws.key) {
        roomInfo[ws.key].status = "Offline";
        }
        console.log(`${Date()}: Connection Closed`, code, reason);
    });
});

exports.WebSocketServer = WebSocketServer;