let mongoose = require('mongoose');
let idValidator = require('mongoose-id-validator');
let async = require('async');

let UserModel = require('./UserModel');

let Schema = mongoose.Schema;
let ChatSchema = new Schema({
    name: {
        type: String
    },
    users_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        unique: true,
        required: [true, 'needs to specify users ids']
    }],
    creation_date: {
        type: Date,
        default: Date.now()
    }
});

ChatSchema.plugin(idValidator);

ChatSchema.pre('save', function(next) {
    let chat = this;
    if (!chat.name) {
        async.waterfall([
            function(cb) {
                chat.users_ids.forEach(function(userId) {
                    cb(null, userId);
                });
            },

            function(userId, cb) {
                UserModel.findById(userId, function(err, user) {
                    if (err) return cb(err);

                    if (user) {
                        chat.name += `${user.username} `;
                    }
                    cb(err); // err is null at this point
                });
            }

        ], function(err) {
            return next(err);
        });
    } else {
        return next();
    }
});

let ChatModel = mongoose.model('chat', ChatSchema);
module.exports = ChatModel;