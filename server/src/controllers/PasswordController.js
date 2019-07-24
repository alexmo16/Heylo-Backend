let express = require('express');
let router = express.Router();
let { validationResult, body } = require('express-validator');

let validators = require('../middlewares/Validators');
let users = require('../services/users/Users');
let httpError = require('../utils/HttpError');

/**
 * Validate inputs for the PasswordController.
 * @param {String} method methods name to validate inputs */
let __validate = function (method) {
    switch (method) {
        case 'put': {
            return [
                body('newPassword', 'Invalid body input').exists().isString().trim().escape(),
            ];
        }
    }
};


router.all('/password*', validators.validator);


// Change a user's password.
router.put('/password', __validate('put'), function (req, res, next) {
    // Validate query.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }

    let userID = req.user.userID;
    let newPassword = req.body.newPassword;
    if (!userID) return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);
    if (req.user.registeredBy !== 'HEYLO') return res.sendStatus(httpError.FORBIDDEN);

    // Answer query.
    users.changeUserPassword(userID, newPassword, function (err, isPasswordChanged) {
        if (err) {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (isPasswordChanged) {
            return res.sendStatus(httpError.OK);
        }

        return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);
    });
});


module.exports = router;
