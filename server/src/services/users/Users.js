let bcrypt = require('bcryptjs');
let userModel = require('../../models/UserModel');
let httpError = require('../../utils/HttpError');

const saltLength = 10;

module.exports = class Users {
    
    /**
     * Find a user by is user ID, not the ObjectID of MongoDB.
     * @param {String} userID - User's ID.
     * @param {function} next - Callback function.
     */
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


    /**
     * Find a user by is email.
     * @param {String} email - User's email.
     * @param {function} next - Callback function.
     */
    static findUserByEmail(email, next) {
        userModel.findOne({email: email}, function(err, user) {
            if (err) return next(err, null);

            return next(err, user);
        });
    }


    /**
     * Validate that all users' IDs in usersID are real users' IDs.
     * @param {Array.<String>} usersID - User's ID.
     * @param {function} next - Callback function (err, isValid).
     */
    static isValidUsers(usersID, next) {
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


    /**
     * Create a new user with all the data in userData.
     * @param {Object} userData - All information required to create a new user in the database.
     * @param {function} next - Callback function.
     */
    static createUser(userData, next) {
        if (userData.password) {
            bcrypt.hash(userData.password, saltLength, function(err, hash) {
                if (err) return next(err);
    
                userData.password = hash;
                let newUser = new userModel(userData);
                newUser.save(function(err) {
                    if (err) {
                        if (err.code === 11000) {
                            err.code = httpError.CONFLICT;
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
                        err.code = httpError.CONFLICT;
                    }
                    return next(err, null);
                }

                return next(err, newUser);
            });
        }
    }


    /**
     * Run a fuzzy search of users in the database.
     * @param {String} triedUsername - Username used for the fuzzy search.
     * @param {Number} top - Number of X first results to return.
     * @param {function} next - Callback function.
     */
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


    /**
     * Change a specific user's password.
     * @param {String} userID - The user's ID.
     * @param {String} newPassword - The new desired password.
     * @param {Function} next - Callback function.
     */
    static changeUserPassword(userID, newPassword, next) {
        if (!userID || typeof userID !== 'string' || !newPassword || typeof newPassword !== 'string') {
            let err = new Error('wrong parameters.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err, false);
        }

        bcrypt.hash(newPassword, saltLength, function(err, hash) {
            if (err) return next(err, false);

            let query = {
                'user_id': userID
            };
            userModel.findOneAndUpdate(query, { password : hash }, { new: true }, function(err, user) {
                if (err) return next(err, false);
    
                return next(err, user.password === hash);
            });
        }); 
    };
};
