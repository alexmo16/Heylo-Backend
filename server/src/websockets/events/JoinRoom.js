let chatroom = require('../../services/chat/ChatRoom');

module.exports = function (socket, data, next) {
    chatroom.isUserInRoom(data.userID, data.room, function (err, isInRoom) {
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

        if (!socket.rooms[data.room]) {
            socket.join(data.room);
            process.stdout.write(`${data.userID} joined room ${data.room}\n`);
            next();
        }
    });
};