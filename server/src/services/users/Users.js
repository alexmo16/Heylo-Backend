let bcrypt = require('bcryptjs');
let userModel = require('../../models/UserModel');

module.exports = class Users {
    static findUserByID(userID, next) {
        userModel.findOne({user_id: userID}, function(err, user) {
            if (err) return next(err, null);
    
            if (!user) {
                err = new Error('User not found.');
                return next(err, null);
            }
    
            return next(err, user);
        });
    }

    static findUserByEmail(email, next) {
        userModel.findOne({email: email}, function(err, user) {
            if (err) return next(err, null);

            return next(err, user);
        });
    }

    static validateUsersByID(usersID, next) {
        let isValid = true;
        let query = {
            'user_id': {
                $in: usersID
            }
        };
        userModel.find(query, function(err, users) {
            if (err) return next(err, null);

            if (users.length === usersID.length) {
                return next(err, isValid);
            }
            
            isValid = false;
            return next(err, isValid);
        });
    }

    static createUser(userData, next) {
        if (userData.password) {
            let saltLength = 10;
            bcrypt.hash(userData.password, saltLength, function(err, hash) {
                if (err) return next(err);
    
                userData.password = hash;
                let newUser = new userModel(userData);
                newUser.save(function(err) {
                    if (err) {
                        if (err.code === 11000) {
                            err.code = 409;
                        }
                        return next(err, null);
                    }

                    return next(err, newUser);
                });
            });
        } else {
            let newUser = new userModel(userData);
            newUser.save(function(err) {
                if (err) {
                    if (err.code === 11000) {
                        err.code = 409;
                    }
                    return next(err, null);
                }

                return next(err, newUser);
            });
        }
    }

    static fuzzyUsersSearch(triedUsername, top, next) {
        let data = {
            username: new RegExp(triedUsername, 'i')
        };
    
        userModel.find(data, function(err, users) {
            if (err) return next(err, null);

            if (top && Number.isInteger(top)) {
                users.splice(0, top);
            }
    
            return next(err, users);
        }).select('-_id -creation_date -__v');
    }
};
