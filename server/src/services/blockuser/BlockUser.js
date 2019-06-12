let blockUserModel = require('../../models/BlockUserModel').model;
let blockStatus = require('../../models/BlockUserModel').blockStatus;
let httpError = require('../../utils/HttpError');

module.exports = class BlockUser {
    
    /**
     * Create a block relation between 2 users in the database.
     * @param {String} requesterID - requester user ID.
     * @param {String} aggressorID - aggressor user ID.
     * @param {Function} next - Callback function.
     */
    static blockUser(requesterID, aggressorID, next) {
        let err;
        if (!requesterID || typeof requesterID !== 'string' || !aggressorID || typeof aggressorID !== 'string') {
            err = new Error('aggressor or requester is missing.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err);
        }


        let data = {
            'requester': requesterID,
            'aggressor': aggressorID,
            'status': blockStatus.BLOCKED
        };

        let newBlockedUser = new blockUserModel(data);
        newBlockedUser.validate(function(err) {
            if (err) return next(err);

            newBlockedUser.save(function(err) {
                if (err && err.code === 11000) {
                    err.code = httpError.CONFLICT;
                }
                return next(err);
            });
        });
    }


    /**
     * Verify if a user is blocked by another user.
     * @param {String} requesterID - requester user ID.
     * @param {String} aggressorID - aggressor user ID.
     * @param {Function} next - Callback function (err, isBlocked).
     */
    static isBlocked(requesterID, aggressorID, next) {
        if (!requesterID || typeof requesterID !== 'string' || !aggressorID || typeof aggressorID !== 'string') {
            let err = new Error('requesterID or aggressorID is invalid.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err, false);
        }

        let query = {
            'requester': requesterID,
            'aggressor': aggressorID,
            'status': blockStatus.BLOCKED
        };
        blockUserModel.findOne(query, function(err, result) {
            if (err) return next(err, false);
            next(err, result);
        });
    }


    /**
     * Unblock a previously blocked user.
     * @param {String} requesterID - requester user ID.
     * @param {String} aggressorID - aggressor user ID.
     * @param {Function} next - Callback function.
     */
    static unblockUser(requesterID, aggressorID, next) {
        if (!requesterID || typeof requesterID !== 'string' || !aggressorID || typeof aggressorID !== 'string') {
            let err = new Error('data is missing.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err);
        }

        let query = {
            'aggressor': aggressorID,
            'requester': requesterID,
            'status': blockStatus.BLOCKED
        };

        blockUserModel.findOneAndDelete(query, function(err) {
            next(err);
        });
    };
};
