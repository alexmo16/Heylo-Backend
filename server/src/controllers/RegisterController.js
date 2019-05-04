let express = require('express');
let router = express.Router();
let uuidv4 = require('uuid/v4');
let path = require('path');

let validators = require('../middlewares/Validators');
let users = require('../services/users/users');
let utils = require('../utils/Utils');

router.get('/register', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../../public', 'register.html'));
});

// create a new user
router.post('/register', validators.registrationValidator, function(req, res, next) {
    let googleUserInfo = req.userPayload;
    if (googleUserInfo && (!googleUserInfo.family_name || !googleUserInfo.given_name || !googleUserInfo.sub)) return res.status(500).json(`unable to get user's informations.`);

    if (!googleUserInfo) {
        if (!req.body.email || !req.body.password || !req.body.username || !req.body.firstname || !req.body.lastname) return res.sendStatus(400);
    }

    let userData = {
        username: googleUserInfo ? `${googleUserInfo.given_name} ${googleUserInfo.family_name}` : req.body.username,
        password: googleUserInfo ? null : req.body.password,
        email: googleUserInfo ? googleUserInfo.email : req.body.email,
        firstname: googleUserInfo && googleUserInfo.given_name ? googleUserInfo.given_name : req.body.firstname,
        lastname: googleUserInfo && googleUserInfo.family_name ? googleUserInfo.family_name : req.body.lastname,
        user_id: googleUserInfo && googleUserInfo.sub ? googleUserInfo.sub : uuidv4()
    };

    users.createUser(userData, function(err, newUser) {
        if (err)  {
            if (err.code === 409) {
                return res.status(err.code).json('this user already exists, try again');
            } else {
                return next(err);
            }
        }

        let responseData = {
            username: newUser.username,
            firstName: newUser.firstname,
            lastName: newUser.lastname,
            email: newUser.email,
            creation_date: newUser.creation_date
        };

        // This mean the user used our password system, so we need to create our own jwt.
        if (newUser.password) {
            responseData.jwt = utils.createToken({email: newUser.email, user_id: newUser.user_id});
        }

        return res.status(201).json(responseData);
    });
});

module.exports = router;
