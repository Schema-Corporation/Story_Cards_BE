const guestRepository = require('../repository/GuestRepository')
const redis = require('../config/RedisConfig')
const securityUtils = require('../utils/SecurityUtil');

module.exports = {
    addGuestToRoom: function (request, response) {
        guestRepository.createGuest(request, function (result) {
            let auxList = [];
            auxList.push(request.roomId);
            auxList.push(JSON.stringify(result));
            insertRedisList(auxList);
            return response({
                "token": securityUtils.generateAccessToken({
                    "roomId": result.roomId,
                    "guestId": result.id
                }),
                "guestData": result
            });
        });
    },
    removeGuest: function (roomId, guestId, response) {
        guestRepository.removeGuest(guestId, function (result) {
            getRedisListIfExists(roomId, function (result) {
                result.forEach(guest => {
                    if (guest.id === guestId) {
                        removeItemFromRedisList(roomId, JSON.stringify(guest));
                    }
                })
            })
            return response(result);
        });
    },
    getRoomGuests: function (roomId, response) {
        getRedisListIfExists(roomId, response);
    },
    updateGuest: function (guestId, status, response) {
        guestRepository.updateGuest(guestId, status, function (result) {
            // update guest in list of guests in redis
            return response(result);
        });
    }
}

function getRedisListIfExists(key, response) {
    redis.getRedisClient().lrange(key, 0, -1, function (err, reply) {
        if (err) {
            guestRepository.getRoomGuests(key, response);
            console.log(err);
        }
        if (reply === undefined || reply === null || reply.length < 1) {
            guestRepository.getRoomGuests(key, response);
        }
        console.log(reply);
        let parsedReply = new Array(0);
        reply.forEach(rawReply => parsedReply.push(JSON.parse(rawReply)));
        return response(parsedReply);
    });
}

function removeItemFromRedisList(key, elementToRemove) {
    redis.getRedisClient().lrem(key, 0, elementToRemove, function (err, data) {
        console.log(data);
    });
}

function insertRedisList(list) {
    redis.getRedisClient().rpush(list, function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
    })
}
