let express = require('express');
let router = express.Router();

let validators = require('../middlewares/Validators');
let users = require('../services/users/Users');

router.get('/login', validators.validator, function(req, res, next) {
    if (!req.userID) res.sendStatus(500);

    let userID = req.userID;
    users.findUser(userID, function(err, user) {
        if (err) return next(err);

        if (!user) return res.status(404).json('user not found');

        return res.status(200).json({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            creation_date: user.creation_date
        }); 
    });
});

module.exports = router;
