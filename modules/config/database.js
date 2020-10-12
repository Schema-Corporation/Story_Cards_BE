const mysqlx = require('@mysql/xdevapi');
let session
module.exports = {
    getSession: function () {
        establishConnection();
        return session;
    }
}

function establishConnection() {
    const config = {
        password: 'root',
        user: 'root',
        host: 'localhost',
        port: 33060,
        schema: 'db_story_cards'
    };
    session = mysqlx.getSession(config).then(session => {
        return session.getSchema()
    });
}





