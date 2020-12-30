require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
    authenticateToken: function (req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) {
            console.log("Token is null")
            res.sendStatus(401)
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET.toString(), (err, claims) => {
            if (err) {
                console.log(err);
                res.sendStatus(403)
            }
            req.claims = claims
            next()
        })
    },
    hashPassword: function (password, callback) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.log("Could not hash password, following error happened: " + err);
                throw err;
            }
            return callback(hash);
        });
    },
    compareStrings: function (rawString, hashedString, callback) {
        bcrypt.compare(rawString, hashedString, function (err, res) {
            if (err) {
                console.log("Could not compare strings, following error happened: " + err);
                throw err;
            }
            return callback(res);
        });
    },
    generateAccessToken: function (payload) {
        return jwt.sign({payload}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
    }
}
