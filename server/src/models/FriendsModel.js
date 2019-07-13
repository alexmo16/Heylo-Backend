let mongoose = require('mongoose');
let httpError = require('../utils/HttpError');

let Schema = mongoose.Schema;

const friendshipStatus = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED'
};

let FriendsSchema = new Schema({
    requester: {
        type: String,
    },
    recipient: {
        type: String,
    },
    status: {
        type: String,
        enums: [
            friendshipStatus.PENDING,
            friendshipStatus.ACCEPTED
        ]
    },
    creation_date: {
        type: Date,
        default: Date.now()
    }
});

FriendsSchema.pre('validate', function (next) {
    let query = {
        recipient: this.recipient,
        requester: this.requester
    };

    model.findOne(query, function (err, res) {
        if (err) return next(err);

        if (res) {
            err = new Error('Recipient and requester combination must be unique.');
            err.code = httpError.BAD_REQUEST;
            return next(err);
        }
        next();
    });
});

let model = mongoose.model('friends', FriendsSchema);

module.exports = {
    friendshipStatus,
    model
};
