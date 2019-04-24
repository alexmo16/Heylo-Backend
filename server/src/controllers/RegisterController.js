let express = require('express');
let router = express.Router();

let validators = require('../middlewares/Validators');
let users = require('../services/users/users');

// create a new user
router.post('/register', validators.registrationValidator, function(req, res, next) {
    if (!req.body.username) return res.sendStatus(400);
    if (!req.userPayload) return res.sendStatus(500);
    let userInfo = req.userPayload;
    if (!userInfo.family_name || !userInfo.given_name || !userInfo.sub) return res.status(500).json(`unable to get user's informations.`);

    let userData = {
        username: req.body.username,
        firstname: userInfo.given_name,
        lastname: userInfo.family_name,
        user_id: userInfo.sub
    };

    users.createUser(userData, function(err, newUser) {
        if (err)  {
            if (err.code === 409) {
                return res.status(err.code).json('this user already exists');
            } else {
                next(err);
                return;
            }
        }

        return res.status(201).json({
            username: newUser.username,
            firstName: newUser.firstname,
            lastName: newUser.lastname,
            creation_date: newUser.creation_date
        });
    });
});

module.exports = router;
