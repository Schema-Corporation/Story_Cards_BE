const redis = require('../config/RedisConfig');
const securityUtil = require('./SecurityUtil');


module.exports = {
    insertDataIntoRedisList: function (list, callback) {
        redis.getRedisClient().rpush(list, function (err, reply) {
            if (err) {
                console.log(err);
            } else {
                console.log(reply);
                callback(reply);
            }
        })
    },
    getRedisList: function (key, response) {
        redis.getRedisClient().lrange(key, 0, -1, function (err, reply) {
            if (err) {
                console.log(err);
                response([]);
            } else if (reply === undefined || reply === null || reply.length < 1) {
                response([]);
            } else {
                console.log(reply);
                let parsedReply = new Array(0);
                reply.forEach(rawReply => parsedReply.push(JSON.parse(rawReply)));
                response(parsedReply);
            }
        });
    },
    getPositionFromRedisList: function (key, elementToFind, callback) {
        redis.getRedisClient().lrange(key, 0, -1, function (err, reply) {
            if (err) {
                console.log(err);
                callback([]);
            } else if (reply === undefined || reply === null || reply.length < 1) {
                callback([]);
            } else {
                var elementPosition = -1;
                let parsedReply = new Array(0);
                reply.forEach(rawReply => parsedReply.push(JSON.parse(rawReply)));
                parsedReply.forEach((rawParsedReply, index) => {
                    let elementToFindAsObject = JSON.parse(elementToFind);
                    if (securityUtil.objectsAreEqual(rawParsedReply, elementToFindAsObject)) {
                        elementPosition = index;
                    }
                });
                if (elementPosition === undefined || elementPosition === null || elementPosition < 0) {
                    console.log(elementPosition);
                    callback(null);
                } else {
                    console.log(elementPosition);
                    callback(elementPosition);
                }
            }
        });

    },
    getItemFromRedisListInSpecifiedIndex: function (key, index, callback) {
        redis.getRedisClient().lindex(key, index, function (err, foundItem) {
            if (err) {
                console.log(err);
                callback(undefined);
            } else if (foundItem === undefined || foundItem === null) {
                console.log(foundItem);
                callback(null);
            } else {
                console.log(foundItem);
                return callback(JSON.parse(foundItem));
            }
        });
    },
    editItemInRedisList: function (key, elementIndex, element, callback) {
        redis.getRedisClient().lset(key, elementIndex, element, function (err, resultMessage) {
            if (err) {
                console.log(err);
                callback(undefined);
            } else if (resultMessage !== "OK") {
                console.log(resultMessage);
                callback(null);
            } else {
                module.exports.getItemFromRedisListInSpecifiedIndex(key, elementIndex, callback);
            }
        });
    },
    removeItemFromRedisList: function (key, elementToRemove, callback) {
        redis.getRedisClient().lrem(key, 0, elementToRemove, function (err, resultMessage) {
            if (err) {
                console.log(err);
                return callback(undefined);
            } else if (resultMessage === 0) {
                return callback(null);
            } else {
                return callback(resultMessage);
            }
        });
    }
}
