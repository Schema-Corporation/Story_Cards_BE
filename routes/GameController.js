const express = require('express');
const router = express.Router();
const securityUtils = require('../modules/utils/SecurityUtil');
const gameService = require('../modules/game/GameService');
const errorUtils = require('../modules/utils/ErrorConstants');

let guestWaitingRoom = {};
let guestWaitingGame = {};
let guestWaitingScores = {};
let challengesApprovalGuestRoom = {};
let challengesHostGuestRoom = {};
let answersRoom = {};

router.ws('/challenges-host-approval/ws/:gameId', function (ws, req) {
    challengesHostGuestRoom[req.params.gameId] = challengesHostGuestRoom[req.params.gameId] || [];
    challengesHostGuestRoom[req.params.gameId].push(ws);

    ws.on('close', function () {
        let index = challengesHostGuestRoom[req.params.gameId].indexOf(ws);
        if (index !== -1) {
            challengesHostGuestRoom[req.params.gameId].splice(index, 1);
            if (challengesHostGuestRoom[req.params.gameId].length === 0) {
                challengesHostGuestRoom[req.params.gameId] = null;
            }
        }
    });
});

router.ws('/challenges-approval/ws/:guestId', function (ws, req) {
    challengesApprovalGuestRoom[req.params.guestId] = challengesApprovalGuestRoom[req.params.guestId] || [];
    challengesApprovalGuestRoom[req.params.guestId].push(ws);

    ws.on('close', function () {
        let index = challengesApprovalGuestRoom[req.params.guestId].indexOf(ws);
        if (index !== -1) {
            challengesApprovalGuestRoom[req.params.guestId].splice(index, 1);
            if (challengesApprovalGuestRoom[req.params.guestId].length === 0) {
                challengesApprovalGuestRoom[req.params.guestId] = null;
            }
        }
    });
});

router.ws('/game-waiting-game/ws/:gameId', function (ws, req) {

    guestWaitingGame[req.params.gameId] = guestWaitingGame[req.params.gameId] || [];
    guestWaitingGame[req.params.gameId].push(ws);

    ws.on('close', function () {
        let index = guestWaitingGame[req.params.gameId].indexOf(ws);
        if (index !== -1) {
            guestWaitingGame[req.params.gameId].splice(index, 1);
            if (guestWaitingGame[req.params.gameId].length === 0) {
                guestWaitingGame[req.params.gameId] = null;
            }
        }
    });
});

router.post('/start-game/:gameId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    const gameId = req.params.gameId;
    let responseObject = {
        operation: 'go-start',
        gameId: gameId
    }
    if (guestWaitingGame[gameId] != null && guestWaitingGame[gameId].length > 0) {
        guestWaitingGame[gameId].forEach(client => {
            client.send(JSON.stringify(responseObject));
        });
    }
    res.status(201).send(true);
});

router.ws('/game-waiting-room/ws/:roomId', function (ws, req) {

    guestWaitingRoom[req.params.roomId] = guestWaitingRoom[req.params.roomId] || [];
    guestWaitingRoom[req.params.roomId].push(ws);

    ws.on('close', function () {
        let index = guestWaitingRoom[req.params.roomId].indexOf(ws);
        if (index !== -1) {
            guestWaitingRoom[req.params.roomId].splice(index, 1);
            if (guestWaitingRoom[req.params.roomId].length === 0) {
                guestWaitingRoom[req.params.roomId] = null;
            }
        }
    });
});

router.post('/finish-game/:gameId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    const gameId = req.params.gameId;
    let responseObject = {
        operation: 'go-finish',
        gameId: gameId
    }
    if (guestWaitingScores[gameId] != null && guestWaitingScores[gameId].length > 0) {
        guestWaitingScores[gameId].forEach(client => {
            client.send(JSON.stringify(responseObject));
        });
    }
    res.status(201).send(true);
});

router.ws('/game-waiting-scores/ws/:roomId', function (ws, req) {

    guestWaitingScores[req.params.roomId] = guestWaitingScores[req.params.roomId] || [];
    guestWaitingScores[req.params.roomId].push(ws);

    ws.on('close', function () {
        let index = guestWaitingScores[req.params.roomId].indexOf(ws);
        if (index !== -1) {
            guestWaitingScores[req.params.roomId].splice(index, 1);
            if (guestWaitingScores[req.params.roomId].length === 0) {
                guestWaitingScores[req.params.roomId] = null;
            }
        }
    });
});

