require('dotenv').config();
const jwt = require("jsonwebtoken");
const authenticationRepository = require('../repository/userRepository.js')

module.exports = {
    signIn: function (username, password) {
        return authenticationRepository.findUserByUsername(username).then(user => {
            if (user != null && user.password === password) {
                return {"token": generateAccessToken(username), "user": user};
            } else {
                console.log("Error authenticating user")
                return null;
            }
        });
    }
}

function generateAccessToken(username) {
    return jwt.sign({username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1800s'});
}
