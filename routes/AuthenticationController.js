const express = require('express');
const router = express.Router();
const authenticationService = require('../modules/authentication/AuthenticationService');
const securityUtils = require('../modules/utils/SecurityUtil');

router.post('/login', (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    const credentials = Buffer.from(token, 'base64').toString()
    const user = credentials.split(":")[0]
    const password = credentials.split(":")[1]
    authenticationService.signIn(user, password, function (value) {
        if (value != null) {
            res.send({"token": value.token, "fullName": value.fullName});
        } else {
            res.status(401).send("User and Password do not match!");
        }
    })
});
router.get('/validate-role', securityUtils.authenticateToken, (req, res) => {
    const payload = req.claims.payload;
    if (payload.guestId !== undefined) {
        res.send({"role": "GUEST"});
    } else if (payload.user !== undefined) {
        res.send({"role": "HOST"});
    } else {
        res.status(500).send({"Error": "Could not validate role"});
    }
});
router.get('/check-user-activity', securityUtils.authenticateToken, (req, res) => {
    const guestId = req.claims.payload.guestId;
    const roomId = req.claims.payload.roomId;
    authenticationService.checkActivity(guestId, roomId, function (value) {
        if (value) {
            res.status(200).send(true);
        } else {
            res.status(500).send({"Error": "Could not validate role"});
        }
    });
});

module.exports = router;
