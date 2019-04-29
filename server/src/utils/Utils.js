let jwt = require('jsonwebtoken');

module.exports = class Utils {
    static createToken() {
        let token = jwt.sign({}, process.env.privateKey, {
            expiresIn: 604800 // expires in 1 week
        });
        return token;
    }
};