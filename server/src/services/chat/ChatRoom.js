let chatModel = require('../../models/ChatModel');
let httpError = require('../../utils/HttpError');

module.exports = class ChatRoom {

    /**
     * Find a room using an array of users' IDs in the room.
     * @param {Array.<String>} usersID - array of users' IDs.
     * @param {Function} next - Callback function.
     */
    static findRoomByUsers(usersID, next) {
        chatModel.findOne({
            users_ids: usersID
        }, function(err, chat) {
            if (err) return next(err, null);

            next(err, chat);
        });
    }


    /**
     * Find all rooms of a specific user.
     * @param {String} userID - ID of the specific user. 
     * @param {Function} next - Callback function 
     */
    static findUserChats(userID, next) {
        let data = {
            users_ids: { '$in': [userID] }
        };

        chatModel.find(data, function(err, chats) {
            if (err) return next(err);

            next(err, chats);
        }).select('-__v -creation_date -_id');
    }


    /**
     * Create a new chat room in the database.
     * @param {Array.<String>} usersID - Array of users' IDs.
     * @param {String} roomName - Room's name.
     * @param {Function} next - Callback function.
     */
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
                        err.code = httpError.CONFLICT;
                    } 
                    return next(err);
                }

                return next(err, chat);
            });
        });
    }


    /**
     * Verify if a user is in a specific room.
     * @param {String} userID - User ID to verify.
     * @param {String} roomID - Room ID to verify.
     * @param {Function} next  - Callback function.
     */
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


    /**
     * Update the content of an already existing room in the database.
     * @param {Array.<String>} usersID - Array of users in the room.
     * @param {String} roomID - Room ID to update.
     * @param {Function} next - Callback function.
     */
    static updateRoom(usersID, roomID, next) {
        chatModel.findById(roomID, function(err, room) {
            if (err || !room) {
                err = new Error('room not found');
                err.code = httpError.NOT_FOUND;
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
