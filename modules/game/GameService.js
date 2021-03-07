const gameRepository = require('../repository/GameRepository')
const redisOperations = require('../utils/RedisUtil');
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
            "status": 0,
            "points": 0
        }));
        redisOperations.insertDataIntoRedisList(auxList, response);
    },
    getChallengesFromWaitingRoom: function (gameId, callback) {
        redisOperations.getRedisList(gameId, callback);
    },
    editChallengeStatus: function (gameId, guestId, status, points, callback) {
        redisOperations.getRedisList(gameId, function (result) {
            result.forEach(challenge => {
                console.log(challenge);
                if (challenge.guestId === guestId) {
                    redisOperations.getPositionFromRedisList(gameId, JSON.stringify(challenge), function (findResult) {
                        challenge.status = status;
                        challenge.points = points;
                        redisOperations.editItemInRedisList(gameId, findResult, JSON.stringify(challenge), callback);
                    });
                }
            })
        })
    }
}
