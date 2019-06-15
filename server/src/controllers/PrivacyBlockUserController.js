let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let users = require('../services/users/Users');
let blockUser = require('../services/blockuser/BlockUser');
let httpError = require('../utils/HttpError');

router.all('/privacy/block_user*', validators.validator);


router.post('/privacy/block_user', function(req, res, next) {
    let userID = req.user.userID;
    let aggressorID = req.body.aggressorID;

    if (!userID || typeof userID !== 'string') return res.sendStatus(httpError.BAD_REQUEST);
    if (!aggressorID || typeof aggressorID !== 'string') return res.sendStatus(httpError.BAD_REQUEST);

    users.isValidUsers( [ userID, aggressorID ], function(err, isValid) {
        if (err)  {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if ( !isValid ) {
            return res.sendStatus(httpError.BAD_REQUEST);
        }

        blockUser.isBlocked( userID, aggressorID, function(err, isBlocked) {
            if (err)  {
                return err.code ? res.status(err.code).json(err.message) : next(err);
            }

            if (isBlocked) {
                return res.sendStatus(httpError.CONFLICT);
            }

            blockUser.blockUser(userID, aggressorID, function(err) {
                if (err) {
                    return err.code ? res.status(err.code).json(err.message) : next(err);
                }

                return res.sendStatus(httpError.CREATED);
            });
        } );
    });
});


router.delete('/privacy/block_user', function(req, res, next) {
    let userID = req.user.userID;
    let aggressorID = req.body.aggressorID;

    if (!userID || typeof userID !== 'string') return res.sendStatus(httpError.BAD_REQUEST);
    if (!aggressorID || typeof aggressorID !== 'string') return res.sendStatus(httpError.BAD_REQUEST);

    blockUser.isBlocked( userID, aggressorID, function(err, isBlocked) {
        if (err)  {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (!isBlocked) {
            return res.sendStatus(httpError.FORBIDDEN);
        }

        blockUser.unblockUser(userID, aggressorID, function(err) {
            if (err) {
                return err.code ? res.status(err.code).json(err.message) : next(err);
            }
            return res.sendStatus(httpError.OK);
        });
    });
});

module.exports = router;
