let mongoose = require('mongoose');
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

    static validateUsersByObjectID(strObjectIDs, next) {
        let err = null;
        let isValid = true;
        let objectIdList = [];
        strObjectIDs.forEach(function(objectID) {
            if (!mongoose.Types.ObjectId.isValid(objectID)) {
                isValid = false;
            } else {
                objectIdList.push(new mongoose.Types.ObjectId(objectID));
            }
        });

        if (!isValid) {
            err = new Error('Bad userID');
            err.code = 400;
            return next(err, isValid);
        }
        
        let query = {
            '_id': {
                $in: objectIdList
            }
        };
        userModel.find(query, function(err, users) {
            if (err) return next(err, null);

            if (users.length === strObjectIDs.length) {
                return next(err, isValid);
            }
            
            isValid = false;
            return next(err, isValid);
        });
    }

    static createUser(userData, next) {
        if (userData.password) {
            let saltLength = 10;
            bcrypt.hash(user.password, saltLength, function(err, hash) {
                if (err) return next(err);
    
                user.password = hash;
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
        }).select('-user_id -creation_date -__v');
    }
};
