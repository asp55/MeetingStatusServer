const fs = require('fs');
const uuid = require("uuid");
const roomsFile = "private/rooms.json";

exports.command = 'rooms <command>';

exports.describe = 'Room Management';

exports.builder = (yargs) => {
  yargs
  .command(
    "add <name>", 
    "Generate a room key", 
    function options(yargs) { 
      yargs
      .positional('name', {
        describe: 'a unique identifier for the room',
        type: 'string'
      });

      return yargs;
    }, 
    function handler(argv) {

      let rooms = JSON.parse(fs.readFileSync(roomsFile));
      let roomKeys = Object.keys(rooms);

      const key = uuid.v5(argv.name, "36873bda-ad21-4655-92fd-c71be19a4882");
      rooms[key] = argv.name;
      roomKeys.push(key);

      fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));
      console.log(key);
      process.exit(0);
    }
  )
  .command(
    "list", 
    "Show the list of rooms & keys", 
    function options(yargs) { 
    }, 
    function handler(argv) {
      let rooms = JSON.parse(fs.readFileSync(roomsFile));
      let roomKeys = Object.keys(rooms);

      roomKeys.forEach(key=>{
        console.log(`${key}\t${rooms[key]}`);
      })
      process.exit(0);
    }
  )
  .command(
    "remove <key>",
    "Remove a key",
    function options(yargs) {
      yargs
      .positional('key', {
        describe: 'the key for the room to remove',
        type: 'string'
      });

      return yargs;
    },
    function handler(argv) {
      let rooms = JSON.parse(fs.readFileSync(roomsFile));
      let roomKeys = Object.keys(rooms);

      const key = argv.key;
      if(roomKeys.includes(key)) {
        const name = rooms[key];
        delete rooms[key];
        roomKeys.splice(roomKeys.indexOf(key),1);
        console.log(`${key} (${name}) removed`);
        fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));
        process.exit(0);
      }
      else {
        console.error(`${key} does not exist`);
        process.exit(1);
      }
    }

  )
  return yargs;
}

exports.handler = function (argv) {
  // do something with argv.
}