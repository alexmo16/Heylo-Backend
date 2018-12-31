class User {
    constructor(firstName = '', lastName = '', username= '') {
        this.__firstName = firstName;
        this.__lastName = lastName;
        this.__username = username === '' ?  `${this.__firstName} ${this.__lastName}` : username;
    }

    setUsername(username) {
        this.__username = username;
    }

    getUsername() {
        return this.__username;
    }

    setFirstName(firstName) {
        this.__firstName = firstName;
    }

    getFirstName() {
        return this.__firstName;
    }

    setLastName(lastName) {
        this.__lastName;
    }

    getLastName() {
        return this.__lastName;
    }
}

module.exports = User;
