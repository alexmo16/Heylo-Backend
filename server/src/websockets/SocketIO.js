let handleDisconnection = require('./events/Disconnection');
let handleJoin = require('./events/JoinRoom');
let handleQuit = require('./events/QuitRoom');
let handleMessage = require('./events/Message');


module.exports = class SocketIO {
    constructor(io) {

        let that = this;
        io.on('connection', function (socket) {
            process.stdout.write(`${new Date()} Connection accepted.\n`);

            socket.on('disconnect', function () {
                handleDisconnection();
            });

            socket.on('quit', function (data, next) {
                handleQuit(socket, data, next);
            });

            socket.on('join', function (data, next) {
                handleJoin(socket, data, next);
            });

            // User sent some message
            socket.on('message', function (data, next) {
                handleMessage(socket, data, next);
            });
        });
    }


}
