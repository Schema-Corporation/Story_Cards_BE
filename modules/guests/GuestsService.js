const guestRepository = require('../repository/GuestRepository')
const redis = require('../config/RedisConfig')
const securityUtils = require('../utils/SecurityUtil');
const redisOperations = require('../utils/RedisUtil');
module.exports = {
    addGuestToRoom: function (request, response) {
        guestRepository.createGuest(request, function (result) {
            let auxList = [];
            auxList.push(request.roomId);
            auxList.push(JSON.stringify(result));
            redisOperations.insertDataIntoRedisList(auxList, function (redisResult) {
                console.log(redisResult);
                return response({
                    "token": securityUtils.generateAccessToken({
                        "roomId": result.roomId,
                        "guestId": result.id
                    }),
                    "guestData": result
                });
            });
        });
    },
    removeGuest: function (roomId, guestId, response) {
        guestRepository.removeGuest(guestId, function (result) {
            redisOperations.getRedisList(roomId, function (searchResult) {
                if (searchResult === []) {
                    console.log("Could not find redis list with given key or list is empty");
                    return;
                }
                searchResult.forEach(guest => {
                    if (guest.id === guestId) {
                        redisOperations.removeItemFromRedisList(roomId, JSON.stringify(guest), function (deleteResult) {
                            console.log("Deleted guest from redis list in index" + deleteResult);
                            return response(result);
                        });
                    }
                })
            });
        });
    },
    getRoomGuests: function (roomId, response) {
        redisOperations.getRedisList(roomId, function (searchResult) {
            if (searchResult.length === 0) {
                console.log("Could not find any result on redis and therefore the list is obtained from db");
                guestRepository.getRoomGuests(roomId, function (dbResult) {
                    dbResult.forEach(guest => {
                        let auxList = [];
                        auxList.push(roomId);
                        auxList.push(JSON.stringify(guest));
                        redisOperations.insertDataIntoRedisList(auxList, function (insertRedisResult) {
                            console.log("Redis Insert operation ended with result:", insertRedisResult);
                            return response(dbResult);
                        });
                    })
                });
            } else {
                return response(searchResult);
            }
        });
    },
    updateGuest: function (roomId, guestId, status, response) {
        guestRepository.updateGuest(guestId, status, function (result) {
            redisOperations.getRedisList(roomId, function (searchResult) {
                searchResult.forEach(guest => {
                    console.log(guest);
                    if (guest.id === guestId) {
                        redisOperations.getPositionFromRedisList(roomId, JSON.stringify(guest), function (findResult) {
                            guest.status = status;
                            redisOperations.editItemInRedisList(roomId, findResult, JSON.stringify(guest), response);
                        });
                    }
                })
            })
        });
    }
}
