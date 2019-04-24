let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let userChat = require('../services/userchat/UserChat');
let users = require('../services/users/Users');
let chatroom = require('../services/chat/ChatRoom');

let route = '/user/chats';

router.all(route, validators.validator);

router.get(route, function(req, res, next) {
    let userID = req.userID;
    if (!userID) return res.sendStatus(400);
    
    users.findUser(userID, function(err, user) {
        if (err) {
            next(err);
            return;
        }

        if (!user) {
            res.status(404).json('user not found');
            return;
        }

        chatroom.findUserChats(user._id, function(err, chats) {
            if (err) {
                next(err);
                return;
            }

            return res.status(200).json(chats);
        });
    });
});

router.post(route, function(req, res, next) {
    // query validation.
    let userID = req.userID;
    let friendsObjectId = req.body.friendsId;
    let errorMsg = '';
    friendsObjectId.forEach(function(objectId, index) {
        if (friendsObjectId.indexOf(objectId) !== -1 &&
        friendsObjectId.indexOf(objectId) !== index) {
            errorMsg = 'Duplicate of users';
            return new Error();
        }
    });
    if (errorMsg) return res.status(400).json(errorMsg);
    if (!userID) return res.sendStatus(400);
    if (!friendsObjectId || !Array.isArray(friendsObjectId)) return res.sendStatus(400);
    if (req.body.roomName && !req.body.roomName instanceof String) return res.sendStatus(400);

    // answer request
    userChat.createChat(userID, friendsObjectId, req.body.roomName, function(err, chat) {
        if (err) {
            if (err.code) {
                res.status(err.code).json(err.message);
            } else {
                next(err);
            }
            return;
        }

        return res.status(201).json({
            id: chat._id,
            name: chat.name,
            usersId: chat.users_ids
        });
    });
});

router.put(`${route}/:roomID`, function(req, res, next) {
    let userID = req.userID;
    let roomID = req.params.roomID;
    
    if (!roomID || !userID) return res.sendStatus(400);

    chatroom.leaveRoom(userID, roomID, function(err) {
        if (err) {
            if (err.code) {
                res.status(err.code).json(err.message);
            } else {
                next(err);
            }
            return;
        }

        return res.sendStatus(200);
    });
});

module.exports = router;
