let users = require('../users/Users');
let chatroom = require('../chat/ChatRoom');

module.exports = class UserChat {
    constructor() {
    }

    static createChat(userID, friendsObjectID, roomName, next) {
        users.findUser(userID, function(err, user) {
            if (err) {
                next(err);
                return;
            }
            
            if (!user) {
                err = new Error('user not found'); 
                err.code = 404;
                next(err);
                return;
            }
            
            if (friendsObjectID.indexOf(String(user._id)) !== -1) {
                err = new Error('user cannot be is own friend');
                err.code = 400;
                next(err);
                return;
            }
    
            let usersObjectId = [...friendsObjectID, user._id.toHexString()];
            users.validateUsersByObjectID(usersObjectId, function(err, isValid) {
                if (err || !isValid) {
                    err = new Error('some users does not exist');
                    err.code = 404;
                    next(err);
                    return;
                }
        
                chatroom.findChatRoom(usersObjectId, function(err, chat) {
                    if (err) {
                        next(err);
                        return;
                    }
        
                    if (chat) {
                        err = new Error('This chat already exists');
                        err.code = 409;
                        next(err);
                        return;
                    }
                    
                    roomName = !!roomName? roomName : '';
                    chatroom.createChatRoom(usersObjectId, roomName, function(err, chat) {
                        if (err) {
                            next(err);
                            return;
                        }
        
                        next(err, chat);
                    });
                });
            });
        });
    }

    static findUserChats(userID, next) {
        let data = {
            users_ids: { '$in': [userID] }
        };

        chatModel.find(data, function(err, chats) {
            if (err) {
                next(err);
                return;
            }

            next(err, chats);
        }).select('-__v -creation_date');
    }
};
