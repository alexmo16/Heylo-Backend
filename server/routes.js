module.exports = function(app){
    let indexController = require('./src/controllers/IndexController');
    let usersController = require('./src/controllers/UsersController');
    let loginController = require('./src/controllers/LoginController');
    let registerController = require('./src/controllers/RegisterController');
    let userChatController = require('./src/controllers/UserChatController');
    let gauthTestController = require('./src/controllers/GAuthTestController');

    app.use(indexController);
    app.use(usersController);
    app.use(loginController);
    app.use(registerController);
    app.use(userChatController);
    app.use(gauthTestController);
};
