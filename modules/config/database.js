const mysqlx = require('@mysql/xdevapi');
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD
const databasePort = process.env.DATABASE_PORT
const databaseHost = process.env.DATABASE_HOST
const databaseSchema = process.env.DATABASE_SCHEMA
require('dotenv');
let session
module.exports = {
    getSession: function () {
        establishConnection();
        return session;
    }
}

function establishConnection() {
    const config = {
        password: databasePassword.toString(),
        user: databaseUser.toString(),
        host: databaseHost.toString(),
        port: databasePort.toString(),
        schema: databaseSchema.toString()
    };
    session = mysqlx.getSession(config).then(session => {
        console.log("Established Connection Successfully");
        return session.getSchema();
    }).catch(reason => {
        console.log("Could not connect to database");
        console.log(reason);
    });
}





