let chatModel = require('../models/ChatModel');

class websocketHandler {
    // TO-DO restructure the code for socket IO

    constructor(io) {
        this.io = io;
        this.connections = [];

        let that = this;
        io.on('connection', function(socket) {
            let connection = request.accept('echo-protocol', request.origin);
            let connectionIndex = that.connections.push(connection) - 1;
            process.stdout.write(`${new Date()} Connection accepted.\n`);

            connection.on('disconnect', function() {
                process.stdout.write(`${new Date()} Peer disconnected.`);
                that.connections.splice(connectionIndex, 1);
            });

            // user sent some message
            connection.on('message', function(message) {
                if (message.type === 'utf8') { // accept only text
                    let receivedObject = JSON.parse(message.utf8Data);

                    if (this.isJsonString(receivedObject)) {

                        let chatId = receivedObject.chatId;
                        chatModel.findById(chatId, function(err, chat) {
                            if (err) return connection.close();
                        
                            if (chat) {
                                process.stdout.write(chat.users_ids);

                                // broadcast message to all connected clients
                                let json = JSON.stringify();
                                that.connections.forEach(function (clientConnection) {
                                    clientConnection.sendUTF(json);
                                });
                            }
                        });
                    }
                }
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

module.exports = websocketHandler;
