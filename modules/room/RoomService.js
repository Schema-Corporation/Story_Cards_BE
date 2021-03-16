const roomRepository = require('../repository/RoomRepository.js');
const gameRepository = require('../repository/GameRepository.js');
const guestRepository = require('../repository/GuestRepository');
const errorUtils = require('../utils/ErrorConstants');
module.exports = {
    getRooms: function (userId, response) {
        roomRepository.getRoomsByUserId(userId, function (searchResult) {
                if (searchResult.length === 0) {
                    console.log("Could not find any rooms by userId");
                    return response({
                        "response": null,
                        "error": errorUtils.NO_ROOM_FOUND
                    });
                } else {
                    return response({"response": searchResult, "error": null});
                }
            }
        );
    },
    getRoomById: function (userId, roomId, response) {
        roomRepository.getRoomByRoomId(roomId, function (result) {
                if (result === undefined) {
                    return response({"error": errorUtils.NO_ROOM_FOUND})
                } else if (result.userId !== userId) {
                    return response({"error": errorUtils.ROOM_DOES_NOT_BELONG})
                } else {
                    return response(result);
                }
            }
        );
    },
    createRoom: function (userId, roomObject, response) {
        createRoomLoop(roomObject, userId, response);
    },
    updateRoom: function (userId, roomId, enabled, response) {
        roomRepository.getRoomByRoomId(roomId, function (result) {
            if (result === undefined) {
                return response({"error": errorUtils.NO_ROOM_FOUND})
            } else if (result.userId !== userId) {
                return response({"error": errorUtils.ROOM_DOES_NOT_BELONG})
            } else {
                roomRepository.updateRoom(roomId, enabled, response);
            }
        });
    },
    deleteRoom: function (userId, roomId, response) {
        roomRepository.getRoomByRoomId(roomId, function (result) {
            if (result === undefined) {
                return response({"error": errorUtils.NO_ROOM_FOUND})
            } else if (result.userId !== userId) {
                return response({"error": errorUtils.ROOM_DOES_NOT_BELONG})
            } else {
                gameRepository.deleteGameByRoomId(roomId, function (games) {
                    guestRepository.removeGuestsFromRoom(roomId, function (guests) {
                        roomRepository.deleteRoomForUser(roomId, response);
                    });
                });
            }
        });
    },
    validateRoomCode: function (roomCode, response) {
        roomRepository.getRoomByCode(roomCode, function (roomData) {
            if (roomData === undefined) {
                return response({"error": errorUtils.NO_ROOM_FOUND})
            } else {
                return response(
                    {
                        "roomId": roomData.id
                    });
            }
        });
    }
}

function generateRandomCode() {
    let str = "";
    let counter = 0;
    while (counter < 6) {
        let randomNum = Math.random() * 127;
        if ((randomNum >= 48 && randomNum <= 57) || (randomNum >= 65 && randomNum <= 90) || (randomNum >= 97 && randomNum <= 122)) {
            str += String.fromCharCode(Math.round(randomNum));
            counter++;
        }
    }
    return str;
}

function createRoomLoop(roomObject, userId, callback) {
    let code = generateRandomCode();
    roomRepository.getRoomByCodeForCreation(code, function (result) {
        if (result === null || result === undefined) {
            roomRepository.createRoomForUser(roomObject, userId, code, function (createResult) {
                return callback(createResult);
            });
        } else {
            createRoomLoop(roomObject, userId, callback);
        }
    });
}

