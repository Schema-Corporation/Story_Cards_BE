let redis = require('redis');
let client;
if (process.env.NODE_ENV !== 'production') {
    require('dotenv');
}

module.exports = {
    getRedisClient: function () {
        if (client === null || client === undefined || !client.connected) {
            client = redis.createClient();
            client.on('connect', function () {
                console.log('Redis client connected');
            });
            client.on('error', function (err) {
                console.log('Something went wrong ' + err);
            });
        }
        return client;
    }
}
