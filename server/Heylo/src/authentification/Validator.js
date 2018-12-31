const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client(process.env.CLIENT_ID);

let validator = function(req, res, next) {
    if (req.path === '/register') {
        return next();
    }

    let uToken = req.headers.g_token;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: uToken,
            audience: process.env.CLIENT_ID,
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        if (ticket && payload && userid) {
            return next();
        }
    }
    verify().catch(function (error) {
        console.error;
        return res.sendStatus(401);
    });
};

module.exports = validator;
