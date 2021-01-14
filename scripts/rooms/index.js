const fs = require('fs');
const uuid = require("uuid");
const util = require('util');


const roomsFile = "scripts/rooms/rooms.json";

class Rooms {
    constructor() {
        const loadVals = ()=>{
            this.rooms = JSON.parse(fs.readFileSync(roomsFile));
            this.keys = Object.keys(this.rooms);
        }

        loadVals();

        this.watch = fs.watch(roomsFile);
        this.watch.on("change", (e)=>{
            console.log("Update Rooms");
            loadVals();            
        });
    }

    add(name) {
        const newkey = uuid.v5(name, "36873bda-ad21-4655-92fd-c71be19a4882");
        if(!this.keys.includes(newkey)) {
            this.rooms[newkey] = name;
            this.keys.push(newkey);
            fs.writeFileSync(roomsFile, JSON.stringify(this.rooms, null, 2));
            return newkey;
        }
        else {
            throw(`A room named "${name}" already exists`);
        }
    }

    remove(key) {
        if(this.keys.includes(key)) {
            const name = this.rooms[key];
            delete this.rooms[key];
            this.keys.splice(this.keys.indexOf(key),1);
            fs.writeFileSync(roomsFile, JSON.stringify(this.rooms, null, 2));
            return `${key} (${name}) removed`;
        }
        else {
            throw(`${key} does not exist`);
        }
    }

    name(key) {
        return this.rooms[key];
    }
}

module.exports = new Rooms();