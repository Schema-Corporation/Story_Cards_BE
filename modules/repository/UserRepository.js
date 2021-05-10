const databaseConfig = require('../config/DatabaseConfig');
const uuid = require('uuid');
const LocalDate = require("@js-joda/core");
const securityUtil = require('../utils/SecurityUtil')

module.exports = {
    findUserByUsername: function (username, callback) {
        databaseConfig.getSession().query('SELECT id, username,email,phone, password,first_name,last_name, full_name,country_code,country_name, book_code_id,personal_data_policy,is_admin FROM user WHERE username = ?', username, (err, rows) => {
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
                    personalDataPolicy: rawResult.personal_data_policy,
                    isAdmin: rawResult.is_admin
                });
            }
        });
        databaseConfig.closeConnection();
    },
    checkActivity: function (guestId, roomId, callback) {
        databaseConfig.getSession().query('select r.user_id from room r join guest g on r.id = g.room_id where r.id = ? and r.enabled = 1 and g.id = ?', [roomId, guestId], (err, rows) => {
            if (err) return callback(err);
            let rawResult = rows[0];
            if (rawResult === undefined) {
                return callback(false);
            } else {
                return callback(true);
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
    },
    updateCode : function (email, randomCode, callback) {
        databaseConfig.getSession().query('UPDATE user SET otp = ? WHERE username = ?', [randomCode, email], (err, result) => {
            if (err) return callback(err);
            return this.findUserByUsername(email, callback);
        });
        databaseConfig.closeConnection();
    },
    validateOTP: function (email, otp, callback) {
        databaseConfig.getSession().query('select u.id, u.otp from user u where u.username = ?', email, (err, rows) => {
            if (err) return callback(err);
            let rawResult = rows[0];
            if (rawResult === undefined) {
                return callback(false);
            } else {
                securityUtil.compareStrings(otp, rawResult.otp, validationResult => {
                    if (validationResult) {
                        return callback(true);
                    } else {
                        console.log("OTP did not match!");
                        return callback(false);
                    }
                });
            }
        });
        databaseConfig.closeConnection();
    },
    updateUserPassword: function (email, password, callback) {
        databaseConfig.getSession().query('UPDATE user SET password = ? WHERE username = ?', [password, email], (err, result) => {
            if (err) return callback(err);
            return callback(true);
        });
        databaseConfig.closeConnection();
    },
    getAffiliateUsers: function (callback) {
        const IS_AFFILIATE = 1;
        databaseConfig.getSession()
        .query('select full_name,email,country_name,country_code,phone,personal_data_policy,created_date  from user where personal_data_policy = ?', IS_AFFILIATE, 
        (err, result) => {
            if(err) return callback(err);
            let parsedResult = result.map(rawResult => {
                return {
                    fullName: rawResult.full_name,
                    email: rawResult.email,
                    countryName: rawResult.country_name,
                    countryCode: rawResult.country_code,
                    phone: rawResult.phone,
                    personalDataPolicy: rawResult.personal_data_policy,
                    createdDate: rawResult.created_date
                };
            });
            callback(parsedResult);
        });
        databaseConfig.closeConnection();
    }
}
