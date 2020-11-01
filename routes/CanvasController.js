const express = require('express');
const router = express.Router();
const securityUtils = require('../modules/utils/SecurityUtil');
const canvasService = require('../modules/canvas/canvasService');
const errorUtils = require('../modules/utils/ErrorConstants');

router.get('/', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
    canvasService.getCanvas(userId, function (result) {
        const responseObject = result;
        if (responseObject.error === null) {
            res.status(200).send(responseObject.response);
        } else if (responseObject.error === errorUtils.NO_CANVAS_FOUND) {
            res.status(200).send([]);
        }
    });
});
router.post('/', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        canvasService.createCanvas(userId, req.body, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(201).send(result);
            }
        });
    }
});
router.get('/:canvasId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
    const params = req.params
    const canvasId = params.canvasId;
    if (canvasId === null || canvasId === undefined) {
        res.status(422).send({"error": "Canvas Id is required!"})
    }
    canvasService.getCanvasById(userId, canvasId, function (result) {
        if (result === null) {
            res.status(500).send("Internal Server Error");
        } else if (result.error != null) {
            res.status(422).send(result);
        } else {
            res.status(200).send(result);
        }
    });
});
router.put('/:canvasId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
    const params = req.params
    const canvasId = params.canvasId;
    if (canvasId === null || canvasId === undefined) {
        res.status(422).send({"error": "Canvas Id is required!"})
    }
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        canvasService.updateCanvas(userId, canvasId, req.body.data, req.body.name, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(200).send(result);
            }
        });
    }
});
router.delete('/:canvasId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
    const params = req.params
    const canvasId = params.canvasId;
    if (canvasId === null || canvasId === undefined) {
        res.status(422).send({"error": "Canvas Id is required!"})
    }
    canvasService.deleteCanvas(userId, canvasId, function (result) {
        if (result === null) {
            res.status(500).send("Internal Server Error");
        } else if (result.error != null) {
            res.status(422).send(result);
        } else {
            res.status(204).send();
        }
    });
});
module.exports = router;

