let express = require('express');
let router = express.Router();
let uuidv4 = require('uuid/v4');
let path = require('path');
let { validationResult, body } = require('express-validator');

let validators = require('../middlewares/Validators');
let users = require('../services/users/users');
let utils = require('../utils/Utils');
let httpError = require('../utils/HttpError');

/**
 * Validate inputs for the RegisterController.
 * @param {String} method methods name to validate inputs */
let __validate = function (method) {
    switch (method) {
        case 'post': {
            return [
                body('email', 'Invalid body input').optional().normalizeEmail().isEmail(),
                body('password', 'Invalid body input').optional().isString().trim().escape(),
                body('username', 'Invalid body input').optional().isString().trim().escape(),
                body('firstname', 'Invalid body input').optional().isString().trim().escape(),
                body('lastname', 'Invalid body input').optional().isString().trim().escape(),
            ];
        }
    }
};


router.get('/register', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../../public', 'register.html'));
});


// create a new user
router.post('/register', validators.registrationValidator, __validate('post'), function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }

    let googleUserInfo = req.user.userPayload;
    if (googleUserInfo && (!googleUserInfo.family_name || !googleUserInfo.given_name || !googleUserInfo.sub)) return res.status(httpError.INTERNAL_SERVER_ERROR).json(`unable to get user's informations.`);

    if (!googleUserInfo) {
        if (!req.body.email || !req.body.password || !req.body.username || !req.body.firstname || !req.body.lastname) return res.sendStatus(httpError.BAD_REQUEST);
    }

    let userData = {
        username: googleUserInfo ? `${googleUserInfo.given_name} ${googleUserInfo.family_name}` : req.body.username,
        password: googleUserInfo ? null : req.body.password,
        email: googleUserInfo ? googleUserInfo.email : req.body.email,
        firstname: googleUserInfo && googleUserInfo.given_name ? googleUserInfo.given_name : req.body.firstname,
        lastname: googleUserInfo && googleUserInfo.family_name ? googleUserInfo.family_name : req.body.lastname,
        user_id: googleUserInfo && googleUserInfo.sub ? googleUserInfo.sub : uuidv4()
    };


    users.createUser(userData, function (err, newUser) {
        if (err) {
            return err.code === httpError.CONFLICT ? res.status(err.code).json('this user already exists, try again') : next(err);
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
            responseData.jwt = utils.createToken({ email: newUser.email, user_id: newUser.user_id, ip: req.connection.remoteAddress });
        }

        return res.status(httpError.CREATED).json(responseData);
    });
});


module.exports = router;
