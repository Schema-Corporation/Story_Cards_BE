const canvasRepository = require('../repository/canvasRepository.js')
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
    createCanvas: function (userId, canvasObject, response) {
        canvasRepository.createCanvasForUser(canvasObject, userId, response);
    }
}
