const LocalDate = require("@js-joda/core");
const bookCodeRepository = require('../repository/BookCodeRepository.js');
const userRepository = require('../repository/UserRepository.js');
const accessAttemptRepository = require('../repository/AccessAttemptsRepository.js');
const errorUtils = require('../utils/ErrorConstants');
const securityUtils = require('../utils/SecurityUtil');

module.exports = {
    validateBookCode: function (bookCode, ipAddress, response) {
        accessAttemptRepository.getAccessAttemptsByIdentifier(ipAddress, function (selectResult) {
            if (selectResult === null) {
                accessAttemptRepository.registerAccessAttemptByIdentifier(ipAddress, LocalDate.LocalDateTime.now().plusDays(1).toString(), function () {
                    return null;
                });
            } else if (selectResult.attempts > 3) {
                let now = LocalDate.LocalDateTime.now();
                let penaltyEndDate = LocalDate.LocalDateTime.ofEpochSecond(selectResult.endDate, LocalDate.ZoneOffset.UTC);
                if (penaltyEndDate.isAfter(now)) {
                    return response({response: null, error: errorUtils.TOO_MANY_ATTEMPTS});
                } else {
                    accessAttemptRepository.updateAccessAttemptByIdentifier(ipAddress, 1, LocalDate.LocalDateTime.now().plusDays(1).toString(), function () {
                        return null;
                    });
                }
            } else {
                accessAttemptRepository.updateAccessAttemptByIdentifier(ipAddress, selectResult.attempts + 1, LocalDate.LocalDateTime.now().plusDays(1).toString(), function () {
                    return null;
                });
            }
            bookCodeRepository.getBookCodeByCode(bookCode, true, function (bookCodeResult) {
                console.log("Retrieved book successfully: " + bookCodeResult);
                if (bookCodeResult === undefined) {
                    console.log("Could not validate book code");
                    return response({response: null, error: errorUtils.BOOK_DOES_NOT_EXIST});
                }
                accessAttemptRepository.updateAccessAttemptByIdentifier(ipAddress, 0, LocalDate.LocalDateTime.now().plusDays(1).toString(), function (result) {
                    return null;
                });
                return response({response: bookCodeResult, error: null});
            });
        });
    },
    registerUser: function (userData, callback) {
        return userRepository.findUserByUsername(userData.username, function (userExists) {
            console.log("Retrieved user successfully: " + userExists);
            bookCodeRepository.getBookCodeById(userData.bookCodeId, 0, true, function (bookCode) {
                console.log("Retrieved Book Successfully: " + bookCode);
                if (userExists === null && bookCode != null) {
                    bookCodeRepository.updateBookCodeById(bookCode.id, 0, function (result) {
                        console.log("Updated Book Code Successfully: ", result);
                        securityUtils.hashPassword(userData.password, function (hashedPassword) {
                            userData.password = hashedPassword;
                            userRepository.registerUser(userData, function (insertResult) {
                                if (insertResult === null) {
                                    bookCodeRepository.updateBookCodeById(bookCode.id, 0, function () {
                                        return null;
                                    })
                                }
                                return callback(insertResult);
                            })
                        });
                    });
                } else {
                    return callback(null);
                }
            })
        })
    },
    validateEmail: function (userData, callback) {
        return userRepository.findUserByUsername(userData.email, function (userExists) {
            if (userExists === null) {
                return callback(null);
            } else {
                return callback(true);
            }
        })
    },
    sendCode: function (userData, callback) {
        var randomCode = generateRandomCode();
        return userRepository.updateCode(userData.email, randomCode, function(userUpdated) {
            securityUtils.sendCode(userData.email, randomCode, userUpdated.firstName, userUpdated.lastName, function (codeSent) {
                if (codeSent === null) {
                    return callback(null);
                } else {
                    return callback(true);
                }
            })
        });
    },
    validateOTP: function (userData, callback) {
        return userRepository.validateOTP(userData.email, userData.otp, function(validOTP) {
            if (validOTP === null || validOTP === false) {
                return callback(null);
            } else {
                return callback(true);
            }
        });
    },
    resetPassword: function (userData, callback) {
        securityUtils.hashPassword(userData.password, function (hashedPassword) {
            userRepository.updateUserPassword(userData.email, hashedPassword, function (updatedResult) {
                if (updatedResult === null) {
                    return callback(null);
                } else {
                    return callback(true);
                }
            })
        });
    }
}

function generateRandomCode() {
    let str = "";
    let counter = 0;
    while (counter < 6) {
        let randomNum = Math.random() * 127;
        if ((randomNum >= 48 && randomNum <= 57) || (randomNum >= 65 && randomNum <= 90) || (randomNum >= 97 && randomNum <= 122)) {
            str += String.fromCharCode(Math.round(randomNum));
            counter++;
        }
    }
    return str;
}