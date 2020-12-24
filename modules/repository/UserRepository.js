const databaseConfig = require('../config/DatabaseConfig');
const uuid = require('uuid');
const LocalDate = require("@js-joda/core");

module.exports = {
    findUserByUsername: function (username, callback) {
        databaseConfig.getSession().query('SELECT id, username,email,phone, password,first_name,last_name, full_name,country_code,country_name, book_code_id,personal_data_policy FROM user WHERE username = ?', username, (err, rows) => {
            if (err) return callback(err);
            let rawResult = rows[0];
            if (rawResult === undefined) {
                return callback(null);
            } else {
                return callback({
                    id: rawResult.id,
                    username: rawResult.username,
                    password: rawResult.password,
                    firstName: rawResult.first_name,
                    lastName: rawResult.last_name,
                    fullName: rawResult.full_name,
                    phone: rawResult.phone,
                    email: rawResult.email,
                    countryCode: rawResult.country_code,
                    countryName: rawResult.country_name,
                    bookCodeId: rawResult.book_code_id,
                    personalDataPolicy: rawResult.personal_data_policy
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
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: userData.firstName + " " + userData.lastName,
            country_code: userData.countryCode,
            country_name: userData.countryName,
            created_date: LocalDate.LocalDate.now().toString(),
            book_code_id: userData.bookCodeId,
            personal_data_policy: userData.personalDataPolicy
        }
        databaseConfig.getSession().query('INSERT INTO user SET ?', insertObject, (err, result) => {
            if (err) return callback(err);

            return this.findUserByUsername(userData.username, callback);
        });
        databaseConfig.closeConnection();
    }
}
