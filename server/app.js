let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let helmet = require('helmet');

let db = require('./db');
let routes = require('./routes');
let app = express();

// Third-party modules for our server.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet({
    frameguard: {
      action: 'deny'
    }
}));

// Connect all our routes to our application.
routes(app);

module.exports = app;
