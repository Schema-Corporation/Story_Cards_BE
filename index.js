const express = require('express')
const app = express()
const cors = require('cors')

var corsConfiguration = require('./modules/config/corsConfiguration');

app.use(express.json())

var whitelist = corsConfiguration.server.CLIENTS;
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions));

const port = 3000
const authenticationService = require('./modules/authentication/authenticationService.js');
const securityUtil = require('./modules/utils/SecurityUtil.js')
app.get('/', securityUtil.authenticateToken, (req, res) => {
    console.log(req.claims)
    res.send('Hello World!')
})
app.post('/login', (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    const credentials = Buffer.from(token, 'base64').toString()
    const user = credentials.split(":")[0]
    const password = credentials.split(":")[1]
    authenticationService.signIn(user, password).then(value => {
        if (value != null) {
            res.send({"token": value});
        } else {
            res.sendStatus(401);
        }
    })
})
app.post('/validate-code/:code', securityUtil.authenticateToken, (req, res) => {
    const params = req.params
    const code = params.code;
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
