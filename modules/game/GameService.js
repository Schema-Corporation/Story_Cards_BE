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
        }
        if (reply === undefined || reply === null || reply.length < 1) {
            response([]);
        }
        console.log(reply);
        let parsedReply = new Array(0);
        reply.forEach(rawReply => parsedReply.push(JSON.parse(rawReply)));
        return response(parsedReply);
    });
}
