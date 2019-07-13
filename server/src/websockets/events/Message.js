module.exports = function(socket, data, next) {
    // Check for data integrity and if the socket is allowed
    // to talk to the desired room.
    try {
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
        process.stdout.write(`Error: ${err.message}\n`);
        next(JSON.stringify(err));
        return;
    }            
};
