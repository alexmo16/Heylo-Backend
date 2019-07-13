let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let users = require('../services/users/Users');
let chatroom = require('../services/chat/ChatRoom');
let friends = require('../services/friends/Friends');
let httpError = require('../utils/HttpError');

let route = '/user/chats';

router.all(`${route}*`, validators.validator);


router.get(route, function (req, res, next) {
    let userID = req.user.userID;
    if (!userID) return res.sendStatus(httpError.BAD_REQUEST);

    users.findUserByID(userID, function (err, user) {
        if (err) return next(err);

        if (!user) {
            return res.status(404).json('user not found');
        }

        chatroom.findUserChats(user._id, function (err, chats) {
            if (err) return next(err);

            return res.status(httpError.OK).json(chats);
        });
    });
});


router.post(route, function (req, res, next) {
    // Query validation.
    let userID = req.user.userID;
    let friendsUserID = req.body.friendsID;

    if (!userID || !friendsUserID) return res.sendStatus(httpError.BAD_REQUEST);

    let errorMsg = '';
    friendsUserID.forEach(function (objectID, index) {
        if (friendsUserID.indexOf(objectID) !== -1 && friendsUserID.indexOf(objectID) !== index) {
            errorMsg = 'Duplicate of users';
            return new Error();
        }
    });
    if (errorMsg) return res.status(httpError.BAD_REQUEST).json(errorMsg);
    if (!userID) return res.sendStatus(httpError.BAD_REQUEST);
    if (!friendsUserID || !Array.isArray(friendsUserID)) return res.sendStatus(httpError.BAD_REQUEST);
    if (req.body.roomName && !(typeof req.body.roomName === 'string')) return res.sendStatus(httpError.BAD_REQUEST);

    // Answer request.
    friends.isInRelationWithUsers(userID, friendsUserID, function (err, isInRelation) {
        if (err) {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (isInRelation) {
            createChat(userID, friendsUserID, req.body.roomName, function (err, chat) {
                if (err) {
                    return err.code ? res.status(err.code).json(err.message) : next(err);
                }

                return res.status(httpError.CREATED).json({
                    id: chat._id,
                    name: chat.name,
                    usersID: chat.users_ids
                });
            });

        } else {
            return res.sendStatus(httpError.FORBIDDEN);
        }
    });
});


router.patch(`${route}/:roomID`, function (req, res, next) {
    // Query Validation.
    let userID = req.user.userID;
    let roomID = req.params.roomID;
    let friendsID = req.body.friendsID;

    if (!roomID || !userID || !friendsID || !(friendsID instanceof Array)) return res.sendStatus(httpError.BAD_REQUEST);

    let errorMsg = '';
    friendsID.forEach(function (id, index) {
        if (friendsID.indexOf(id) !== -1 && friendsID.indexOf(id) !== index) {
            errorMsg = 'Duplicate of users';
            return new Error();
        }
    });
    if (errorMsg) return res.status(httpError.BAD_REQUEST).json(errorMsg);

    // Answer request.
    chatroom.isUserInRoom(userID, roomID, function (err, isInRoom) {
        if (err) {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (isInRoom) {
            friends.isInRelationWithUsers(userID, friendsID, function (err, isInRelation) {
                if (err) {
                    return err.code ? res.status(err.code).json(err.message) : next(err);
                }

                if (isInRelation) {
                    let users = friendsID.concat(userID);
                    chatroom.updateRoom(users, roomID, function (err) {
                        if (err) {
                            return err.code ? res.status(err.code).json(err.message) : next(err);
                        }

                        return res.sendStatus(httpError.OK);
                    });

                } else {
                    return res.sendStatus(httpError.FORBIDDEN);
                }
            });

        } else {
            return res.sendStatus(httpError.FORBIDDEN);
        }
    });
});


/**
 * Create a new chat room.
 * @param {String} userID - User who's doing the request.
 * @param {Array.<String>} friendsUsersID - Friends of the requester to put in the room.
 * @param {String} [roomName] - Custom room name, default value is an empty string.
 * @param {Function} next - Callback function.
 */
let createChat = function (userID, friendsUsersID, roomName = '', next) {
    users.findUserByID(userID, function (err, user) {
        if (err) return next(err);

        if (!user) {
            err = new Error('user not found');
            err.code = httpError.NOT_FOUND;
            return next(err);
        }

        if (friendsUsersID.indexOf(String(user.user_id)) !== -1) {
            err = new Error('user cannot be is own friend');
            err.code = httpError.BAD_REQUEST;
            return next(err);
        }

        users.isValidUsers(friendsUsersID, function (err, isValid) {
            if (err || !isValid) {
                err = new Error('some users does not exist');
                err.code = httpError.NOT_FOUND;
                return next(err);
            }

            let usersID = [...friendsUsersID, userID];
            chatroom.findRoomByUsers(usersID, function (err, chat) {
                if (err) return next(err);

                if (chat) {
                    err = new Error('This chat already exists');
                    err.code = httpError.CONFLICT;
                    return next(err);
                }

                roomName = !!roomName ? roomName : '';
                chatroom.createChatRoom(usersID, roomName, function (err, chat) {
                    if (err) return next(err);

                    next(err, chat);
                });
            });
        });
    });
};

module.exports = router;
