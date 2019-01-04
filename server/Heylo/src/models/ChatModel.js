let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let ChatSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    creation_date: {
        type: Date,
        default: Date.now()
    }
});

let ChatModel = mongoose.model('chat', ChatSchema);
module.exports = ChatModel;