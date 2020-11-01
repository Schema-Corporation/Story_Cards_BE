const express = require('express');
const registrationService = require("../modules/registration/registrationService");
const errorUtils = require("../modules/utils/ErrorConstants");
const router = express.Router();

router.post('/validate-code/:code', (req, res) => {
    const params = req.params
    const code = params.code;
    const ipAddress = req.header("X-IP");
    registrationService.validateBookCode(code, ipAddress, function (result) {
        const responseObject = result;
        if (responseObject.error === null) {
            const isValid = responseObject.response.bookCode != null;
            if (isValid) {
                res.status(200).send(result);
            } else {
                res.status(422).send({"error": "Could not validate code since it does not exists or has been used!"});
            }
        } else {
            const errorCode = responseObject.error;
            if (errorCode === errorUtils.TOO_MANY_ATTEMPTS) {
                res.status(403).send({"error": "Too many attempts from this ip address have been made"});
            } else if (errorCode === errorUtils.BOOK_DOES_NOT_EXIST) {
                res.status(422).send({"error": "Could not validate code since it does not exists or has been used!"});
            } else {
                res.status(500).send({"error": "Internal Server Error"});
            }
        }
    })
})
router.post('/register', (req, res) => {
    const body = req.body;
    registrationService.registerUser(body, function (result) {
            if (result != null) {
                res.status(201).send(result);
            } else {
                res.status(422).send({"error": "Could not register user due to code or user duplication!"});
            }
        }
    );
})
module.exports = router;