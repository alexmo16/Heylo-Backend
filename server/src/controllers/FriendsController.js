let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();
let { validationResult, param, body } = require('express-validator');

let friends = require('../services/friends/Friends');
let users = require('../services/users/Users');
let privacy = require('../services/blockuser/BlockUser');
let httpError = require('../utils/HttpError');

/**
 * Validate inputs for the FriendsController.
 * @param {String} method methods name to validate inputs */
let __validate = function (method) {
    switch (method) {
        case 'get': {
            return [
                param('friendID', 'Invalid param').exists().not().isEmpty().trim()
            ];
        }

        case 'post': {
            return [
                body('recipient', 'Invalid body recipient').exists().isString().not().isEmpty().trim().escape()         
            ];
        }

        case 'put': {
            return [
                param('relationID', 'invalid param').exists().isString().trim().isMongoId(),
            ];
        }

        case 'delete': {
            return [
                param('relationID', 'invalid param').exists().isString().trim().isMongoId(),
            ];
        }
    }
};


router.all('/friends*', validators.validator);


router.get('/friends/:friendID', __validate('get'), function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }
    
    let friendID = req.params['friendID'];
    let requester = req.user.userID;    
    if (!requester) return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);

    let data = {
        requester: requester,
        friend: friendID
    };
    friends.findFriendsRelation(data, function (err, relation) {
        if (err) {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        return res.status(httpError.OK).json(relation);
    });
});


router.post('/friends', __validate('post'), function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }

    let recipient = req.body.recipient;
    let requester = req.user.userID;
    if (!requester) return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);

    users.isValidUsers([recipient, requester], function (err, isValid) {
        if (err) return next(err);

        if (!isValid) {
            return res.sendStatus(httpError.BAD_REQUEST);
        }

        privacy.isBlocked(recipient, requester, function (err, isBlocked) {
            if (err) {
                return err.code ? res.status(err.code).json(err.message) : next(err);
            }

            if (isBlocked) {
                return res.sendStatus(httpError.FORBIDDEN);
            }

            let data = {
                recipient: recipient,
                requester: requester
            };
            friends.createFriendsRelation(data, function (err) {
                if (err) {
                    return err.code ? res.status(err.code).json(err.message) : next(err);
                }
                return res.sendStatus(httpError.CREATED);
            });
        });
    });
});


router.put('/friends/:relationID', __validate('put'), function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }

    let relationID = req.params['relationID'];
    let userID = req.user.userID;
    if (!userID) return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);

    friends.isRecipient(relationID, userID, function (err, isRecipient) {
        if (err) return next(err);

        if (isRecipient) {
            friends.acceptFriendRequest(relationID, function (err) {
                if (err) return next(err);

                return res.sendStatus(httpError.OK);
            });

        } else {
            return res.sendStatus(httpError.FORBIDDEN);
        }
    });
});


router.delete('/friends/:relationID', __validate('delete'), function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpError.BAD_REQUEST).json({ errors: errors.array() });
        return;
    }

    let relationID = req.params['relationID'];
    let userID = req.user.userID;
    if (!userID) return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);

    friends.isInRelation(relationID, userID, function (err, hasRelationRights) {
        if (err) return next(err);

        if (hasRelationRights) {
            friends.deleteFriendsRelation(relationID, function (err) {
                if (err) return next(err);

                return res.sendStatus(httpError.OK);
            });

        } else {
            return res.sendStatus(httpError.FORBIDDEN);
        }
    });
});

module.exports = router;
