var mysql = require('mysql');
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD
const databasePort = process.env.DATABASE_PORT
const databaseHost = process.env.DATABASE_HOST
const databaseSchema = process.env.DATABASE_SCHEMA
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
    }
}

function establishConnection() {
    const config = {
        password: databasePassword.toString(),
        user: databaseUser.toString(),
        host: databaseHost.toString(),
        database: databaseSchema.toString(),
        port: databasePort.toString()
    };
    session = mysql.createConnection(config);
}





