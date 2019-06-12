let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let users = require('../services/users/Users');
let httpError = require('../utils/HttpError');

router.all('/user*', validators.validator);


router.get('/user', function(req, res, next) {
    if (!req.userID) return res.sendStatus(httpError.INTERNAL_SERVER_ERROR);

    let userID = req.user.userID;
    users.findUserByID(userID, function(err, user) {
        if (err) return next(err);

        if (!user) return res.status(httpError.NOT_FOUND).json('user not found');

        let responseJson = {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            creation_date: user.creation_date
        };

        return res.status(httpError.OK).json(responseJson); 
    });
});


module.exports = router;
