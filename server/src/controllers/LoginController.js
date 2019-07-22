let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');
let {validationResult, body} = require('express-validator');

let users = require('../services/users/Users');
let utils = require('../utils/Utils');
let httpError = require('../utils/HttpError');
let validators = require('../middlewares/Validators');

/**
 * Validate inputs for the LoginController.
 * @param {String} method methods name to validate inputs */
let __validate = function (method) {
    switch (method) {
        case 'login': {
            return [
                body('email', `email doesn't exists`).exists().not().isEmpty(),
                body('email', 'Invalid email').exists().isEmail().normalizeEmail(),
                body('password', `password doesn't exists`).exists().not().isEmpty(),
                body('password', 'Invalid password format').exists().isString().trim().escape(),
            ]
        }
    }
};

router.post('/login', __validate('login'), function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }

    if (req.headers.g_token) return res.sendStatus(httpError.FORBIDDEN);

    // This means the user already has a token, then we only validate this token.
    if (req.headers.h_token) {
        validators.validator(req, res, function(err) {
            if (err) return next(err);
            res.sendStatus(httpError.OK);
        });
    } else {
        let email = req.body.email;
        let password = req.body.password;
        users.findUserByEmail(email, function (err, user) {
            if (err) return next(err);

            if (!user.password) return res.sendStatus(httpError.FORBIDDEN);

            if (!user) return res.sendStatus(httpError.UNAUTHORIZED);

            bcrypt.compare(password, user.password, function (err, result) {
                if (err) return next(err);

                if (result) {
                    let jwt = utils.createToken({ email: user.email, user_id: user.user_id, ip: req.connection.remoteAddress });
                    return res.status(httpError.OK).json({ token: jwt });
                } else {
                    return res.sendStatus(httpError.UNAUTHORIZED);
                }
            });
        });
    }
});


module.exports = router;
