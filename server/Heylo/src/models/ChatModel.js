let mongoose = require('mongoose');
let idValidator = require('mongoose-id-validator');
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

ChatSchema.pre('save', function(next) {
    if (!this.name) {
        let that = this;
        this.users_ids.forEach(function(userId) {
            UserModel.findById(userId, function(err, user) {
                if (err) return next(err);
                
                if (user) {
                    that.name += `${user.username} `;
                }
            });
        });
    }
    next();
});

ChatSchema.plugin(idValidator);

let ChatModel = mongoose.model('chat', ChatSchema);
module.exports = ChatModel;