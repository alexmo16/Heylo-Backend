let express = require('express');
let router = express.Router();

let validator = require('../middlewares/Validator');
let gAuth = require('../middlewares/GAuth');
const User = require('./UserController');

// get register page
router.get('/register', function(req, res, next) {
    res.sendFile('C:/Users/Morel/Documents/dev/Heylo/server/Heylo/public/register.html');
});

// create a new user
router.post('/register', validator, function(req, res, next) {
    gAuth.getUserInfo(req.headers.g_token, function(err, userInfo) {
        if (err) {
            res.status(500).json(err);
            return;
        }
        let newUser = new User('test', 'admin', 'admin');
        res.sendStatus(202);
                    // res.status(202).json({
                    //     username: newUser.getUsername(),
                    //     firstName: newUser.getFirstName(),
                    //     lastName: newUser.getLastName()
                    // });
        //res.status(409).json(`user ${newUser.getFirstName()} ${newUser.getLastName()} with username ${newUser.getUsername()} already exist.`);
    });
});

module.exports = router;
