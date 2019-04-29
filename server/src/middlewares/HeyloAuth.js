let jwt = require('jsonwebtoken');

module.exports = class HeyloAuth {
    static verify(token, next) {
        jwt.verify(token, process.env.privateKey, function(err) {
            return next(err);
        });
    }
}
