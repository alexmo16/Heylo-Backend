let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let userChat = require('../services/userchat/UserChat');
let users = require('../services/users/Users');
let chatroom = require('../services/chat/ChatRoom');
let friends = require('../services/friends/Friends');

let route = '/user/chats';

router.all(`${route}*`, validators.validator);


router.get(route, function(req, res, next) {
    let userID = req.userID;
    if (!userID) return res.sendStatus(400);
    
    users.findUserByID(userID, function(err, user) {
        if (err) return next(err);

        if (!user) {
            return res.status(404).json('user not found');
        }

        chatroom.findUserChats(user._id, function(err, chats) {
            if (err) return next(err);

            return res.status(200).json(chats);
        });
    });
});


router.post(route, function(req, res, next) {
    // Query validation.
    let userID = req.userID;
    let friendsUserID = req.body.friendsID;

    if (!userID || !friendsUserID) return res.sendStatus(400);

    let errorMsg = '';
    friendsUserID.forEach(function(objectID, index) {
        if (friendsUserID.indexOf(objectID) !== -1 &&
        friendsUserID.indexOf(objectID) !== index) {
            errorMsg = 'Duplicate of users';
            return new Error();
        }
    });
    if (errorMsg) return res.status(400).json(errorMsg);
    if (!userID) return res.sendStatus(400);
    if (!friendsUserID || !Array.isArray(friendsUserID)) return res.sendStatus(400);
    if (req.body.roomName && !req.body.roomName instanceof String) return res.sendStatus(400);

    // Answer request.
    friends.isInRelationWithUsers(userID, friendsUserID, function(err, isInRelation) {
        if (err) {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (isInRelation) {
            userChat.createChat(userID, friendsUserID, req.body.roomName, function(err, chat) {
                if (err) {
                    return err.code ? res.status(err.code).json(err.message) : next(err);
                }
        
                return res.status(201).json({
                    id: chat._id,
                    name: chat.name,
                    usersID: chat.users_ids
                });
            });

        } else {
            return res.sendStatus(403);
        }
    });
});


router.put(`${route}/:roomID`, function(req, res, next) {
    // Query Validation.
    let userID = req.userID;
    let roomID = req.params.roomID;
    
    if (!roomID || !userID) return res.sendStatus(400);

    // Answer request.
    chatroom.leaveRoom(userID, roomID, function(err) {
        if (err) {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        return res.sendStatus(200);
    });
});


module.exports = router;
