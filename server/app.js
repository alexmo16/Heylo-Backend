let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let helmet = require('helmet');
let cors = require('cors');
let errorHandler = require('errorHandler');

require('./env');
require('./db');
let routes = require('./routes');
let app = express();

// Third-party modules for our server.
app.use(helmet({
    frameguard: {
        action: 'deny'
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: process.env.ORIGIN
}));

if (process.env.NODE_ENV !== 'production') {
    app.use(logger('dev'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

// Connect all our routes to our application.
routes(app);

module.exports = app;
