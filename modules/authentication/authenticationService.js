require('dotenv').config();
const jwt = require("jsonwebtoken");
const authenticationRepository = require('./authenticationRepository.js')

module.exports = {
    signIn: function (username, password) {
        return authenticationRepository.findUserByUsername(username).then(user => {
            if (user.password === password) {
                return generateAccessToken(username);
            } else {
                return null;
            }
        });
    }
}

function generateAccessToken(username) {
    return jwt.sign({username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1800s'});
}
