let express = require('express');
let validator = require('../middlewares/Validator');
let router = express.Router();
let mongoose = require('mongoose');

let chatModel = require('../models/ChatModel');
let userModel = require('../models/UserModel');

router.all('/user/chats', validator);

/* GET users listing. */
router.get('/user/chats', function(req, res, next) {
    let g_userId = req.user_payload.sub;
    if (!g_userId) return res.sendStatus(400);
    
    userModel.findOne({ user_id : g_userId }, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(400).json('user not found');

        let data = {
            users_ids: { '$in': [user._id] }
        };
        chatModel.find(data, function(err, chats) {
            if (err) return next(err);

            return res.status(200).json(chats);
        }).select('-__v -creation_date');
    });
});


router.post('/user/chats', function(req, res, next) {
    let g_userId = req.user_payload.sub;
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
    if (!g_userId) return res.sendStatus(400);
    if (!friendsObjectId || !Array.isArray(friendsObjectId)) return res.sendStatus(400);
    if (req.body.roomName && !req.body.roomName instanceof String) return res.sendStatus(400);

    userModel.findOne({ user_id : g_userId }, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(400).json('user not found');
        if (friendsObjectId.indexOf(String(user._id)) !== -1) return res.sendStatus(400);

        let usersObjectIdString = [...friendsObjectId, user._id.toHexString()];
        let usersObjectId = [];
        usersObjectIdString.forEach(function(userId) {
            let objectId;
            try {
                objectId = new mongoose.Types.ObjectId(userId);
                if (mongoose.Types.ObjectId.isValid(objectId)) {
                    usersObjectId.push(objectId);
                }

            } catch (err) {
                errorMsg = 'bad input';
                return err;
            }
        });

        if (errorMsg) {
            return res.status(400).json(errorMsg);
        }

        let chatData = {
            users_ids: usersObjectId,
            name: !!req.body.roomName ? req.body.roomName : ''
        };

        chatModel.findOne({
            users_ids: usersObjectId
        }, function(err, chat) {
            if (err) return res.sendStatus(500);

            if (chat) {
                return res.status(400).json('This chat already exists');
            }

            let newChat = new chatModel(chatData);
            newChat.validate(function(err) {
                if (err) return next(err);

                newChat.save(function(err, chat) {
                    if (err) {
                        if (err.code === 11000) {
                            return res.status(409).json('This chat already exists');
                        } else {
                            return next(err);
                        }
                    }

                    return res.status(201).json({
                        id: chat._id,
                        name: chat.name,
                        usersId: chat.users_ids
                    });
                });
            });
        });
    });
});

module.exports = router;
