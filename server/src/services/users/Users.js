let mongoose = require('mongoose');
let userModel = require('../../models/UserModel');

module.exports = class Users {
    constructor() {
    }

    static findUser(userID, next) {
        userModel.findOne({user_id: userID}, function(err, user) {
            if (err) {
                next(err, null);
                return;
            }
    
            if (!user) {
                err = new Error('User not found.');
                next(err, null);
                return;
            }
    
            next(err, user);
        });
    };

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
            next(err, isValid);
            return;
        }
        
        let query = {
            '_id': {
                $in: objectIdList
            }
        };
        userModel.find(query, function(err, users) {
            if (err) {
                next(err, null);
                return;
            }

            if (users.length === strObjectIDs.length) {
                next(err, isValid);
            } else {
                isValid = false;
                next(err, isValid);
            }
        });
    }

    static createUser(userData, next) {
        let newUser = new userModel(userData);
        newUser.save(function(err) {
            if (err)  {
                if (err.code === 11000) {
                    err.code = 409;
                }
                next(err, null);
                return;
            }

            next(err, newUser)
        });    
    }

    static fuzzyUsersSearch(triedUsername, top, next) {
        let data = {
            username: new RegExp(triedUsername, 'i')
        };
    
        userModel.find(data, function(err, users) {
            if (err) {
                next(err, null);
                return;
            }

            if (top && Number.isInteger(top)) {
                users.splice(0, top);
            }
    
            next(err, users);
        }).select('-user_id -creation_date -__v');
    }
};
