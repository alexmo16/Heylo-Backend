/** Load differents environment variables */
if (process.env.production) {
    require('dotenv').config({ path: 'config/production/.env' });
} else {
    require('dotenv').config({ path: 'config/development/.env' });
}