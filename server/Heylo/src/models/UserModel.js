let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let UserSchema = new Schema({
    user_id: {
        type: String,
        unique: true,
        required: [true, 'userId needed.']
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'username needed.'],
    },
    firstname: {
        type: String,
        required: [true, 'first name needed.']
    },
    lastname: {
        type: String,
        required: [true, 'last name needed.']
    },
    creation_date: {
        type: Date,
        default: Date.now()
    }
});

let UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;