let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');

let users = require('../services/users/Users');
let utils = require('../utils/Utils');

// TODO: re-think user login with userID.
router.post('/login', function(req, res, next) {
    if (req.headers.g_token) return res.sendStatus(403);

    console.log(req.body.email);

    if (!req.body.email) return res.sendStatus(400);
    if (!req.body.password) return res.sendStatus(400);

    let email = req.body.email;
    let password = req.body.password;
    users.findUserByEmail(email, function(err, user) {
        if (err) return next(err);

        if (!user.password) return res.sendStatus(403);

        if (!user) return res.sendStatus(401);

        bcrypt.compare(password, user.password, function(err, result) {
            if (err) return next(err);

            if (result) {
                let jwt = utils.createToken({email: user.email, user_id: user.user_id});
                return res.status(200).json({token: jwt});
            } else {
                return res.sendStatus(401);
            }
        });
    });
});

module.exports = router;
