const redis = require('../config/RedisConfig');

module.exports = {
    pingRedisServer: function (callback) {
        redis.getRedisClient().ping(function (err, reply) {
            if (err) {
                console.log(err);
                return callback("DOWN");
            } else if (reply === "PONG") {
                return callback("UP");
            } else {
                return callback("DOWN");
            }
        })
    }
}
