let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let helmet = require('helmet');

let indexController = require('./src/routes/IndexController');
let usersController = require('./src/routes/UsersController');
let loginController = require('./src/routes/LoginController');
let registerController = require('./src/routes/RegisterController');

let app = express();

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

app.use(indexController);
app.use(usersController);
app.use(loginController);
app.use(registerController);

module.exports = app;
