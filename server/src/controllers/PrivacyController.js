let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();
let { validationResult, body } = require('express-validator');

let users = require('../services/users/Users');
let blockUser = require('../services/blockuser/BlockUser');
let httpError = require('../utils/HttpError');

/**
 * Validate inputs for the PrivacyController.
 * @param {String} method methods name to validate inputs */
let __validate = function (method) {
    switch (method) {
        case 'post': {
            return [
                body('aggressorID', 'Invalid body input').exists().isString().trim().escape()
            ];
        }

        case 'delete': {
            return [
                body('aggressorID', 'Invalid body input').exists().isString().trim().escape()
            ];
        }
    }
};


router.all('/privacy/*', validators.validator);


router.post('/privacy/block_user', __validate('post'), function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }

    let userID = req.user.userID;
    let aggressorID = req.body.aggressorID;

    if (!userID || typeof userID !== 'string') return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);

    users.isValidUsers([userID, aggressorID], function (err, isValid) {
        if (err) {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (!isValid) {
            return res.sendStatus(httpError.BAD_REQUEST);
        }

        blockUser.isBlocked(userID, aggressorID, function (err, isBlocked) {
            if (err) {
                return err.code ? res.status(err.code).json(err.message) : next(err);
            }

            if (isBlocked) {
                return res.sendStatus(httpError.CONFLICT);
            }

            blockUser.blockUser(userID, aggressorID, function (err) {
                if (err) {
                    return err.code ? res.status(err.code).json(err.message) : next(err);
                }

                return res.sendStatus(httpError.CREATED);
            });
        });
    });
});


router.delete('/privacy/block_user', __validate('delete'), function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }

    let userID = req.user.userID;
    let aggressorID = req.body.aggressorID;

    if (!userID || typeof userID !== 'string') return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);

    blockUser.isBlocked(userID, aggressorID, function (err, isBlocked) {
        if (err) {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (!isBlocked) {
            return res.sendStatus(httpError.FORBIDDEN);
        }

        blockUser.unblockUser(userID, aggressorID, function (err) {
            if (err) {
                return err.code ? res.status(err.code).json(err.message) : next(err);
            }
            return res.sendStatus(httpError.OK);
        });
    });
});

module.exports = router;
