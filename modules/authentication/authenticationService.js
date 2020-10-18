require('dotenv').config();
const jwt = require("jsonwebtoken");
const authenticationRepository = require('../repository/userRepository.js')

module.exports = {
    signIn: function (username, password) {
        return authenticationRepository.findUserByUsername(username).then(user => {
            if (user != null && user.password === password) {
                return {
                    "token": generateAccessToken({"username": user.username, "fullName": user.fullName}),
                    "user": user
                };
            } else {
                console.log("Error authenticating user")
                return null;
            }
        });
    }
}

function generateAccessToken(user) {
    return jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1800s'});
}
