const express = require('express');
const router = express.Router();
const securityUtils = require('../modules/utils/SecurityUtil');
const roomService = require('../modules/room/roomService');
const guestService = require('../modules/guests/GuestsService');
const errorUtils = require('../modules/utils/ErrorConstants');

router.get('/', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
    roomService.getRooms(userId, function (result) {
        const responseObject = result;
        if (responseObject.error === null) {
            res.status(200).send(responseObject.response);
        } else if (responseObject.error === errorUtils.NO_ROOM_FOUND) {
            res.status(200).send([]);
        }
    });
});
router.get('/:roomId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
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
    const userId = req.claims.user.userId;
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
    const userId = req.claims.user.userId;
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
router.post('/add-guest', securityUtils.authenticateToken, (req, res) => {
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

module.exports = router;
