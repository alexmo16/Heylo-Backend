let GAuth = require('./GAuth');
let HeyloAuth = require('./HeyloAuth');

let validator = function(req, res, next) {
    let token = req.headers.g_token;
    if (token) {
        _googleTokenValidation(token, function(err, payload) {
            if (err) throw err;
    
            users.findUserByID(userID, function(err) {
                if (err) throw err;
                
                req.userID = payload.sub;
                req.userPayload = payload;
    
                return next();
            });
        }).catch(function () {
            return res.sendStatus(401);
        });

    } else {
        token = req.headers.h_token;

        if (token) {
            HeyloAuth.verify(token, function(err) {
                if (err) {
                    return res.sendStatus(401);
                }

                return next();
            });
        } else {
            return res.sendStatus(401);
        }
    }
};

let registrationValidator = function(req, res, next) {
    let token = req.headers.g_token;

    if (token) {
        _googleTokenValidation(token, function(err, payload) {
            if (err) throw err;

            req.userPayload = payload;
            return next();

        }).catch(function() {
            console.error;
            return res.sendStatus(401);
        });
    } else {
        return next();
    }

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
