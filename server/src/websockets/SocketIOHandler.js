let chatModel = require('../models/ChatModel');

module.exports = class SocketIOHandler {
    // TO-DO restructure the code for socket IO

    constructor(io) {
        this.connections = [];

        let that = this;
        io.on('connection', function(socket) {
            let connectionIndex = that.connections.push(socket) - 1;
            process.stdout.write(`${new Date()} Connection accepted.\n`);

            socket.on('disconnect', function() {
                process.stdout.write(`${new Date()} Peer disconnected.\n`);
                that.connections.splice(connectionIndex, 1);
            });

            // user sent some message
            socket.on('message', function(message) {
                that.connections.forEach(function (clientConnection) {
                    clientConnection.emit('message', message);
                });
            });
        });
    }

    static isJsonString(str) {
        try {
            let json = JSON.parse(str);
            return (typeof json === 'object');
        } catch {
            return false;
        }
    }
}
