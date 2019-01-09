let express = require('express');
let validator = require('../middlewares/Validator');
let router = express.Router();
let mongoose = require('mongoose');

let chatModel = require('../models/ChatModel');

router.all('/chat', validator);

/* GET users listing. */
router.get('/chat', function(req, res, next) {
    if (!req.query.id) return res.sendStatus(400);

    chatModel.findById(req.query.id, function(err, chat) {
        if (err) return next(err);
        
        if (!chat) return res.sendStatus(404);

        return res.status(200).json({
            name: chat.name,
            id: chat._id,
            usersId: chat.users_ids 
        });
    });
});

router.post('/chat', function(req, res, next) {
    if (!req.body.usersId || !Array.isArray(req.body.usersId)) return res.sendStatus(400);
    if (req.body.roomName && !req.body.roomName instanceof String) return res.sendStatus(400);

    let usersObjectId = [];
    req.body.usersId.forEach(function(userId) {
        usersObjectId.push(new mongoose.Types.ObjectId(userId));
    });

    let chatData = {
        users_ids: usersObjectId,
        name: !!req.body.roomName ? req.body.roomName : ''
    };

    let newChat = new chatModel(chatData);
    newChat.save(function(err, chat) {
        if (err) {
            if (err.code === 11000) {
                return res.status(409).json('this chat already exists');
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

module.exports = router;
