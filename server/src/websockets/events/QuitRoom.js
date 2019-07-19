module.exports = function (socket, data, next) {
    if (data && data.room) {
        if (socket.rooms[data.room]) {
            socket.leave(data.room);
        }
    } else {
        err = new Error('A room was not specified.');
        next(JSON.stringify(err));
        return;
    }
};