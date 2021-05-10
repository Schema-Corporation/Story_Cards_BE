const express = require('express');
const router = express.Router();

const userService = require('../modules/users/UsersService');
const securityUtils = require('../modules/utils/SecurityUtil');


router.get('/affiliates', securityUtils.authenticateToken, (req, res) => {
    userService.getAffiliateUsers(value => {
        if (value) {
            res.status(200).send(value);
        } else {
            res.status(404).send("No users found");
        }
    });
});

module.exports = router;