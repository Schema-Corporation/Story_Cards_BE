const express = require('express');
const router = express.Router();
const authenticationService = require('../modules/authentication/authenticationService');

router.post('/login', (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    const credentials = Buffer.from(token, 'base64').toString()
    const user = credentials.split(":")[0]
    const password = credentials.split(":")[1]
    authenticationService.signIn(user, password, function (value) {
        if (value != null) {
            res.send({"token": value.token, "fullName": value.user.fullName});
        } else {
            res.status(401).send("User and Password do not match!");
        }
    })
})

module.exports = router;
