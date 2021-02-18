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
    getRoomGuests: function (roomId, response) {
        const guestList = getRedisListIfExists(roomId);
        if (guestList === undefined) {
            guestRepository.getRoomGuests(roomId, response);
        } else {
            response(guestList);
        }
    },
    updateGuest: function(guestId, status, response) {
        guestRepository.updateGuest(guestId, status, function (result) {
            // update guest in list of guests in redis
            return response(result);
        }); 
    }
}

function getRedisListIfExists(key) {
    redis.getRedisClient().lrange(key, 0, -1, function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        return reply;
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
