const canvasRepository = require('../repository/CanvasRepository.js')
const errorUtils = require('../utils/ErrorConstants')
module.exports = {
    getCanvas: function (userId, response) {
        canvasRepository.getCanvasByUserId(userId, function (searchResult) {
                if (searchResult.length === 0) {
                    console.log("Could not find any canvas by userId");
                    return response({
                        "response": null,
                        "error": errorUtils.NO_CANVAS_FOUND
                    });
                } else {
                    return response({"response": searchResult, "error": null});
                }
            }
        );
    },
    getCanvasById: function (userId, canvasId, response) {
        canvasRepository.getCanvasByCanvasId(canvasId, function (result) {
            if (result === undefined) {
                return response({"error": errorUtils.NO_CANVAS_FOUND})
            } else if (result.userId !== userId) {
                return response({"error": errorUtils.CANVAS_DOES_NOT_BELONG})
            } else {
                return response(result);
            }
        })
    },
    createCanvas: function (userId, canvasObject, response) {
        canvasRepository.createCanvasForUser(canvasObject, userId, response);
    },
    updateCanvas: function (userId, canvasId, data, name, response) {
        canvasRepository.getCanvasByCanvasId(canvasId, function (result) {
            if (result === undefined) {
                return response({"error": errorUtils.NO_CANVAS_FOUND})
            } else if (result.userId !== userId) {
                return response({"error": errorUtils.CANVAS_DOES_NOT_BELONG})
            } else {
                canvasRepository.updateCanvasForUser(canvasId, data, name, response);
            }
        });
    },
    deleteCanvas: function (userId, canvasId, response) {
        canvasRepository.getCanvasByCanvasId(canvasId, function (result) {
            if (result === undefined) {
                return response({"error": errorUtils.NO_CANVAS_FOUND})
            } else if (result.userId !== userId) {
                return response({"error": errorUtils.CANVAS_DOES_NOT_BELONG})
            } else {
                canvasRepository.deleteCanvasForUser(canvasId, response);
            }
        });
    }
}

