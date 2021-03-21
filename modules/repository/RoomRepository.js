require('dotenv').config();
const databaseConfig = require('../config/DatabaseConfig');
const uuid = require('uuid');
const LocalDate = require("@js-joda/core");


module.exports = {
    getRoomsByUserId: function (userId, callback) {
        databaseConfig.getSession().query('SELECT id,user_id,room_name,max_guests,room_code,room_name,enabled FROM room r WHERE r.user_id = ? ORDER BY created_date desc', userId, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            let parsedResult = [];
            result.forEach(rawResult => parsedResult.push({
                id: rawResult.id,
                userId: rawResult.user_id,
                name: rawResult.name,
                maxGuests: rawResult.max_guests,
                roomCode: rawResult.room_code,
                roomName: rawResult.room_name,
                enabled: rawResult.enabled
            }))
            return callback(parsedResult);
        });
        databaseConfig.closeConnection();
    },
    validateNumberOfParticipantsInGame: function (roomId, callback) {
        databaseConfig.getSession().query("SELECT COUNT(*) as 'active_guests' from guest where room_id = ? and status = 2", roomId, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            let rawResult = result[0];
            if (rawResult === undefined) {
                return callback(rawResult);
            }
            return callback({
                active_guests: rawResult.active_guests,
            })
        });
        databaseConfig.closeConnection();
    },
    getRoomByRoomId: function (roomId, callback) {
        databaseConfig.getSession().query('SELECT id,user_id,room_name,max_guests,room_code,enabled FROM room r WHERE r.id = ? ORDER BY created_date desc', roomId, (err, result) => {
            parseSingleResult(err, result, callback);
        });
        databaseConfig.closeConnection();
    },
    getRoomByName: function (roomName, userId, callback) {
        databaseConfig.getSession().query('SELECT id,user_id,room_name,max_guests,room_code,enabled FROM room r WHERE r.room_name = ? and r.user_id = ? ORDER BY created_date desc', [roomName, userId], (err, result) => {
            parseSingleResult(err, result, callback);
        });
        databaseConfig.closeConnection();
    },
    getRoomByCode: function (roomCode, callback) {
        databaseConfig.getSession().query('SELECT id,user_id,room_name,max_guests,room_code,enabled FROM room r WHERE r.room_code = ? and enabled = true ORDER BY created_date desc', roomCode, (err, result) => {
            parseSingleResult(err, result, callback);
        });
        databaseConfig.closeConnection();
    },
    getRoomByCodeForCreation: function (roomCode, callback) {
        databaseConfig.getSession().query('SELECT id,user_id,room_name,max_guests,room_code,enabled FROM room r WHERE r.room_code = ? ORDER BY created_date desc', roomCode, (err, result) => {
            parseSingleResult(err, result, callback);
        });
        databaseConfig.closeConnection();
    },
    createRoomForUser: function (roomData, userId, roomCode, callback) {
        let objectToInsert = {
            "id": uuid.v4(),
            "user_id": userId,
            "max_guests": process.env.MAX_GUESTS,
            "room_code": roomCode,
            "created_date": LocalDate.LocalDate.now().toString(),
            "enabled": true,
            "room_name": roomData.roomName
        }
        databaseConfig.getSession().query('INSERT INTO room SET ?', objectToInsert, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            return this.getRoomByRoomId(objectToInsert.id, callback);
        });
        databaseConfig.closeConnection();
    },
    updateRoom: function (roomId, enabled, callback) {
        databaseConfig.getSession().query('UPDATE room r SET r.enabled = ? WHERE r.id = ?', [enabled, roomId], (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            return callback(result);
        });
        databaseConfig.closeConnection();
    },
    deleteRoomForUser: function (roomId, callback) {
        databaseConfig.getSession().query('DELETE FROM room r where r.id = ?', roomId, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            return callback(result);
        });
        databaseConfig.closeConnection();
    }
}

function parseSingleResult(err, result, callback) {
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
        userId: rawResult.user_id,
        roomName: rawResult.name,
        maxGuests: rawResult.max_guests,
        roomCode: rawResult.room_code,
        enabled: rawResult.enabled
    })
}
