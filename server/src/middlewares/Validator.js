let GAuth = require('./GAuth');

let validator = function(req, res, next) {
    let uToken = req.headers.g_token;
    GAuth.verify(uToken, function(userPayload) {
        process.stdout.write('validated user\n');
        req.user_payload = userPayload;
        next();
    }).catch(function () {
        console.error;
        return res.sendStatus(401);
    });
};

module.exports = validator;
