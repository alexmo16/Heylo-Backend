let express = require('express');
let router = express.Router();

let validator = require('../authentification/Validator');
const User = require('../business/User');
const UserMapper = require('../persistence/UserMapper');

router.all('/register', validator);

router.get('/register', function(req, res, next) {
    res.sendFile('C:/Users/Morel/Documents/dev/Heylo/server/Heylo/public/register.html');
});

router.post('/register', function(req, res, next) {
    let newUser = new User('admin', 'admin', 'test');

    UserMapper.findOne(newUser.getUsername(), function(err, result) {
        if (err) res.status(500).json(err);
        console.log(result);
        if (result === null) {
            UserMapper.insert(newUser.getUsername(), newUser.getFirstName(), newUser.getLastName(), function(err, result) {
                if (err) {
                    res.status(500).json(err);
                    return;
                }
                res.status(202).json({
                    username: newUser.getUsername(),
                    firstName: newUser.getFirstName(),
                    lastName: newUser.getLastName()
                });
            });
        } else {
            res.status(409).json(`user ${newUser.getFirstName()} ${newUser.getLastName()} with username ${newUser.getUsername()} already exist.`);
        }
    });
});

module.exports = router;
