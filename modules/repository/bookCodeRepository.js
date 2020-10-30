const databaseConfig = require('../config/database');
module.exports = {
    getBookCodeByCode: function (userCode, enabled, callback) {
        databaseConfig.getSession().query('SELECT id,book_code,status,enabled FROM book_code bc WHERE bc.book_code = ? and enabled = ?', [userCode, enabled], (err, result) => {
            if (err) {
                console.log(err);
                return callback(null);
            }
            let rawResult = result[0];
            if (rawResult === undefined) {
                return callback(rawResult);
            } else {
                return callback({
                    id: rawResult.id,
                    bookCode: rawResult.book_code,
                    status: rawResult.status,
                    enabled: rawResult.enabled
                });
            }
        });
        databaseConfig.closeConnection();
    },
    getBookCodeById: function (bookCodeId, status, enabled, callback) {
        databaseConfig.getSession().query('SELECT id,book_code,status,enabled FROM book_code WHERE id = ? and enabled = ? and status = ?', [bookCodeId, enabled, status], (err, result) => {
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
                bookCode: rawResult.book_code,
                status: rawResult.status,
                enabled: rawResult.enabled
            })
        });
        databaseConfig.closeConnection();
    },
    updateBookCodeById: function (bookId, status, callback) {
        databaseConfig.getSession().query('UPDATE book_code SET status = ? WHERE id = ?', [status, bookId], (err, result) => {
            if (err) return callback(err);
            return this.getBookCodeById(bookId, status, true, callback);
        });
        databaseConfig.closeConnection();
    }
}
