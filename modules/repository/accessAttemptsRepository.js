const databaseConfig = require('../config/database');
const uuid = require('uuid');
const LocalDate = require("@js-joda/core").LocalDate;

module.exports = {
    getAccessAttemptsByIdentifier: function (identifier) {
        return databaseConfig.getSession().then(sessionResult => {
            let table = sessionResult.getTable('access_attempts');
            return table.select(['id', 'identifier', 'attempts', 'end_date'])
                .where('identifier = :identifier')
                .bind('identifier', identifier)
                .execute().then(result => {
                    let rawResult = result.fetchOne();
                    if (rawResult != null)
                        return {
                            id: rawResult[0],
                            identifier: rawResult[1],
                            attempts: rawResult[2],
                            endDate: Date.parse(rawResult[3]) / 1000
                        }
                    return null;
                }).catch(() => {
                    return null
                })
        })
    },
    registerAccessAttemptByIdentifier: function (identifier, endDate) {
        return databaseConfig.getSession().then(sessionResult => {
            let table = sessionResult.getTable('access_attempts');
            return table.insert(['id', 'identifier', 'attempts', 'end_date', 'enable', 'created_date'])
                .values(uuid.v4(), identifier, 1, endDate, true, LocalDate.now().toString())
                .execute().then(value => {
                    return value;
                }).catch(error => {
                    console.log("Could not create access attempt registry because:" + error);
                    return null;
                })
        });
    },
    updateAccessAttemptByIdentifier: function (identifier, attempts, endDate) {
        return databaseConfig.getSession().then(sessionResult => {
            let table = sessionResult.getTable('access_attempts');
            return table.update()
                .set('attempts', attempts)
                .set('end_date', endDate)
                .where("identifier = :identifier")
                .bind("identifier", identifier)
                .execute().then(() => {
                    return this.getAccessAttemptsByIdentifier(identifier).then(result => {
                        return result;
                    })
                }).catch(() => {
                    return null;
                })
        });
    }
}
