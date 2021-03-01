const express = require('express');
const router = express.Router();
const securityUtils = require('../modules/utils/SecurityUtil');
const gameService = require('../modules/game/GameService');
const errorUtils = require('../modules/utils/ErrorConstants');

let guestWaitingRoom = {};

router.post('/', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    const roomId = req.body.roomId;
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        gameService.createGame(userId, req.body, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else {
                var responseObject = {
                    operation: 'start-game',
                    gameId: result.id
                }
                if (guestWaitingRoom[roomId] != null && guestWaitingRoom[roomId].length > 0) {
                    guestWaitingRoom[roomId].forEach(client => {
                        client.send(JSON.stringify(responseObject));
                    });
                }
                res.status(201).send(result);
            }
        });
    }
});

router.ws('/game-waiting-room/ws/:roomId', function (ws, req) {
    
    guestWaitingRoom[req.params.roomId] = guestWaitingRoom[req.params.roomId] || [];
    guestWaitingRoom[req.params.roomId].push(ws);

    ws.on('close', function() {
        var index = guestWaitingRoom[req.params.roomId].indexOf(ws);
        if (index != -1) {
            guestWaitingRoom[req.params.roomId].splice(index, 1);
            if (guestWaitingRoom[req.params.roomId].length == 0) {
                guestWaitingRoom[req.params.roomId] = null;
            }
        }
    });
});

module.exports = router;