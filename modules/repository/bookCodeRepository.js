const databaseConfig = require('../config/database');

module.exports = {
    getBookCodeByCode: function (userCode, enabled) {
        let table = databaseConfig.getSession().then(sessionResult => {
            return sessionResult.getTable('book_code');
        });
        return table.then(table => {
            return table.select(['id', 'book_code', 'status', 'enabled'])
                .where('book_code = :bookCode and enabled = :enabled')
                .bind('bookCode', userCode)
                .bind('enabled', enabled)
                .execute().then(result => {
                    let rawResult = result.fetchOne();
                    console.log(rawResult);
                    return {id: rawResult[0], bookCode: rawResult[1], status: rawResult[2], enabled: rawResult[3]}
                }).catch(() => {
                    return null
                }).then(databaseCode => {
                    return databaseCode;
                }).catch(() => {
                    return null
                })
        })
    },
    getBookCodeById: function (bookCodeId, status, enabled) {
        return databaseConfig.getSession().then(sessionResult => {
            let table = sessionResult.getTable('book_code');
            return table.select(['id', 'book_code', 'status', 'enabled'])
                .where('id = :bookCodeId and enabled = :enabled and status = :status')
                .bind('bookCodeId', bookCodeId)
                .bind('status', status)
                .bind('enabled', enabled)
                .execute().then(result => {
                    let rawResult = result.fetchOne();
                    if (rawResult != null)
                        return {id: rawResult[0], bookCode: rawResult[1], status: rawResult[2], enabled: rawResult[3]}
                    return null
                }).catch(() => {
                    return null
                })
        });

    },
    updateBookCodeById: function (bookId, status) {
        return databaseConfig.getSession().then(sessionResult => {
            let table = sessionResult.getTable('book_code');
            return table.update()
                .set('status', status)
                .where("id = :bookId")
                .bind("bookId", bookId)
                .execute().then(() => {
                    return this.getBookCodeById(bookId).then(result => {
                        console.log(result);
                        return result;
                    })
                }).catch(error => {
                    console.log("Could not execute update operation for book code in database: " + error);
                    return null;
                })
        });

    }
}
