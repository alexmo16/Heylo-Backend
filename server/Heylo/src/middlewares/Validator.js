const {OAuth2Client} = require('google-auth-library');
let GAuth = require('./GAuth');
const client = new OAuth2Client(process.env.CLIENT_ID, process.env.SECRET_ID);

let validator = function(req, res, next) {
    let uToken = req.headers.g_token;
    GAuth.verify(uToken, function(userPayload) {
        console.log('validated user');
        req.user_payload = userPayload;
        next();
    }).catch(function () {
        console.error;
        return res.sendStatus(401);
    });
};

module.exports = validator;
