const databaseConfig = require('../config/database');
const uuid = require('uuid');
const LocalDate = require("@js-joda/core");

module.exports = {
    findUserByUsername: function (username, callback) {
        databaseConfig.getSession().query('SELECT id, username,email,phone, password, full_name,book_code_id FROM user WHERE username = ?', username, (err, rows) => {
            if (err) return callback(err);
            let rawResult = rows[0];
            if (rawResult === undefined) {
                return callback(null);
            } else {
                return callback({
                    id: rawResult.id,
                    username: rawResult.username,
                    password: rawResult.password,
                    fullName: rawResult.full_name,
                    phone: rawResult.phone,
                    email: rawResult.email,
                    bookCodeId: rawResult.book_code_id
                });
            }
        });
        databaseConfig.closeConnection();
    },
    registerUser: function (userData, callback) {
        let insertObject = {
            id: uuid.v4(),
            username: userData.username,
            password: userData.password,
            email: userData.email,
            phone: userData.phone,
            full_name: userData.fullName,
            created_date: LocalDate.LocalDate.now().toString(),
            book_code_id: userData.bookCodeId
        }
        databaseConfig.getSession().query('INSERT INTO user SET ?', insertObject, (err, result) => {
            if (err) return callback(err);

            return this.findUserByUsername(userData.username, callback);
        });
        databaseConfig.closeConnection();
    }
}
