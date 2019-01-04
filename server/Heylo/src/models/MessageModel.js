let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let MessageSchema = new Schema({
    message: {
        type: String,
        required: [true, `what is the message?`]
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, `sender's id needed.`]
    },
    chat_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat',
        required: [true, `what is the chat?`]
    },
    sending_date: {
        type: Date,
        default: Date.now()
    }
});

let MessageModel = mongoose.model('message', MessageSchema);
module.exports = MessageModel;