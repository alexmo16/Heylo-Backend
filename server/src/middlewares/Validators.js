let GAuth = require('./GAuth');
let HeyloAuth = require('./HeyloAuth');
let users = require('../services/users/Users');

let validator = function(req, res, next) {
    let token = req.headers.g_token;
    if (token) {
        GAuth.verify(token, function(payload) {
            let userID = payload.sub;

            users.findUserByID(userID, function(err) {
                if (err) throw err;
                
                req.userID = userID;
                req.userPayload = payload;
                process.stdout.write('validated user\n');
                return next();
            });
        }).catch(function (err) {
            process.stdout.write(`${err.message}\n`);
            return res.sendStatus(401);
        });
    } else {
        token = req.headers.h_token;
        if (token) {
            HeyloAuth.verify(token, function(err) {
                if (err) return res.sendStatus(401);
                
                process.stdout.write('validated user\n');
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
        GAuth.verify(token, function(userPayload) {
            req.userPayload = userPayload;
            return next();
    
        }).catch(function (err) {
            return res.sendStatus(401);
        });
    } else {
        return next();
    }

};

module.exports = {
    validator: validator,
    registrationValidator: registrationValidator
};
