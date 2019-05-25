let express = require('express');
let router = express.Router();

let validators = require('../middlewares/Validators');
let users = require('../services/users/Users');

router.all('/password*', validators.validator);


// Change a user's password.
router.put('/password', function(req, res, next) {
    // Validate query.
    let userID = req.userID;
    let newPassword = req.body.newPassword;
    if (!userID || !newPassword ||  typeof newPassword !== 'string') return res.sendStatus(400);

    // Answer query.
    users.changeUserPassword(userID, newPassword, function(err, isPasswordChanged) {
        if (err)  {
            return err.code ? res.status(err.code).json(err.message) : next(err);
        }

        if (isPasswordChanged) {
            return res.sendStatus(200);
        }

        return res.sendStatus(500); 
    });
});


module.exports = router;
