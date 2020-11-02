if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const jwt = require("jsonwebtoken");
const authenticationRepository = require('../repository/userRepository.js')
const securityUtil = require('../utils/SecurityUtil')
module.exports = {
    signIn: function (username, password, callback) {
        return authenticationRepository.findUserByUsername(username, function (user) {
            if (user != null && password != null && user.password != null) {
                securityUtil.compareStrings(password, user.password, function (validationResult) {
                    if (validationResult) {
                        return callback({
                            "token": generateAccessToken({
                                "username": user.username,
                                "fullName": user.fullName,
                                "userId": user.id
                            }),
                            "user": user
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

function generateAccessToken(user) {
    return jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
}
