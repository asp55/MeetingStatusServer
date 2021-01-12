const fs = require('fs');
const uuid = require("uuid");
const util = require('util');

const roomsFile = "scripts/rooms/rooms.json";
let rooms = JSON.parse(fs.readFileSync(roomsFile));
let keys = Object.keys(rooms);

const roomWatcher = fs.watch(roomsFile);
roomWatcher.on("change", (e)=>{
    console.log("Update Rooms");
    rooms = JSON.parse(fs.readFileSync(roomsFile));
    keys = Object.keys(rooms);
    
});

module.exports = {
    room: rooms,
    keys: keys,
    watch: roomWatcher,
    name: function(key) {
        return rooms[key];
    },
    add: function (name) {
        const newkey = uuid.v5(name, "36873bda-ad21-4655-92fd-c71be19a4882");
        if(!keys.includes(newkey)) {
            rooms[newkey] = name;
            keys.push(newkey);
            fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));
            return newkey;
        }
        else {
            throw(`A room named "${name}" already exists`);
        }
    },
    remove: function(key) {
      if(keys.includes(key)) {
        const name = rooms[key];
        delete rooms[key];
        keys.splice(keys.indexOf(key),1);
        fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));
        return `${key} (${name}) removed`;
      }
      else {
        throw(`${key} does not exist`);
      }
    }
}