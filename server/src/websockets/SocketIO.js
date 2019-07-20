let handleDisconnection = require('./events/Disconnection');
let handleJoin = require('./events/JoinRoom');
let handleQuit = require('./events/QuitRoom');
let handleMessage = require('./events/Message');
let validators = require('../middlewares/Validators');
let httpError = require('../utils/HttpError');

module.exports = class SocketIO {
    constructor(io) {

        let that = this;
        io.use(function (socket, next) {
            if (socket && socket.handshake ) {
                validators.validator( socket.handshake, null, function(err) {
                    if (err && err.status == httpError.UNAUTHORIZED ) return next(err);
                    console.log(socket.handshake.user);
                    return next();
                });
            } else {
                let error = new Error('Something went wrong...');
                next(error);
            }
        });

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