router.post('/add-challenge/:gameId', securityUtils.authenticateToken, (req, res) => {
    const requestBody = req.body;
    const gameId = req.params.gameId;
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        gameService.addChallengeToGame(requestBody, function (result) {
            let responseObject = {
                operation: 'challenge-received',
                challenge: requestBody
            }
            if (challengesHostGuestRoom[gameId] != null && challengesHostGuestRoom[gameId].length > 0) {
                challengesHostGuestRoom[gameId].forEach(client => {
                    client.send(JSON.stringify(responseObject));
                });
            }
            res.status(201);
            res.send({"challengesOnList": result});
        });
    }
});
router.get('/challenges/:gameId', securityUtils.authenticateToken, (req, res) => {
    const gameId = req.params.gameId;
    if (gameId === null || gameId === undefined) {
        res.status(422).send({"error": "Game Id must not be null"});
    } else {
        gameService.getChallengesFromWaitingRoom(gameId, function (result) {
            res.status(200);
            res.send(result);
        });
    }
});
router.put('/challenges/:gameId', securityUtils.authenticateToken, (req, res) => {
    const gameId = req.params.gameId;
    const requestBody = req.body;
    if (gameId === null || gameId === undefined) {
        res.status(422).send({"error": "Game Id must not be null"});
    } else if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        gameService.editChallengeStatus(gameId, requestBody.guestId, requestBody.status, requestBody.points, function (result) {
            let responseObject = {
                operation: 'challenge-approved'
            }
            if (challengesApprovalGuestRoom[requestBody.guestId] != null && challengesApprovalGuestRoom[requestBody.guestId].length > 0) {
                challengesApprovalGuestRoom[requestBody.guestId].forEach(client => {
                    client.send(JSON.stringify(responseObject));
                });
            }
            res.status(200);
            res.send(result);
        });
    }
});
router.delete('/challenges/:gameId/guest/:guestId', securityUtils.authenticateToken, (req, res) => {
    const gameId = req.params.gameId;
    const guestId = req.params.guestId;
    if (gameId === null || gameId === undefined) {
        res.status(422).send({"error": "Game Id must not be null"});
    } else {
        gameService.deleteChallenge(gameId, guestId, function (result) {
            if (result === null) {
                res.status(422);
                res.send({"error": "Could not find any challenge with given guest ID!"});
            } else if (result === undefined) {
                res.status(422);
                res.send({"error": "Redis List is empty for the given key!"})
            } else {
                let responseObject = {
                    operation: 'challenge-rejected'
                }
                if (challengesApprovalGuestRoom[guestId] != null && challengesApprovalGuestRoom[guestId].length > 0) {
                    challengesApprovalGuestRoom[guestId].forEach(client => {
                        client.send(JSON.stringify(responseObject));
                    });
                }
                res.status(200);
                res.send({"operationResult": result});
            }
        });
    }
});
router.post('/answer/:gameId', securityUtils.authenticateToken, (req, res) => {
    const guestId = req.claims.payload.guestId;
    const gameId = req.params.gameId;
    const answerData = req.body.answerData;
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        // post to answers services
        // notify 
        let responseObject = {
            operation: 'answer-received',
            answer: answerData
        }
        if (answersRoom[gameId] != null && answersRoom[gameId].length > 0) {
            answersRoom[gameId].forEach(client => {
                client.send(JSON.stringify(responseObject));
            });
        }
        res.status(204).send();
    }
});

router.get('/evaluate-answers/:gameId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    const gameId = req.params.gameId;
    res.status(200).send([]);
});
router.ws('/evaluate-answers/ws/:gameId', function (ws, req) {

    answersRoom[req.params.gameId] = answersRoom[req.params.gameId] || [];
    answersRoom[req.params.gameId].push(ws);

    ws.on('close', function () {
        let index = answersRoom[req.params.gameId].indexOf(ws);
        if (index != -1) {
            answersRoom[req.params.gameId].splice(index, 1);
            if (answersRoom[req.params.gameId].length == 0) {
                answersRoom[req.params.gameId] = null;
            }
        }
    });
});

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
                let responseObject = {
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

module.exports = router;
