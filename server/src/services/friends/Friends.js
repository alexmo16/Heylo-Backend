let friendsModel = require('../../models/FriendsModel').model;
let friendshipStatus = require('../../models/FriendsModel').friendshipStatus;

module.exports = class Friends {
    static createFriendsRelation(relationData, next) {
        let err;
        if (!relationData.recipient || !relationData.requester) {
            err = new Error('Recipient or requester is missing.');
            return next(err);
        }

        relationData.status = friendshipStatus.PENDING; 

        let newFriends = new friendsModel(relationData);
        newFriends.validate(function(err) {
            if (err) return next(err);

            newFriends.save(function(err) {
                if (err && err.code === 11000) {
                    err.code = 409;
                }
                return next(err);
            });
        });
    }

    static findFriendsRelation(relationData, next) {
        let err;
        if (!relationData.recipient || !relationData.requester) {
            err = new Error('Recipient or requester is missing.');
            return next(err);
        }

        friendsModel.findOne(relationData, function(err, result) {
            if (err) return next(err);

            if (!result) {
                err = new Error('Relation not found.');
                err.code = 404;
                return next(err, null);
            }
    
            return next(err, result);
        }).select('-__v');
    };


    static isInRelation(relationID, userID, next) {
        if (!relationID || !userID) {
            let err = new Error('RelationID or userID is missing.');
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
        friendsModel.findOne(query, function(err, result) {
            if (err) return next(err);

            let isInRoom = result ? true : false;
            next(err, isInRoom);
        });
    }

    static isRecipient(relationID, userID, next) {
        if (!relationID || !userID) {
            let err = new Error('RelationID or userID is missing.');
            return next(err);
        }

        let query = {
            '_id': relationID,
            'recipient': userID          
        };
        friendsModel.findOne(query, function(err, result) {
            if (err) return next(err);

            let isInRoom = result ? true : false;
            next(err, isInRoom);
        });
    }


    static deleteFriendsRelation(relationID, next) {
        if (!relationID) {
            let err = new Error('RelationID is missing.');
            return next(err);
        }
        friendsModel.findByIdAndDelete(relationID, function(err) {
            next(err);
        });
    };

    static acceptFriendRequest(relationID, next) {
        if (!relationID) {
            let err = new Error('RelationID is missing.');
            return next(err);
        }
        let relationUpdate = {
            'status': friendshipStatus.ACCEPTED
        };
        friendsModel.findByIdAndUpdate(relationID, relationUpdate, function(err) {
            next(err);
        });
    }
};
