let users = require('../users/Users');
let chatroom = require('../chat/ChatRoom');

module.exports = class UserChat {
    static createChat(userID, friendsObjectID, roomName, next) {
        users.findUserByID(userID, function(err, user) {
            if (err) return next(err);
            
            if (!user) {
                err = new Error('user not found'); 
                err.code = 404;
                return next(err);
            }
            
            if (friendsObjectID.indexOf(String(user._id)) !== -1) {
                err = new Error('user cannot be is own friend');
                err.code = 400;
                return next(err);
            }
    
            let usersObjectId = [...friendsObjectID, user._id.toHexString()];
            users.validateUsersByObjectID(usersObjectId, function(err, isValid) {
                if (err || !isValid) {
                    err = new Error('some users does not exist');
                    err.code = 404;
                    return next(err);
                }
        
                chatroom.findChatRoom(usersObjectId, function(err, chat) {
                    if (err) return next(err);
        
                    if (chat) {
                        err = new Error('This chat already exists');
                        err.code = 409;
                        return next(err);
                    }
                    
                    roomName = !!roomName? roomName : '';
                    chatroom.createChatRoom(usersObjectId, roomName, function(err, chat) {
                        if (err) return next(err);
        
                        next(err, chat);
                    });
                });
            });
        });
    }
};
