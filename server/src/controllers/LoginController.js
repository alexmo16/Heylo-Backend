let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');

let users = require('../services/users/Users');
let utils = require('../utils/Utils');

// TODO: re-think user login with userID.
router.get('/login', function(req, res, next) {
    if (!req.query.email) return res.sendStatus(500);
    if (!req.query.password) return res.sendStatus(400);

    let email = req.query.email;
    let password = req.query.password;
    users.findUserByEmail(email, function(err, user) {
        if (err) return next(err);

        if (!user) return res.sendStatus(401);

        bcrypt.compare(password, user.password, function(err, result) {
            if (err) return next(err);

            if (result) {
                let jwt = utils.createToken();
                return res.status(200).json({token: jwt});
            } else {
                return res.sendStatus(401);
            }
        });
    });
});

module.exports = router;
