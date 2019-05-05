let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let ChatSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    users_ids: [{
        type: String,
        ref: 'user',
        required: [true, 'needs to specify users ids']
    }],
    creation_date: {
        type: Date,
        default: Date.now()
    }
});


let ChatModel = mongoose.model('chat', ChatSchema);
module.exports = ChatModel;
