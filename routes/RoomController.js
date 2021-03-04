const express = require('express');
const router = express.Router();
const securityUtils = require('../modules/utils/SecurityUtil');
const roomService = require('../modules/room/RoomService');
const guestService = require('../modules/guests/GuestsService');
const errorUtils = require('../modules/utils/ErrorConstants');

let guestListClients = {};

router.get('/detail/:roomId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    const params = req.params
    const roomId = params.roomId;
    if (roomId === null || roomId === undefined) {
        res.status(422).send({"error": "Room Id is required!"})
    }
    roomService.getRoomById(userId, roomId, function (result) {
        if (result === null) {
            res.status(500).send("Internal Server Error");
        } else if (result.error != null) {
            res.status(422).send(result);
        } else {
            res.status(200).send(result);
        }
    });
});

router.post('/add-guest', (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        guestService.addGuestToRoom(req.body, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else {
                var responseObject = {
                    operation: 'add-guest',
                    guest: result.guestData
                }
                if (guestListClients[result.guestData.roomId] != null && guestListClients[result.guestData.roomId].length > 0) {
                    guestListClients[result.guestData.roomId].forEach(client => {
                        client.send(JSON.stringify(responseObject));
                    });
                }
                res.status(201).send(result);
            }
        });
    }
});

router.delete('/remove-guest/:guestId/:roomId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    const guestId = req.params.guestId;
    const roomId = req.params.roomId;
    if (guestId === null || guestId === undefined) {
        res.status(422).send({"error": "Guest Id is required!"})
    } else {
        guestService.removeGuest(guestId, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else if (result.error != null) {
                res.status(422).send(result);
            } else {
                var responseObject = {
                    operation: 'remove-guest',
                    guestId: guestId
                }
                if (guestListClients[roomId] != null && guestListClients[roomId].length > 0) {
                    guestListClients[roomId].forEach(client => {
                        client.send(JSON.stringify(responseObject));
                    });
                }
                res.status(204).send();
            }
        });
    }
});

router.delete('/remove-guest', securityUtils.authenticateToken, (req, res) => {
    const guestId = req.claims.payload.guestId;
    const roomId = req.claims.payload.roomId;
    if (guestId === null || guestId === undefined) {
        res.status(422).send({"error": "Guest Id is required!"})
    } else {
        guestService.removeGuest(guestId, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else if (result.error != null) {
                res.status(422).send(result);
            } else {
                var responseObject = {
                    operation: 'remove-guest',
                    guestId: guestId
                }
                if (guestListClients[roomId] != null && guestListClients[roomId].length > 0) {
                    guestListClients[roomId].forEach(client => {
                        client.send(JSON.stringify(responseObject));
                    });
                }
                res.status(204).send();
            }
        });
    }
});

router.post('/validate-code', (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        roomService.validateRoomCode(req.body.roomCode, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else if (result.error !== undefined) {
                res.status(422).send({"error": result.error});
            } else {
                res.status(200).send(result);
            }
        });
    }
});

router.ws('/guests/ws/:roomId', function (ws, req) {
    
    guestListClients[req.params.roomId] = guestListClients[req.params.roomId] || [];
    guestListClients[req.params.roomId].push(ws);

    ws.on('close', function() {
        var index = guestListClients[req.params.roomId].indexOf(ws);
        if (index != -1) {
            guestListClients[req.params.roomId].splice(index, 1);
            if (guestListClients[req.params.roomId].length == 0) {
                guestListClients[req.params.roomId] = null;
            }
        }
    });
});

router.get('/guests/:roomId', function (req, res) {
    const params = req.params;
    const roomId = params.roomId;
    guestService.getRoomGuests(roomId, function (result) {
        console.log(result);
        if (result === null || result === undefined || result.length < 1) {
            res.status(200).send([]);
        } else {
            res.status(200).send(result);
        }
    });
});
router.put('/guests/', securityUtils.authenticateToken, function (req, res) {
    const guestId = req.claims.payload.guestId;
    const roomId = req.claims.payload.roomId;
    const status = req.body.status;
    guestService.updateGuest(guestId, status, function (result) {
        if (result === null || result === undefined) {
            res.status(200).send({"guests": []});
        } else {
            var responseObject = {
                operation: status == 1 ? 'leave-waiting-room' : status == 2 ? 'enter-waiting-room': 'undefined',
                guestId: guestId
            }
            if (guestListClients[roomId] != null && guestListClients[roomId].length > 0) {
                guestListClients[roomId].forEach(client => {
                    client.send(JSON.stringify(responseObject));
                });
            }
            res.status(200).send(result);
        }
    });
});
router.delete('/:roomId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    const params = req.params
    const roomId = params.roomId;
    if (roomId === null || roomId === undefined) {
        res.status(422).send({"error": "Room Id is required!"})
    }
    roomService.deleteRoom(userId, roomId, function (result) {
        if (result === null) {
            res.status(500).send("Internal Server Error");
        } else if (result.error != null) {
            res.status(422).send(result);
        } else {
            res.status(204).send();
        }
    });
});
router.put('/:roomId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    const roomId = req.params.roomId;
    const enabled = req.body.enabled;
    if (roomId === null || roomId === undefined) {
        res.status(422).send({"error": "Room Id is required!"})
    }
    roomService.updateRoom(userId, roomId, enabled, function (result) {
        if (result === null) {
            res.status(500).send("Internal Server Error");
        } else if (result.error != null) {
            res.status(422).send(result);
        } else {
            res.status(204).send();
        }
    });
});

router.post('/', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        roomService.createRoom(userId, req.body, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(201).send(result);
            }
        });
    }
});

router.get('/', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.payload.user.userId;
    roomService.getRooms(userId, function (result) {
        const responseObject = result;
        if (responseObject.error === null) {
            res.status(200).send(responseObject.response);
        } else if (responseObject.error === errorUtils.NO_ROOM_FOUND) {
            res.status(200).send([]);
        }
    });
});

module.exports = router;
