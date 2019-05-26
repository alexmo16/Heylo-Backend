let jwt = require('jsonwebtoken');

module.exports = class Utils {

    /**
     * Create a new jwt (json web token) with an time to live of 1 week.
     * @param {Object} payload - Object representing the payload to put in the json web token.
     */
    static createToken(payload) {
        let token = jwt.sign(payload, process.env.privateKey, {
            expiresIn: 604800 // expires in 1 week
        });
        return token;
    }
};