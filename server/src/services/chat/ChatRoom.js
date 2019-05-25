let chatModel = require('../../models/ChatModel');

module.exports = class ChatRoom {
    static findRoomByUsers(usersObjectID, next) {
        chatModel.findOne({
            users_ids: usersObjectID
        }, function(err, chat) {
            if (err) return next(err, null);

            next(err, chat);
        });
    }


    static findUserChats(userID, next) {
        let data = {
            users_ids: { '$in': [userID] }
        };

        chatModel.find(data, function(err, chats) {
            if (err) return next(err);

            next(err, chats);
        }).select('-__v -creation_date -_id');
    }


    static createChatRoom(usersID, roomName, next) {
        let chatData = {
            users_ids: usersID,
            name: roomName
        };
        let newChat = new chatModel(chatData);
        newChat.validate(function(err) {
            if (err) return next(err);

            newChat.save(function(err, chat) {
                if (err) {
                    if (err.code === 11000) {
                        err.code = 409;
                    } 
                    return next(err);
                }

                return next(err, chat);
            });
        });
    }


    static isUserInRoom(userID, roomID, next) {
        let query = {
            _id: roomID,
            users_ids: {
                $in: userID
            }
        };
        
        chatModel.find(query, function(err, chat) {
            if (err) return next(err, null);
            
            let isInRoom = chat && chat.length !== 0;
            return next(err, isInRoom);
        });
    }


    static updateRoom(usersID, roomID, next) {
        chatModel.findById(roomID, function(err, room) {
            if (err || !room) {
                err = new Error('room not found');
                err.code = 404;
                return next(err);
            }

            chatModel.findByIdAndUpdate(roomID, { users_ids: usersID }, { new: true }, function(err, room) {
                if (err) return next(err);

                if (room.users_ids.length === 0) {
                    chatModel.findByIdAndDelete(roomID, function(err) {
                        return next(err);
                    });
                } else {
                    return next();   
                }
            });
        });
    }
};
