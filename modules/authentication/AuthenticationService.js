if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const authenticationRepository = require('../repository/UserRepository.js')
const securityUtil = require('../utils/SecurityUtil')
module.exports = {
    signIn: function (username, password, callback) {
        return authenticationRepository.findUserByUsername(username, function (user) {
            if (user != null && password != null && user.password != null) {
                securityUtil.compareStrings(password, user.password, function (validationResult) {
                    if (validationResult) {
                        return callback({
                            "token": securityUtil.generateAccessToken({
                                "user": {
                                    "username": user.username,
                                    "fullName": user.fullName,
                                    "userId": user.id
                                }
                            }),
                            "fullName": user.fullName
                        });
                    } else {
                        console.log("Password did not match!");
                        return callback(null);
                    }
                });
            } else {
                console.log("Error authenticating user");
                return callback(null);
            }
        });
    }
}

