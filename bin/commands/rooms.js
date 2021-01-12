const rooms = require("../../scripts/rooms");

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
      try {
        const key = rooms.add(argv.name);
        console.log(key);
        process.exit(0);
      }
      catch(err) {
        console.error(err);
        process.exit(1);
      }
    }
  )
  .command(
    "list", 
    "Show the list of rooms & keys", 
    function options(yargs) { 
    }, 
    function handler(argv) {
      rooms.keys.forEach(key=>{
        console.log(`${key}\t${rooms.name(key)}`);
      });
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
      try {
        console.log(rooms.remove(argv.key));
        process.exit(0);
      }
      catch(err) {
        console.error(err);
        process.exit(1);
      }
    }

  )
  return yargs;
}

exports.handler = function (argv) {
  // do something with argv.
}