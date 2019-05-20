let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let friends = require('../services/friends/Friends');
let users = require('../services/users/Users');

router.all('/friends*', validators.validator);

router.get('/friends', function(req, res, next) {
    let requester = req.userID;
    let recipient = req.query.recipient;
    if (!recipient || !requester) return res.sendStatus(400);

    let data = {
        requester: requester,
        recipient: recipient
    };
    friends.findFriendsRelation(data, function(err, relation) {
        if (err) {
            if (err.code) {
                return res.status(err.code).json(err.message);
            }
            return next(err);
        }
        
        return res.status(200).json(relation);
    });
});

router.post('/friends', function(req, res, next) {
    let recipient = req.body.recipient;
    let requester = req.userID;
    if (!recipient || !requester) return res.sendStatus(400);

    users.isValidUsers([recipient, requester], function(err, isValid) {
        if (err) return next(err);

        if (isValid) {
            let data = {
                recipient: recipient,
                requester: requester
            };
            friends.createFriendsRelation(data, function(err) {
                if (err) {
                    if (err.code) {
                        return res.status(err.code).json(err.message);
                    }
                    return next(err);
                }
                return res.sendStatus(201);
            }); 

        } else {
            return res.sendStatus(400);
        }
    });
});


router.put('/friends/:relationID', function(req, res, next) {
    let relationID = req.params['relationID'];
    let userID = req.userID;
    if (!relationID || !userID) return res.sendStatus(400);

    friends.isRecipient(relationID, userID, function(err, isRecipient) {
        if (err) return next(err);

        if (isRecipient) {
            friends.acceptFriendRequest(relationID, function(err) {
                if (err) return next(err);

                return res.sendStatus(200);
            });
            
        } else {
            return res.sendStatus(403);
        }
    });
});


router.delete('/friends/:relationID', function(req, res, next) {
    let relationID = req.params['relationID'];
    let userID = req.userID;
    if (!relationID || !userID) return res.sendStatus(400);

    friends.isInRelation(relationID, userID, function(err, hasRelationRights) {
        if (err) return next(err);

        if (hasRelationRights) {
            friends.deleteFriendsRelation(relationID, function(err) {
                if (err) return next(err);

                return res.sendStatus(200);
            });
            
        } else {
            return res.sendStatus(403);
        }
    });
});

module.exports = router;
