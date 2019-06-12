let express = require('express');
let router = express.Router();

let validators = require('../middlewares/Validators');
let users = require('../services/users/Users');
let httpError = require('../utils/HttpError');

router.all('/password*', validators.validator);


// Change a user's password.
router.put('/password', function(req, res, next) {
    // Validate query.
    let userID = req.user.userID;
    let newPassword = req.body.newPassword;
    if (!userID || !newPassword ||  typeof newPassword !== 'string') return res.sendStatus(httpError.BAD_REQUEST);
    if (req.user.registeredBy !== 'HEYLO') return res.sendStatus(httpError.FORBIDDEN);

    // Answer query.
    users.changeUserPassword(userID, newPassword, function(err, isPasswordChanged) {
        if (err)  {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (isPasswordChanged) {
            return res.sendStatus(httpError.OK);
        }

        return res.sendStatus(httpError.INTERNAL_SERVER_ERROR); 
    });
});


module.exports = router;
