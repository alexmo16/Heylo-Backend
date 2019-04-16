let express = require('express');
let router = express.Router();

let validator = require('../middlewares/Validator');
let users = require('../services/users/Users');

router.get('/login', validator, function(req, res, next) {
    if (!req.user_payload && !req.user_payload.sub) res.sendStatus(500);

    let userID = req.user_payload.sub;
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
