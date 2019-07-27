module.exports = function (app) {
    // Add always enabled routes.
    let controllers = {
        indexController: require('./src/controllers/IndexController'),
        searchUsersController: require('./src/controllers/SearchUsersController'),
        userController: require('./src/controllers/UserController'),
        loginController: require('./src/controllers/LoginController'),
        registerController: require('./src/controllers/RegisterController'),
        userChatController: require('./src/controllers/UserChatController'),
        friendsController: require('./src/controllers/FriendsController'),
        passwordController: require('./src/controllers/PasswordController'),
        privacyController: require('./src/controllers/PrivacyController')
    }

    // Add DEV only routes.
    if (process.env.NODE_ENV !== 'production') {
        controllers['gauthTestController'] = require('./src/controllers/GAuthTestController');
    }

    Object.keys(controllers).forEach(function (controllerName) {
        app.use(controllers[controllerName]);
    });
};
