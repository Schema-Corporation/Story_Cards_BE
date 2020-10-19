const express = require('express')
const app = express()
const cors = require('cors')
require('./modules/config/corsConfiguration');
const port = 8080
const authenticationService = require('./modules/authentication/authenticationService.js');
const registrationService = require('./modules/registration/registrationService.js');
const securityUtil = require('./modules/utils/SecurityUtil.js')
const bodyParser = require('body-parser')
const errorUtils = require('./modules/utils/ErrorConstants')

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
    authenticationService.signIn(user, password).then(value => {
        if (value != null) {
            res.send({"token": value.token, "fullName": value.user.fullName});
        } else {
            res.status(401).send("User and Password do not match!");
        }
    })
})
app.post('/validate-code/:code', (req, res) => {
    const params = req.params
    const code = params.code;
    const ipAddress = req.header("X-IP");

    registrationService.validateBookCode(code, ipAddress).then(result => {
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
            } else {
                res.status(500).send({"error": "Internal Server Error"});
            }
        }

    }).catch(error => {
        console.log(error);
        res.status(500).send({"error": "Internal Server Error"});
    });

})
app.post('/register', (req, res) => {
    const body = req.body;
    registrationService.registerUser(body).then(result => {
            if (result != null) {
                res.status(201).send(result);
            } else {
                res.status(422).send({"error": "Could not register user due to code or user duplication!"});
            }
        }
    ).catch(error => {
        console.log("Could not register user");
        console.log(error);
        res.status(422).send({"error": "Could not register user!"});
    })
})
app.listen(port, () => {
    console.log(`Story Cards Server listening at http://localhost:${port}`)
})
