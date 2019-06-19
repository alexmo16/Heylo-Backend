module.exports = function(app) {
    let controllers = {
        indexController : require('./src/controllers/IndexController'),
        searchUsersController : require('./src/controllers/SearchUsersController'),
        userController : require('./src/controllers/UserController'),
        loginController : require('./src/controllers/LoginController'),
        registerController : require('./src/controllers/RegisterController'),
        userChatController : require('./src/controllers/UserChatController'),
        gauthTestController : require('./src/controllers/GAuthTestController'),
        friendsController : require('./src/controllers/FriendsController'),
        passwordController : require('./src/controllers/PasswordController'),
        privacyController : require('./src/controllers/PrivacyController')
    }

    Object.keys(controllers).forEach(function(controllerName) {
        app.use(controllers[controllerName]); 
    });
};
