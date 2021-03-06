const gameRepository = require('../repository/GameRepository')
const redis = require('../config/RedisConfig')
const securityUtils = require('../utils/SecurityUtil');

module.exports = {
    createGame: function (userId, gameObject, response) {
        gameRepository.createGame(userId, gameObject, response);
    },
    addChallengeToGame: function (challengeRequest, response) {
        let auxList = [];
        auxList.push(challengeRequest.gameId);
        auxList.push(JSON.stringify({
            "guestId": challengeRequest.guestId,
            "fullName": challengeRequest.fullName,
            "challengeBody": challengeRequest.challengeBody,
            "status": 0
        }));
        insertDataIntoRedisList(auxList, response);
    },
    getChallengesFromWaitingRoom: function (gameId, callback) {
        getRedisList(gameId, callback);
    },
    editChallengeStatus: function (gameId, guestId, status, callback) {
        getRedisList(gameId, function (result) {
            result.forEach(challenge => {
                console.log(challenge);
                if (challenge.guestId === guestId) {
                    getPositionFromRedisList(gameId, JSON.stringify(challenge), function (findResult) {
                        challenge.status = status;
                        editItemInRedisList(gameId, findResult, JSON.stringify(challenge), callback);
                    });
                }
            })
        })
    }
}

function insertDataIntoRedisList(list, callback) {
    redis.getRedisClient().rpush(list, function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        callback(reply);
    })
}

function getRedisList(key, response) {
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
}

function getPositionFromRedisList(key, elementToFind, callback) {
    redis.getRedisClient().lpos(key, elementToFind, function (err, elementPosition) {
        if (err) {
            console.log(err);
            callback(undefined);
        } else if (elementPosition === undefined || elementPosition === null || elementPosition < 0) {
            console.log(elementPosition);
            callback(null);
        } else {
            console.log(elementPosition);
            callback(elementPosition);
        }
    });
}

function getItemFromRedisListInSpecifiedIndex(key, index, callback) {
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
}

function editItemInRedisList(key, elementIndex, element, callback) {
    redis.getRedisClient().lset(key, elementIndex, element, function (err, resultMessage) {
        if (err) {
            console.log(err);
            callback(undefined);
        } else if (resultMessage !== "OK") {
            console.log(resultMessage);
            callback(null);
        } else {
            getItemFromRedisListInSpecifiedIndex(key, elementIndex, callback);
        }
    });
}
