let GAuth = require('./GAuth');
let HeyloAuth = require('./HeyloAuth');
let users = require('../services/users/Users');
let httpError = require('../utils/HttpError');

/**
 * Function which validate if the user doing the request is allowed to talk to the server.
 * The function will know if the token currently use is from us or from a
 * 3rd party authentification system supported by our server.
 * @param {Object} req - req object from Express framework.
 * @param {Object} res - res object from Express framework.
 * @param {Function} next - Callback function
 */
let validator = function (req, res, next) {
    let token = req.headers.g_token;
    if (token) {
        GAuth.verify(token, function (payload) {
            let userID = payload.sub;

            users.findUserByID(userID, function (err) {
                if (err) {
                    let error = Error('Unauthorized');
                    error.status = httpError.UNAUTHORIZED;
                    return next(error);
                }

                req.user = {
                    userID: userID,
                    userPayload: payload,
                    registeredBy: 'GOOGLE'
                };
                process.stdout.write('validated user\n');
                return next();
            });
        }).catch(function (err) {
            process.stdout.write(`${err.message}\n`);
            let error = Error('Unauthorized');
            error.status = httpError.UNAUTHORIZED;
            return next(error);
        });
    } else {
        token = req.headers.h_token;
        if (token) {
            HeyloAuth.verify(token, function (err, payload) {
                if (err) {
                    let error = Error('Unauthorized');
                    error.status = httpError.UNAUTHORIZED;
                    return next(error);
                }

                process.stdout.write('validated user\n');
                req.user = {
                    userID: payload.user_id,
                    userPayload: payload,
                    registeredBy: 'HEYLO'
                };
                return next();
            });
        } else {
            let error = Error('Unauthorized');
            error.status = httpError.UNAUTHORIZED;
            return next(error);
        }
    }
};


/**
 * Custom validatior for the registration route, all others routes shall call the default validator function.
 * @param {Object} req - req object from Express framework.
 * @param {Object} res - res object from Express framework.
 * @param {Function} next - Callback function
 */
let registrationValidator = function (req, res, next) {
    let token = req.headers.g_token;

    if (token) {
        GAuth.verify(token, function (payload) {
            let userID = payload.sub;
            req.user = {
                userID: userID,
                userPayload: payload,
                registeredBy: 'GOOGLE'
            };
            return next();

        }).catch(function (err) {
            return next(httpError.UNAUTHORIZED);
        });
    } else {
        req.user = {};
        return next();
    }

};

module.exports = {
    validator: validator,
    registrationValidator: registrationValidator
};
