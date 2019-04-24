let GAuth = require('./GAuth');

let validator = function(req, res, next) {
    let uToken = req.headers.g_token;

    _googleTokenValidation(uToken, function(err, payload) {
        if (err) throw err;

        users.findUser(userID, function(err) {
            if (err) throw err;
            
            req.userID = payload.sub;
            req.userPayload = payload;

            next();
        });
    }).catch(function () {
        console.error;
        return res.sendStatus(401);
    });
};

let registrationValidator = function(req, res, next) {
    let uToken = req.headers.g_token;

    _googleTokenValidation(uToken, function(err, payload) {
        if (err) throw err;

        req.userPayload = payload;
        next();

    }).catch(function() {
        console.error;
        return res.sendStatus(401);
    });

};

let _googleTokenValidation = function(gToken, next) {
    GAuth.verify(gToken, function(userPayload) {
        process.stdout.write('validated user\n');
        next(null, userPayload);

    }).catch(function (err) {
        next(err);
    });
};

module.exports = {
    validator: validator,
    registrationValidator: registrationValidator
};
