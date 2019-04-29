module.exports = function(app){
    let indexController = require('./src/controllers/IndexController');
    let searchUsersController = require('./src/controllers/SearchUsersController');
    let userController = require('./src/controllers/UserController');
    let loginController = require('./src/controllers/LoginController');
    let registerController = require('./src/controllers/RegisterController');
    let userChatController = require('./src/controllers/UserChatController');
    let gauthTestController = require('./src/controllers/GAuthTestController');

    app.use(indexController);
    app.use(searchUsersController);
    app.use(userController);
    app.use(loginController);
    app.use(registerController);
    app.use(userChatController);
    app.use(gauthTestController);
};
