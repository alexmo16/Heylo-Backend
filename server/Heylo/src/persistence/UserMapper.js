const UsersTable = require('../database/UsersTable');
const Read = require('../database/CRUD/Read');

class UserMapper {
    static findOne(username, next) { 
        Read.findOne('users', { username: username }, function(err, result) {
            next(err, result);
        });
    }
    
    static insert(username, firstname, lastname, next) {
        next(null, {});
    }

    static update() {

    } 

    static delete() {

    }
}

module.exports = UserMapper;
