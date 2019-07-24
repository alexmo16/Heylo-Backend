let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();
let { validationResult, query } = require('express-validator');

let users = require('../services/users/users');
let httpError = require('../utils/HttpError');

/**
 * Validate inputs for the UserChatController.
 * @param {String} method methods name to validate inputs */
let __validate = function (method) {
    switch (method) {
        case 'get': {
            return [
                query('length').optional().trim().escape().toInt(),
                query('username').exists().isString().trim().escape(),
            ];
        }
    }
};


router.all('/search/users*', validators.validator);


router.get('/search/users', __validate('get'), function (req, res, next) {
    user = req.user.userID;
    if (user) return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }

    let top = req.query.length;
    let triedUsername = req.query.username;

    users.fuzzyUsersSearch(triedUsername, top, function (err, users) {
        if (err) return next(err);

        return res.status(httpError.OK).json(users);
    });
});


module.exports = router;
