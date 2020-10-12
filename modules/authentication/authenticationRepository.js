const databaseConfig = require('../config/database');
module.exports = {
    findUserByUsername: function (username) {
        let table = databaseConfig.getSession().then(sessionResult => {
            return sessionResult.getTable('user');
        });
        let user = table.then(table => {
            return table.select(['id', 'username', 'password'])
                .where('username = :username')
                .bind('username', username)
                .execute().then(result => {
                    let rawResult = result.fetchOne();
                    return {id: rawResult[0], username: rawResult[1], password: rawResult[2]}
                }).catch(() => {
                        return null
                    }
                )
        }).catch(() => {
            return null
        })
        return user.then(result => {
            return result;
        }).catch(() => {
            return null
        })
    }
}
