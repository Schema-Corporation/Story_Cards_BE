const gameRepository = require('../repository/GameRepository')
const redis = require('../config/RedisConfig')
const securityUtils = require('../utils/SecurityUtil');

module.exports = {
    createGame: function (userId, gameObject, response) {
        gameRepository.createGame(userId, gameObject, response);
    }

}
