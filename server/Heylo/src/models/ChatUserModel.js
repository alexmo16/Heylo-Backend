let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let ChatUserSchema = new Schema({
    chat_id: {
        type: String,
        unique: true,
        required: [true, 'chat_id needed.']
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

let ChatUserModel = mongoose.model('chat_user', ChatUserSchema);
module.exports = ChatUserModel;