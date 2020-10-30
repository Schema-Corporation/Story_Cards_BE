const express = require('express')
const app = express()
const cors = require('cors')
require('./modules/config/corsConfiguration');
const port = normalizePort(process.env.PORT || '3000');
const authenticationService = require('./modules/authentication/authenticationService.js');
const registrationService = require('./modules/registration/registrationService.js');
const securityUtils = require('./modules/utils/SecurityUtil');
const bodyParser = require('body-parser');
const errorUtils = require('./modules/utils/ErrorConstants');
const canvasService = require('./modules/canvas/canvasService');

app.use(express.json())
app.use(bodyParser.json())
app.use(cors());
app.get('/', (req, res) => {
    console.log(req.claims)
    res.send('Service is alive!')
})
app.post('/login', (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    const credentials = Buffer.from(token, 'base64').toString()
    const user = credentials.split(":")[0]
    const password = credentials.split(":")[1]
    authenticationService.signIn(user, password, function (value) {
        if (value != null) {
            res.send({"token": value.token, "fullName": value.user.fullName});
        } else {
            res.status(401).send("User and Password do not match!");
        }
    })
})
app.get('/canvas', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
    canvasService.getCanvas(userId, function (result) {
        const responseObject = result;
        if (responseObject.error === null) {
            res.status(200).send(responseObject.response);
        } else if (responseObject.error === errorUtils.NO_CANVAS_FOUND) {
            res.status(200).send([]);
        }
    });
});
app.post('/canvas', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
    if (Object.keys(req.body).length === 0) {
        res.status(422).send({"error": "Body cannot be null!"});
    } else {
        canvasService.createCanvas(userId, req.body, function (result) {
            if (result === null) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(201).send(result);
            }
        });
    }
});
app.delete('/canvas/:canvasId', securityUtils.authenticateToken, (req, res) => {
    const userId = req.claims.user.userId;
    const params = req.params
    const canvasId = params.canvasId;
    if (canvasId === null || canvasId === undefined) {
        res.status(422).send({"error": "Canvas Id is required!"})
    }
    canvasService.deleteCanvas(userId, canvasId, function (result) {
        if (result === null) {
            res.status(500).send("Internal Server Error");
        } else if (result.error != null) {
            res.status(422).send(result);
        } else {
            res.send(204);
        }
    });
});
app.post('/validate-code/:code', (req, res) => {
    const params = req.params
    const code = params.code;
    const ipAddress = req.header("X-IP");
    registrationService.validateBookCode(code, ipAddress, function (result) {
        const responseObject = result;
        if (responseObject.error === null) {
            const isValid = responseObject.response.bookCode != null;
            if (isValid) {
                res.status(200).send(result);
            } else {
                res.status(422).send({"error": "Could not validate code since it does not exists or has been used!"});
            }
        } else {
            const errorCode = responseObject.error;
            if (errorCode === errorUtils.TOO_MANY_ATTEMPTS) {
                res.status(403).send({"error": "Too many attempts from this ip address have been made"});
            } else if (errorCode === errorUtils.BOOK_DOES_NOT_EXIST) {
                res.status(422).send({"error": "Could not validate code since it does not exists or has been used!"});
            } else {
                res.status(500).send({"error": "Internal Server Error"});
            }
        }
    })
})
app.post('/register', (req, res) => {
    const body = req.body;
    registrationService.registerUser(body, function (result) {
            if (result != null) {
                res.status(201).send(result);
            } else {
                res.status(422).send({"error": "Could not register user due to code or user duplication!"});
            }
        }
    );
})
app.listen(port, () => {
    console.log(`Story Cards Server listening at http://localhost:${port}`)
})

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}
