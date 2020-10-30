const LocalDate = require("@js-joda/core");
const bookCodeRepository = require('../repository/bookCodeRepository.js');
const userRepository = require('../repository/userRepository.js');
const accessAttemptRepository = require('../repository/accessAttemptsRepository.js');
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
    }
}
