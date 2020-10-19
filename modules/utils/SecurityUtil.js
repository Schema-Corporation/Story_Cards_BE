const tokenSecret = process.env.ACCESS_TOKEN_SECRET
require('dotenv').config();
const jwt = require("jsonwebtoken");

module.exports = {
    authenticateToken: function (req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) {
            console.log("Token is null")
            res.sendStatus(401)
        }
        jwt.verify(token, tokenSecret.toString(), (err, claims) => {
            if (err) {
                console.log(err);
                res.sendStatus(403)
            }
            req.claims = claims
            next()
        })
    }
}
