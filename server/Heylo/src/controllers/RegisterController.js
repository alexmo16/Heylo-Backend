let express = require('express');
let router = express.Router();

let validator = require('../middlewares/Validator');
let userModel = require('../models/UserModel');

// get register page
router.get('/register', function(req, res, next) {
    res.sendFile('C:/Users/Morel/Documents/dev/Heylo/server/Heylo/public/register.html');
});

// create a new user
router.post('/register', validator, function(req, res, next) {
    if (!req.body.username) return res.sendStatus(400);
    if (!req.user_payload) return res.sendStatus(500);
    let userInfo = req.user_payload;
    if (!userInfo.family_name || !userInfo.given_name || !userInfo.sub) return res.status(500).json(`unable to get user's informations.`);

    let userData = {
        username: req.body.username,
        firstname: userInfo.given_name,
        lastname: userInfo.family_name,
        user_id: userInfo.sub
    };
    let newUser = new userModel(userData);
    newUser.save(function(err) {
        if (err)  {
            if (err.code === 11000) {
                return res.status(409).json('this user already exists');
            } else {
                return res.sendStatus(500);
            }
        }

        return res.status(201).json({
            username: newUser.username,
            firstName: newUser.firstname,
            lastName: newUser.lastname,
            creation_date: newUser.creation_date
        });
    });    
});

module.exports = router;
