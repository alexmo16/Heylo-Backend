let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let helmet = require('helmet');
let mongoose = require('mongoose');

let indexController = require('./src/controllers/IndexController');
let userController = require('./src/controllers/UserController');
let loginController = require('./src/controllers/LoginController');
let registerController = require('./src/controllers/RegisterController');

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

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useCreateIndex: true
});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(indexController);
app.use(userController);
app.use(loginController);
app.use(registerController);

module.exports = app;
