let mongoose = require('mongoose');
let idValidator = require('mongoose-id-validator');

let Schema = mongoose.Schema;
let ChatSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    users_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'needs to specify users ids']
    }],
    creation_date: {
        type: Date,
        default: Date.now()
    }
});

ChatSchema.plugin(idValidator);

let ChatModel = mongoose.model('chat', ChatSchema);
module.exports = ChatModel;
