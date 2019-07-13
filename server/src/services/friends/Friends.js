let friendsModel = require('../../models/FriendsModel').model;
let friendshipStatus = require('../../models/FriendsModel').friendshipStatus;
let httpError = require('../../utils/HttpError');

module.exports = class Friends {

    /**
     * Create a new friendship in the database. The friendship will be set as PENDING and the
     * recipient will have to accept the new friendship to change the status to ACCEPTED.
     * @param {Object} relationData - Object containing the requester's ID and the recipient's ID.
     * @param {Function} next - Callback function.
     */
    static createFriendsRelation(relationData, next) {
        let err;
        if (!relationData.recipient || !relationData.requester) {
            err = new Error('Recipient or requester is missing.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err);
        }

        relationData.status = friendshipStatus.PENDING;

        let newFriends = new friendsModel(relationData);
        newFriends.validate(function (err) {
            if (err) return next(err);

            newFriends.save(function (err) {
                if (err && err.code === 11000) {
                    err.code = httpError.CONFLICT;
                }
                return next(err);
            });
        });
    }


    /**
     * Find a relation of friendship between two users. It does not matter if the requester ID
     * is in relationData.friend or relationData.requester.
     * @param {Object} relationData - Object containing a requester ID and a friend ID.
     * @param {Function} next - Callback function.
     */
    static findFriendsRelation(relationData, next) {
        let err;
        if (!relationData.friend || !relationData.requester) {
            err = new Error('friend or requester is missing.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err);
        }

        let query = {
            $or: [
                {
                    'requester': relationData.requester,
                    'recipient': relationData.friend
                },
                {
                    'requester': relationData.friend,
                    'recipient': relationData.requester
                }
            ]
        };

        friendsModel.findOne(query, function (err, result) {
            if (err) return next(err);

            if (!result) {
                err = new Error('Relation not found.');
                err.code = httpError.NOT_FOUND;
                return next(err, null);
            }

            return next(err, result);
        }).select('-__v');
    };


    /**
     * Verify if a userID is in a specific relationID.
     * @param {String} relationID - Relation ID in database.
     * @param {String} userID - User ID to verify.
     * @param {Function} next - Callback function.
     */
    static isInRelation(relationID, userID, next) {
        if (!relationID || !userID) {
            let err = new Error('RelationID or userID is missing.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err);
        }

        let query = {
            '_id': relationID,
            $or: [
                {
                    'requester': userID
                },
                {
                    'recipient': userID
                }
            ]
        };
        friendsModel.findOne(query, function (err, result) {
            if (err) return next(err);

            let isInRoom = result ? true : false;
            next(err, isInRoom);
        });
    }


    /**
     * Verify if a user in a relation is the recipient or not.
     * @param {String} relationID - Relation ID in database.
     * @param {String} userID - User ID to verify.
     * @param {Function} next - Callback function.
     */
    static isRecipient(relationID, userID, next) {
        if (!relationID || !userID) {
            let err = new Error('RelationID or userID is missing.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err);
        }

        let query = {
            '_id': relationID,
            'recipient': userID
        };
        friendsModel.findOne(query, function (err, result) {
            if (err) return next(err);

            let isInRoom = result ? true : false;
            next(err, isInRoom);
        });
    }


    /**
     * Delete a specific relation in database.
     * @param {String} relationID - Relation to delete.
     * @param {Function} next - Callback function.
     */
    static deleteFriendsRelation(relationID, next) {
        if (!relationID) {
            let err = new Error('RelationID is missing.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err);
        }
        friendsModel.findByIdAndDelete(relationID, function (err) {
            next(err);
        });
    };


    /**
     * Accept a PENDING relation.
     * @param {String} relationID - Relation to accept.
     * @param {Function} next - Callback function.
     */
    static acceptFriendRequest(relationID, next) {
        if (!relationID) {
            let err = new Error('RelationID is missing.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err);
        }
        let relationUpdate = {
            'status': friendshipStatus.ACCEPTED
        };
        friendsModel.findByIdAndUpdate(relationID, relationUpdate, function (err) {
            next(err);
        });
    }


    /**
     * Verify if a user is friend with all the users in friendsID.
     * @param {String} userID - User to verify.
     * @param {Array.<String>} friendsID - Users who are possible friends with userID.
     * @param {Function} next - Callback function.
     */
    static isInRelationWithUsers(userID, friendsID, next) {
        if (!userID || !friendsID || !(friendsID instanceof Array)) {
            let err = new Error('usersID are missing.');
            err.code = httpError.INTERNAL_SERVER_ERROR;
            return next(err);
        }

        let query = {
            $and: [
                {
                    $or: [
                        {
                            'requester': userID,
                            'recipient': {
                                $in: friendsID
                            }
                        },
                        {
                            'recipient': userID,
                            'requester': {
                                $in: friendsID
                            }
                        }
                    ]
                },
                {
                    'status': friendshipStatus.ACCEPTED
                }
            ]
        };
        friendsModel.find(query, function (err, relations) {
            if (err) return next(err);

            return next(err, relations && relations.length === friendsID.length);
        });
    }
};
