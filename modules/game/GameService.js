const gameRepository = require('../repository/GameRepository')
const securityUtils = require('../utils/SecurityUtil');

module.exports = {
    createGame: function (userId, gameObject, response) {
        gameRepository.createGame(userId, gameObject, response);
    }
}