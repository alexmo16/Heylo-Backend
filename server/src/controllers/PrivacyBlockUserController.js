let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let users = require('../services/users/Users');
let blockUser = require('../services/blockuser/BlockUser');

router.all('/privacy/block_user*', validators.validator);


router.post('/privacy/block_user', function(req, res, next) {
    let userID = req.userID;
    let aggressorID = req.body.aggressorID;

    if (!userID || typeof userID !== 'string') return res.sendStatus(400);
    if (!aggressorID || typeof aggressorID !== 'string') return res.sendStatus(400);

    users.isValidUsers( [ userID, aggressorID ], function(err, isValid) {
        if (err)  {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if ( !isValid ) {
            return res.sendStatus(400);
        }

        blockUser.isBlocked( userID, aggressorID, function(err, isBlocked) {
            if (err)  {
                return err.code ? res.status(err.code).json(err.message) : next(err);
            }

            if (isBlocked) {
                return res.sendStatus(403);
            }

            blockUser.blockUser(userID, aggressorID, function(err) {
                if (err) {
                    return err.code ? res.status(err.code).json(err.message) : next(err);
                }

                return res.sendStatus(200);
            });
        } );
    });
});


router.post('/privacy/block_user', function(req, res, next) {
    let userID = req.userID;
    let aggressorID = req.body.aggressorID;

    if (!userID || typeof userID !== 'string') return res.sendStatus(400);
    if (!aggressorID || typeof aggressorID !== 'string') return res.sendStatus(400);

    users.isValidUsers( [ userID, aggressorID ], function(err, isValid) {
        if (err)  {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if ( !isValid ) {
            return res.sendStatus(400);
        }

        blockUser.isBlocked( userID, aggressorID, function(err, isBlocked) {
            if (err)  {
                return err.code ? res.status(err.code).json(err.message) : next(err);
            }

            if (isBlocked) {
                return res.sendStatus(403);
            }

            blockUser.blockUser(userID, aggressorID, function(err) {
                if (err) {
                    return err.code ? res.status(err.code).json(err.message) : next(err);
                }

                return res.sendStatus(200);
            });
        } );
    });
});


router.delete('/privacy/block_user', function(req, res, next) {
    let userID = req.userID;
    let aggressorID = req.body.aggressorID;

    if (!userID || typeof userID !== 'string') return res.sendStatus(400);
    if (!aggressorID || typeof aggressorID !== 'string') return res.sendStatus(400);

    blockUser.isBlocked( userID, aggressorID, function(err, isBlocked) {
        if (err)  {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (!isBlocked) {
            return res.sendStatus(403);
        }

        blockUser.unblockUser(userID, aggressorID, function(err) {
            if (err) {
                return err.code ? res.status(err.code).json(err.message) : next(err);
            }
            return res.sendStatus(200);
        });
    });
});

module.exports = router;
