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
            "status": challengeRequest.status,
            "points": challengeRequest.points
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
    },
    deleteChallenge: function (gameId, guestId, response) {
        redisOperations.getRedisList(gameId, function (searchResult) {
            console.log(searchResult);
            if (searchResult.length === 0) {
                console.log("Could not find redis list with given key or list is empty");
                return response(undefined);
            } else {
                let flag = false;
                searchResult.forEach(function (challenge, index, array) {
                    if (challenge.guestId === guestId) {
                        redisOperations.removeItemFromRedisList(gameId, JSON.stringify(challenge), function (deleteResult) {
                            console.log("Deleted guest from redis list in index: " + deleteResult);
                            flag = true;
                            return response(deleteResult);
                        });
                    }
                    if (array.length - 1 === index && !flag) {
                        console.log("Could not find any challenge with given Id!");
                        return response(null);
                    }
                })
            }
        });
    }
}
