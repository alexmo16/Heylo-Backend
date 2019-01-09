let express = require('express');
let validator = require('../middlewares/Validator');
let router = express.Router();

let usersModel = require('../models/UserModel');

router.all('/users', validator);

router.get('/users', function(req, res, next) {
    if (!req.query.username || !req.query.username instanceof String) return res.sendStatus(400);

    let top = req.query.username;
    let triedUsername = req.query.username;
    let data = {
        username: new RegExp(triedUsername, 'i')
    };

    usersModel.find(data, function(err, users) {
        if (err) return next(err);
        if (top && Number.isInteger(top)) {
            users.splice(0, top);
        }

        return res.status(200).json(users);
    }).select('-user_id -creation_date -__v');
});

module.exports = router;
