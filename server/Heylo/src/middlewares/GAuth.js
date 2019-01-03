const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client(process.env.CLIENT_ID, process.env.SECRET_ID);

class GAuth {
    static async verify(token, next) {
        const ticket = await client.verifyIdToken({
            idToken: token,
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

    static async getUserInfo(token, next) {
        const userInfo = await client.getTokenInfo(token);
        return next(null, userInfo);
    }
}

module.exports = GAuth;
