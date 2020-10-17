const databaseConfig = require('../config/database');
const uuid = require('uuid');
module.exports = {
    findUserByUsername: function (username) {
        return databaseConfig.getSession().then(sessionResult => {
            let table = sessionResult.getTable('user');
            return table.select(['id', 'username', 'password', 'full_name'])
                .where('username = :username')
                .bind('username', username)
                .execute().then(result => {
                    let rawResult = result.fetchOne();
                    if (rawResult != null)
                        return {
                            id: rawResult[0],
                            username: rawResult[1],
                            password: rawResult[2],
                            fullName: rawResult[3]
                        }
                    return null;
                }).catch((error) => {
                    console.log('error: ', error);
                    return null
                })
        }).catch(reason => {
            console.log("Could not get table");
            console.log(reason);
        });
    },
    registerUser: function (userData) {
        return databaseConfig.getSession().then(sessionResult => {
            let table = sessionResult.getTable('user');
            let ts = Date.now();

            let date_ob = new Date(ts);
            let date = date_ob.getDate();
            let month = date_ob.getMonth() + 1;
            let year = date_ob.getFullYear();
            let currentDate = year + "-" + month + "-" + date;
            return table.insert(['id', 'username', 'password', 'email', 'phone', 'full_name', 'created_date', 'book_code_id'])
                .values(uuid.v4(), userData.username, userData.password, userData.email, userData.phone, userData.fullName, currentDate, userData.bookCodeId)
                .execute().then(value => {
                    console.log(value)
                    return value;
                }).catch(reason => {
                    console.log("Could not insert new user: " + reason);
                    return null;
                })
        });

    }
}
