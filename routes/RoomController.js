const express = require('express');
const router = express.Router();
const securityUtils = require('../modules/utils/SecurityUtil');
const roomService = require('../modules/room/RoomService');
const guestService = require('../modules/guests/GuestsService');
const errorUtils = require('../modules/utils/ErrorConstants');

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
router.post('/add-guest', (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        guestService.addGuestToRoom(req.body, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(201).send(result);
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
router.ws('/guests/:roomId', function (ws, req) {
    ws.on('message', function (msg) {
        const params = req.params
        const roomId = params.roomId;
        console.log(msg);
        guestService.getRoomGuests(roomId, function (result) {
            if (result === null || result === undefined) {
                ws.send({"guests": []});
            } else {
                ws.send(result);
            }
        });
    });
});
router.get('/guests/:roomId', securityUtils.authenticateToken, function (req, res) {
    const params = req.params;
    const roomId = params.roomId;
    guestService.getRoomGuests(roomId, function (result) {
        if (result === null || result === undefined) {
            res.status(200).send({"guests": []});
        } else {
            res.status(200).send(result);
        }
    });
});
module.exports = router;
