let jwt = require('jsonwebtoken');

module.exports = class Utils {
    static createToken(payload) {
        let token = jwt.sign(payload, process.env.privateKey, {
            expiresIn: 604800 // expires in 1 week
        });
        return token;
    }
};