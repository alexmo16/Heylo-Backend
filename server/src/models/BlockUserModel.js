let mongoose = require('mongoose');

let Schema = mongoose.Schema;

const blockStatus = {
    BLOCKED: 'BLOCKED'
};

let blockUserSchema = new Schema({
    requester: {
        type: String,
    },
    aggressor: {
        type: String,
    },
    status: {
        type: String,
        enums: [
            blockStatus.BLOCKED
        ]
    },
    creation_date: {
        type: Date,
        default: Date.now()
    }
});

blockUserSchema.pre('validate', function(next) {
    let query = {
        aggressor: this.aggressor, 
        requester: this.requester
    };

    model.findOne(query, function(err, res) {
        if (err) return next(err);

        if (res) {
            err = new Error('aggressor and requester combination must be unique.');
            err.code = 400;
            return next(err);
        }
        next();
    });
});

let model = mongoose.model('block-user', blockUserSchema);

module.exports = {
    blockStatus,
    model
};
