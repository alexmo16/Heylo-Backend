let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');

let users = require('../services/users/Users');
let utils = require('../utils/Utils');
let httpError = require('../utils/HttpError');

router.post('/login', function (req, res, next) {
    if (req.headers.g_token) return res.sendStatus(httpError.FORBIDDEN);
    if (!req.body.email) return res.sendStatus(httpError.BAD_REQUEST);
    if (!req.body.password) return res.sendStatus(httpError.BAD_REQUEST);

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
});


module.exports = router;
