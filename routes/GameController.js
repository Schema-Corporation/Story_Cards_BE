const express = require('express');
const router = express.Router();
const securityUtils = require('../modules/utils/SecurityUtil');
const gameService = require('../modules/game/GameService');
const errorUtils = require('../modules/utils/ErrorConstants');

router.post('/', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        gameService.createGame(userId, req.body, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(201).send(result);
            }
        });
    }
});
module.exports = router;