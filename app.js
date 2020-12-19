const express = require('express')
const app = express()
const cors = require('cors')
const createError = require('http-errors');
require('./modules/config/corsConfiguration');
const port = normalizePort(process.env.PORT || '3000');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');

const authenticationController = require('./routes/AuthenticationController');
const canvasController = require('./routes/CanvasController');
const roomController = require('./routes/RoomController');
const registrationController = require('./routes/RegistrationController');

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
app.use('', registrationController);


app.get('/', (req, res) => {
    res.render('HealthCheck', {title: "Health Check for Story Cards Services", message: "Services are healthy!"});
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
