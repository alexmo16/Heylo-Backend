let chatroom = require('../services/chat/ChatRoom');

module.exports = class SocketIOHandler {
    // TO-DO restructure the code for socket IO, better structure

    constructor(io) {

        let that = this;
        io.on('connection', function(socket) {
            process.stdout.write(`${new Date()} Connection accepted.\n`);

            socket.on('disconnect', function() {
                process.stdout.write(`${new Date()} Peer disconnected.\n`);
            });

            socket.on('join', function(data, next) {
                chatroom.isUserInRoom(data.userID, data.room, function(err, isInRoom) {
                    if (err) {
                        process.stdout.write(err.message);
                        next(JSON.stringify(err));
                        return;
                    }

                    if (!isInRoom) {
                        err = new Error('This user is not allowed to join this room.\n');
                        process.stdout.write(`Error: ${err.message}`);
                        next(JSON.stringify(err));
                        return;
                    }
                    
                    socket.join(data.room);
                    process.stdout.write(`${data.userID} joined room ${data.room}\n`);
                    next();
                });
            });

            socket.on('leave', function(data, next) {
                if (data && data.room) {
                    if (socket.rooms[data.room]) {
                        socket.leave(data.room);
                    }
                } else {
                    err = new Error('A room was not specified.');
                    next(JSON.stringify(err));
                    return;
                }
                
            });

            // User sent some message
            socket.on('message', function(data, next) {
                // Check for data integrity and if the socket is allowed
                // to talk to the desired room.
                try {
                    console.log(data);
                    if (data && data.room && data.message) {
                        if (socket.rooms[data.room]) {
                            socket.to(data.room).emit('message', data.message);
                            next();
                        } else {
                            throw new Error('Access denied.');
                        }
                    } else {
                        throw new Error('cannot send your message.');   
                    }
                } catch (err) {
                    process.stdout.write(`Error: ${err.message}`);
                    next(JSON.stringify(err));
                    return;
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
