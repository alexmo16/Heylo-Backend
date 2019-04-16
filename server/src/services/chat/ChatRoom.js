let chatModel = require('../../models/ChatModel');

module.exports = class ChatRoom {
    constructor() {
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

    static findChatRoom(usersObjectID, next) {
        chatModel.findOne({
            users_ids: usersObjectID
        }, function(err, chat) {
            if (err) {
                next(err, null)
                return;
            }

            next(err, chat);
        });
    }

    static createChatRoom(usersObjectID, roomName, next) {
        let chatData = {
            users_ids: usersObjectID,
            name: roomName
        };
        let newChat = new chatModel(chatData);
        newChat.validate(function(err) {
            if (err) {
                next(err);
                return;
            }

            newChat.save(function(err, chat) {
                if (err) {
                    if (err.code === 11000) {
                        err.code = 409;
                    } 
                    next(err);
                    return;
                }

                next(err, chat);
            });
        });
    }
};
