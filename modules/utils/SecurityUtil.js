require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');

module.exports = {
    authenticateToken: function (req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) {
            console.log("Token is null")
            res.sendStatus(401)
        } else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET.toString(), (err, claims) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(403)
                } else {
                    req.claims = claims
                    next()
                }
            })
        }
    },
    hashPassword: function (password, callback) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.log("Could not hash password, following error happened: " + err);
                throw err;
            }
            return callback(hash);
        });
    },
    hashOTP: function (otp, callback) {
        bcrypt.hash(otp, saltRounds, (err, hash) => {
            if (err) {
                console.log("Could not hash OTP following error happened: " + err);
                throw err;
            }
            return callback(hash);
        });
    },
    compareStrings: function (rawString, hashedString, callback) {
        bcrypt.compare(rawString, hashedString, function (err, res) {
            if (err) {
                console.log("Could not compare strings, following error happened: " + err);
                throw err;
            }
            return callback(res);
        });
    },
    generateAccessToken: function (payload) {
        return jwt.sign({payload}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
    },
    objectsAreEqual: function (a, b) {
        return objectsAreEqualRecursively(a, b);
    },
    sendCode: function (email, randomCode, firstName, lastName, callback) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.OTP_EMAIL_USER,
                pass: process.env.OTP_EMAIL_PASSWORD
            }
        })
        const mailOptions = {
            from: process.env.OTP_EMAIL_USER,
            to: email,
            subject: 'Recuperación de contraseña de acceso a la aplicación web StoryCards',
            html: 'Estimado(a) <span style="text-transform: uppercase;">' + firstName + ' ' + lastName + ':</span> <br><br>' +
                'Hemos recibido una solicitud de recuperación de contraseña, su código generado es <strong>' + randomCode + '</strong>. <br><br>' +
                'Que tenga un buen día, <br>' +
                'Editorial UPC'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Error sending mail: ' + error);
                return callback(null);
            } else {
                console.log('Email sent: ' + info.response);
                return callback(true);
            }
        });
    }
}

function objectsAreEqualRecursively(a, b) {
    for (var prop in a) {
        if (a.hasOwnProperty(prop)) {
            if (b.hasOwnProperty(prop)) {
                if (typeof a[prop] === 'object') {
                    if (!objectsAreEqualRecursively(a[prop], b[prop])) return false;
                } else {
                    if (a[prop] !== b[prop]) return false;
                }
            } else {
                return false;
            }
        }
    }
    return true;
}
