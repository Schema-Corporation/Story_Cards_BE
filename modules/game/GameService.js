const gameRepository = require('../repository/GameRepository')
const redisOperations = require('../utils/RedisUtil');
const uuid = require('uuid');

module.exports = {
    createGame: function (userId, gameObject, response) {
        gameRepository.createGame(userId, gameObject, response);
    },
    addChallengeToGame: function (challengeRequest, response) {
        let auxList = [];
        auxList.push(challengeRequest.gameId);
        auxList.push(JSON.stringify({
            "challengeId": challengeRequest.challengeId,
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
    editChallengeStatus: function (gameId, challengeId, status, points, callback) {
        redisOperations.getRedisList(gameId, function (result) {
            result.forEach(challenge => {
                console.log(challenge);
                if (challenge.challengeId === challengeId) {
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
            console.log("Got the following result from find operation for list with key : " + gameId + " result: ");
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
                    } else if (array.length - 1 === index && !flag) {
                        console.log("Could not find any challenge with given Id!");
                        return response(null);
                    } else if (array.length - 1 === index && flag) {
                        console.log("Found challenge but somehow event was not closed so end of the way is being implemented!");
                    }
                });
            }
        });
    },
    addAnswerToChallenge: function (challengeId, requestBody, callback) {
        let auxList = [];
        auxList.push(challengeId);
        auxList.push(JSON.stringify({
            "answerId": requestBody.answerId,
            "challengeId": challengeId,
            "guestId": requestBody.guestId,
            "answerText": requestBody.answerText,
            "competency": requestBody.competency,
            "fullName": requestBody.fullName,
            "scoreObtained": requestBody.scoreObtained,
            "challengeDifficulty": requestBody.challengeDifficulty,
            "extraPoints": requestBody.extraPoints,
            "evaluated": false
        }));
        redisOperations.insertDataIntoRedisList(auxList, callback);
    },
    getAnswersForChallenge: function (gameId, callback) {
        let resultList = Array(0);
        module.exports.getChallengesFromWaitingRoom(gameId, function (searchResult) {
            if (searchResult.length === 0) {
                return callback([]);
            } else {
                searchResult.forEach(function (challenge, index, array) {
                    redisOperations.getRedisList(challenge.challengeId, function (challengeAnswers) {
                        if (challengeAnswers.length !== 0) {
                            resultList.push.apply(resultList, challengeAnswers);
                        }
                        if (index === array.length - 1) {
                            return callback(resultList);
                        }
                    });
                });
            }
        });
    },
    editAnswer: function (challengeId, answerId, extraPoints, evaluated, callback) {
        redisOperations.getRedisList(challengeId, function (searchResult) {
            searchResult.forEach(answer => {
                if (answer.answerId === answerId) {
                    redisOperations.getPositionFromRedisList(challengeId, JSON.stringify(answer), function (findResult) {
                        answer.extraPoints = extraPoints;
                        answer.evaluated = evaluated;
                        redisOperations.editItemInRedisList(challengeId, findResult, JSON.stringify(answer), callback);
                    });
                }
            })
        })
    },
    calculateScores: function (gameId, callback) {
        redisOperations.getRedisList(gameId, function (resultSearch) {

        });
    }
}
