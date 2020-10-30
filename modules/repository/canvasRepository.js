const databaseConfig = require('../config/database');
const uuid = require('uuid');
const LocalDate = require("@js-joda/core");

module.exports = {
    getCanvasByUserId: function (userId, callback) {
        databaseConfig.getSession().query('SELECT id,user_id,name,data,type FROM canvas c where c.user_id = ?', userId, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            let parsedResult = [];
            result.forEach(rawResult => parsedResult.push({
                id: rawResult.id,
                userId: rawResult.user_id,
                name: rawResult.name,
                type: rawResult.type
            }))
            return callback(parsedResult);
        });
        databaseConfig.closeConnection();
    },
    getCanvasByCanvasId: function (canvasId, callback) {
        databaseConfig.getSession().query('SELECT id,user_id,name,data,type FROM canvas c where c.id = ?', canvasId, (err, result) => {
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
                name: rawResult.name,
                data: rawResult.data,
                type: rawResult.type
            })
        });
        databaseConfig.closeConnection();
    },
    createCanvasForUser: function (canvasData, userId, callback) {
        let objectToInsert = {
            "id": uuid.v4(),
            "user_id": userId,
            "data": canvasData.data,
            "name": canvasData.name,
            "type": canvasData.type,
            "created_date": LocalDate.LocalDate.now().toString(),
            "updated_date": LocalDate.LocalDate.now().toString()
        }
        databaseConfig.getSession().query('INSERT INTO canvas SET ?', objectToInsert, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            return this.getCanvasByUserId(userId, callback);
        });
        databaseConfig.closeConnection();
    },
    deleteCanvasForUser: function (canvasId, callback) {
        databaseConfig.getSession().query('DELETE FROM canvas where id = ?', canvasId, (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            return callback(result);
        });
    }
}
