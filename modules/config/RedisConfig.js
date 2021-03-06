let redis = require('redis');
let client;
if (process.env.NODE_ENV !== 'production') {
    require('dotenv');
}

module.exports = {
    getRedisClient: function () {
        if (client === null || client === undefined || !client.connected) {
            client = redis.createClient({
                "host": process.env.REDIS_HOST,
                "port": process.env.REDIS_PORT
            });
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
