let users = require('../users/Users');
let chatroom = require('../chat/ChatRoom');

module.exports = class UserChat {
    static createChat(userID, friendsUsersID, roomName, next) {
        users.findUserByID(userID, function(err, user) {
            if (err) return next(err);
            
            if (!user) {
                err = new Error('user not found'); 
                err.code = 404;
                return next(err);
            }
            
            if (friendsUsersID.indexOf(String(user.user_id)) !== -1) {
                err = new Error('user cannot be is own friend');
                err.code = 400;
                return next(err);
            }
    
            users.isValidUsers(friendsUsersID, function(err, isValid) {
                if (err || !isValid) {
                    err = new Error('some users does not exist');
                    err.code = 404;
                    return next(err);
                }
        
                let usersID = [...friendsUsersID, userID];
                chatroom.findRoomByUsers(usersID, function(err, chat) {
                    if (err) return next(err);
        
                    if (chat) {
                        err = new Error('This chat already exists');
                        err.code = 409;
                        return next(err);
                    }
                    
                    roomName = !!roomName? roomName : '';
                    chatroom.createChatRoom(usersID, roomName, function(err, chat) {
                        if (err) return next(err);
        
                        next(err, chat);
                    });
                });
            });
        });
    }
};
