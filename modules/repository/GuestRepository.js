const databaseConfig = require('../config/DatabaseConfig');
const uuid = require('uuid');

module.exports = {
    findGuestById: function (guestId, callback) {
        databaseConfig.getSession().query('SELECT id,identifier,room_id,status,enabled FROM guest WHERE id = ?', guestId, (err, rows) => {
            if (err) return callback(err);
            let rawResult = rows[0];
            if (rawResult === undefined) {
                return callback(null);
            } else {
                return callback({
                    id: rawResult.id,
                    identifier: rawResult.identifier,
                    roomId: rawResult.room_id,
                    status: rawResult.status,
                    enabled: rawResult.enabled,
                });
            }
        });
        databaseConfig.closeConnection();
    },
    createGuest: function (guestData, callback) {
        let insertObject = {
            id: uuid.v4(),
            identifier: guestData.identifier,
            room_id: guestData.roomId,
            status: 1,
            enabled: true,
        }
        databaseConfig.getSession().query('INSERT INTO guest SET ?', insertObject, (err, result) => {
            if (err) return callback(err);

            return this.findGuestById(insertObject.id, callback);
        });
        databaseConfig.closeConnection();
    },
    getRoomGuests: function (roomId, callback) {
        databaseConfig.getSession().query('SELECT id,identifier,room_id,status,enabled FROM guest WHERE room_id = ?', roomId, (err, rows) => {
            if (err) return callback(err);
            let rawResult = rows;
            if (rawResult === undefined) {
                return callback(null);
            } else {
                let parsedResult = new Array(0);
                for (const result of rawResult) {
                    parsedResult.push({
                        id: result.id,
                        identifier: result.identifier,
                        roomId: result.room_id,
                        status: result.status,
                        enabled: result.enabled,
                    });
                }
                return callback(parsedResult);
            }
        });
        databaseConfig.closeConnection();
    }
}
