const databaseConfig = require('../config/database');
const uuid = require('uuid');
const LocalDate = require("@js-joda/core").LocalDate;

module.exports = {
    getAccessAttemptsByIdentifier: function (identifier, callback) {
        databaseConfig.getSession().query('SELECT id,identifier,attempts,end_date FROM access_attempts where identifier = ?', identifier, (err, rows) => {
            if (err) return callback(err);
            let rawResult = rows[0];
            if (rawResult === undefined) {
                return callback(null);
            } else {
                return callback({
                    id: rawResult.id,
                    identifier: rawResult.identifier,
                    attempts: rawResult.attempts,
                    endDate: Date.parse(rawResult.end_date) / 1000
                })
            }
        })
    },
    registerAccessAttemptByIdentifier: function (identifier, endDate, callback) {
        let accessAttempt = {
            id: uuid.v4(),
            identifier: identifier,
            attempts: 1,
            end_date: endDate,
            enable: true,
            created_date: LocalDate.now().toString()
        }
        databaseConfig.getSession().query('INSERT INTO access_attempts SET ?', accessAttempt, (err, res) => {
            if (err) return callback(err);

            return this.getAccessAttemptsByIdentifier(identifier, callback);
        })
    },
    updateAccessAttemptByIdentifier: function (identifier, attempts, endDate, callback) {
        databaseConfig.getSession().query('UPDATE access_attempts SET attempts = ?,end_date = ? WHERE identifier = ?', [attempts, endDate, identifier], (err, result) => {
            if (err) return callback(err);

            return callback(result.changedRows[0])
        })
    }
}
