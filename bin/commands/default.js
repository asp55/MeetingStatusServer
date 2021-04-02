exports.command = "$0 [options]";

exports.describe = "the default command, starts the server";

exports.builder = {"p": { alias: "port", describe: "Port to run the server on", type: "number" }}

exports.handler = function (options) {
    const server = require("../../scripts/server");
    server.start(options.port);
}