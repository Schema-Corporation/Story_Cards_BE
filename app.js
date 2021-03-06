const express = require('express')
const app = express()
const cors = require('cors')
const createError = require('http-errors');
require('./modules/config/CorsConfiguration');
const port = normalizePort(process.env.PORT || '3000');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const expressWs = require('express-ws')(app);
const authenticationController = require('./routes/AuthenticationController');
const canvasController = require('./routes/CanvasController');
const roomController = require('./routes/RoomController');
const gameController = require('./routes/GameController');
const registrationController = require('./routes/RegistrationController');
const userController = require('./routes/UsersController');
const healthCheckUtils = require('./modules/utils/HealthCheck');
const cron = require('node-cron');
const databaseConfig = require('./modules/config/DatabaseConfig');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('', authenticationController);
app.use('/canvas', canvasController);
app.use('/room', roomController);
app.use('/game', gameController);
app.use('', registrationController);
app.use('/users', userController);

app.get('/', (req, res) => {
    const contentType = req.header("Content-Type");
    if (contentType === "application/json") {
        healthCheckUtils.pingRedisServer(function (result) {
            res.status(200).send({
                "Redis": result,
                "MySQL": "UP"
            })
        });
    } else {
        healthCheckUtils.pingRedisServer(function (result) {
            res.render('HealthCheck', {
                title: "Health Check for Story Cards Services",
                message: "Services are healthy!",
                serviceList: [{
                    "name": "Redis",
                    "status": result
                }, {
                    "name": "MySQL",
                    "status": "UP"
                }]
            });
        });
    }
})
app.use(function (req, res, next) {
    next(createError(404, "Page not found!", {expose: false}));
});
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = process.env.environment === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});
cron.schedule('59 59 23 * * *', () => {
    console.log('Job executed at ->', new Date())
    console.log('Disabling rooms...');
    const enabled = 0;
    databaseConfig.getSession().query('UPDATE room r SET r.enabled = ?', [enabled], (err, result) => {
        if (err) {
            console.log('Something went wrong...');
            console.log(err);
        }
        console.log('Rooms have been disabled successfully...');
    });
    databaseConfig.closeConnection();
});
app.listen(port, () => {
    console.log(`Story Cards Server listening at http://localhost:${port}`)
})

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}
