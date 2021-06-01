var mysql = require('mysql');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv');
}

let session
module.exports = {
    getSession: function () {
        establishConnection();
        session.connect(function (err) {
            if (err) console.log(err);
            console.log("Connected!");
        });
        return session;
    },
    closeConnection: function () {
        session.end(function (err) {
            if (err) {
                return console.log('error:' + err.message);
            }
            console.log('Close the database connection.');
        });
    }
}

function establishConnection() {
    const config = {
        password: process.env.DATABASE_PASSWORD.toString(),
        user: process.env.DATABASE_USER.toString(),
        host: process.env.DATABASE_HOST.toString(),
        database: process.env.DATABASE_SCHEMA.toString(),
        port: process.env.DATABASE_PORT.toString()
    };
    session = mysql.createConnection(config);
}





