const databaseConfig = require('../config/database');
module.exports = {
    getCanvasByUserId: function (userId, callback) {
        databaseConfig.getSession().query('SELECT id,user_id,name,data,type FROM canvas c where c.user_id = ?', userId, (err, result) => {
            if (err) return callback(err);
            let parsedResult = [];
            result.forEach(rawResult => parsedResult.push({
                id: rawResult.id,
                userId: rawResult.user_id,
                name: rawResult.name,
                type: rawResult.type
            }))
            if (parsedResult.length === 0) {
                return callback(null);
            } else {
                return callback(parsedResult);
            }
        });
    }
}
