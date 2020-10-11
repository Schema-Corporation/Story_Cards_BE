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
        password: 'password',
        user: 'user',
        host: 'localhost',
        port: 33070,
        schema: 'db_story_cards'
    };
    session = mysqlx.getSession(config).then(session => {
        return session.getSchema()
    });
}





