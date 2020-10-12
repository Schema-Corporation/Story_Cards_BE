const databaseConfig = require('../config/database');
module.exports = {
    getBookCodeByCode: function (userCode) {
        let table = databaseConfig.getSession().then(sessionResult => {
            return sessionResult.getTable('book_code');
        });
        return table.then(table => {
            return table.select(['id', 'book_code', 'status', 'enabled'])
                .where('book_code = :bookCode')
                .bind('bookCode', userCode)
                .execute().then(result => {
                    let rawResult = result.fetchOne();
                    return {id: rawResult[0], bookCode: rawResult[1], status: rawResult[2], enabled: rawResult[3]}
                }).catch(() => {
                    return null;
                }).then(databaseCode => {
                    return databaseCode;
                })
        })
    }
}
