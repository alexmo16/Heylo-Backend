let express = require('express');
let validators = require('../middlewares/Validators');
let router = express.Router();

let users = require('../services/users/users');

router.all('/search/users*', validators.validator);


router.get('/search/users', function(req, res, next) {
    if (!req.query.username || !req.query.username instanceof String) return res.sendStatus(400);

    let top = req.query.username;
    let triedUsername = req.query.username;

    users.fuzzyUsersSearch(triedUsername, top, function(err, users) {
        if (err) return next(err);

        return res.status(200).json(users);
    });
});


module.exports = router;
