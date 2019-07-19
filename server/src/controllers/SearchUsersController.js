let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let users = require('../services/users/users');
let httpError = require('../utils/HttpError');

router.all('/search/users*', validators.validator);


router.get('/search/users', function (req, res, next) {
    if (!req.query.username || !(typeof req.query.username === 'string')) return res.sendStatus(httpError.BAD_REQUEST);

    let top = req.query.username;
    let triedUsername = req.query.username;

    users.fuzzyUsersSearch(triedUsername, top, function (err, users) {
        if (err) return next(err);

        return res.status(httpError.OK).json(users);
    });
});


module.exports = router;
