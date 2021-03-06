const databaseConfig = require('../config/DatabaseConfig');
const uuid = require('uuid');
const LocalDate = require("@js-joda/core");

module.exports = {
    createGame: function (userId, gameData, callback) {
        const gameId = uuid.v4();
        let objectToInsert = {
            "id": gameId,
            "room_id": gameData.roomId,
            "turn": 0,
        }
        databaseConfig.getSession().query('INSERT INTO game SET ?', objectToInsert, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            return this.getGameById(gameId, callback);
        });
        databaseConfig.closeConnection();
    },
    getGameById(gameId, callback) {
        databaseConfig.getSession().query('SELECT id,room_id,turn FROM game g where g.id = ?', gameId, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            let rawResult = result[0];
            if (rawResult === undefined) {
                return callback(rawResult);
            }
            return callback({
                id: rawResult.id,
                roomId: rawResult.room_id,
                turn: rawResult.turn
            })
        });
        databaseConfig.closeConnection();
    },
    deleteGameByRoomId(roomId, callback) {
        databaseConfig.getSession().query('DELETE FROM game g where g.room_id = ?', roomId, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            return callback(result);
        });
        databaseConfig.closeConnection();
    }
}