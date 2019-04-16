let chatroom = require('../services/chat/ChatRoom');

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

            socket.on('join', function(data, next) {
                chatroom.isUserInRoom(data.userID, data.room, function(err, isInRoom) {
                    if (err) {
                        next(JSON.stringify(err));
                        return;
                    }

                    if (!isInRoom) {
                        err = new Error('This user is not allowed to join this room.');
                        next(JSON.stringify(err));
                        return;
                    }
                    
                    socket.join(data.room);
                    next();
                });
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
