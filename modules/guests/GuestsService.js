const guestRepository = require('../repository/GuestRepository')
const redis = require('../config/RedisConfig')

module.exports = {
    addGuestToRoom: function (request, response) {
        guestRepository.createGuest(request, function (result) {
            let auxList = [];
            auxList.push(request.roomId);
            auxList.push(JSON.stringify(result));
            insertRedisList(auxList);
            return response(result);
        });
    },
    getRoomGuests: function (roomId, response) {
        const guestList = getRedisListIfExists(roomId);
        if (guestList === undefined) {
            guestRepository.getRoomGuests(roomId, response);
        } else {
            response(guestList);
        }
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
