let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let friends = require('../services/friends/Friends');
let users = require('../services/users/Users');
let privacy = require('../services/blockuser/BlockUser');
let httpError = require('../utils/HttpError');

router.all('/friends*', validators.validator);


router.get('/friends/:friendID', function(req, res, next) {
    let requester = req.user.userID;
    let friendID = req.params['friendID'];
    if (!friendID || !requester) return res.sendStatus(httpError.BAD_REQUEST);

    let data = {
        requester: requester,
        friend: friendID
    };
    friends.findFriendsRelation(data, function(err, relation) {
        if (err) {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }
        
        return res.status(httpError.OK).json(relation);
    });
});


router.post('/friends', function(req, res, next) {
    let recipient = req.body.recipient;
    let requester = req.user.userID;
    if (!recipient || !requester || !typeof recipient === 'string') return res.sendStatus(httpError.BAD_REQUEST);

    users.isValidUsers([recipient, requester], function(err, isValid) {
        if (err) return next(err);

        if (!isValid) {
            return res.sendStatus(httpError.BAD_REQUEST);
        }

        privacy.isBlocked(recipient, requester, function(err, isBlocked) {
            if (err) {
                return err.code? res.status(err.code).json(err.message) : next(err);
            }

            if (isBlocked) {
                return res.sendStatus(httpError.FORBIDDEN);
            }

            let data = {
                recipient: recipient,
                requester: requester
            };
            friends.createFriendsRelation(data, function(err) {
                if (err) {
                    return err.code ? res.status(err.code).json(err.message) : next(err);
                }
                return res.sendStatus(httpError.CREATED);
            });
        });
    });
});


router.put('/friends/:relationID', function(req, res, next) {
    let relationID = req.params['relationID'];
    let userID = req.user.userID;
    if (!relationID || !userID) return res.sendStatus(httpError.BAD_REQUEST);

    friends.isRecipient(relationID, userID, function(err, isRecipient) {
        if (err) return next(err);

        if (isRecipient) {
            friends.acceptFriendRequest(relationID, function(err) {
                if (err) return next(err);

                return res.sendStatus(httpError.OK);
            });
            
        } else {
            return res.sendStatus(httpError.FORBIDDEN);
        }
    });
});


router.delete('/friends/:relationID', function(req, res, next) {
    let relationID = req.params['relationID'];
    let userID = req.user.userID;
    if (!relationID || !userID) return res.sendStatus(httpError.BAD_REQUEST);

    friends.isInRelation(relationID, userID, function(err, hasRelationRights) {
        if (err) return next(err);

        if (hasRelationRights) {
            friends.deleteFriendsRelation(relationID, function(err) {
                if (err) return next(err);

                return res.sendStatus(httpError.OK);
            });
            
        } else {
            return res.sendStatus(httpError.FORBIDDEN);
        }
    });
});

module.exports = router;
