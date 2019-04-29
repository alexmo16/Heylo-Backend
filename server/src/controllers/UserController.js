let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let users = require('../services/users/Users');

router.all('/user', validators.validator);

router.get('/user', function(req, res, next) {
    if (!req.userID) return res.sendStatus(500);

    let userID = req.userID;
    users.findUserByID(userID, function(err, user) {
        if (err) return next(err);

        if (!user) return res.status(404).json('user not found');

        let responseJson = {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            creation_date: user.creation_date
        };

        return res.status(200).json(responseJson); 
    });
});

module.exports = router;
