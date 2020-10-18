const LocalDate = require("@js-joda/core");
const bookCodeRepository = require('../repository/bookCodeRepository.js')
const userRepository = require('../repository/userRepository.js')
const accessAttemptRepository = require('../repository/accessAttemptsRepository.js')
const errorUtils = require('../utils/ErrorConstants')

module.exports = {
    validateBookCode: function (bookCode, ipAddress) {
        return accessAttemptRepository.getAccessAttemptsByIdentifier(ipAddress).then(attemptObject => {
            if (attemptObject === null) {
                accessAttemptRepository.registerAccessAttemptByIdentifier(ipAddress, LocalDate.LocalDateTime.now().plusDays(1).toString());
            } else if (attemptObject.attempts > 3) {
                let now = LocalDate.LocalDateTime.now();
                let penaltyEndDate = LocalDate.LocalDateTime.ofEpochSecond(attemptObject.endDate, LocalDate.ZoneOffset.UTC);
                if (penaltyEndDate.isAfter(now)) {
                    return {response: null, error: errorUtils.TOO_MANY_ATTEMPTS};
                } else {
                    accessAttemptRepository.updateAccessAttemptByIdentifier(ipAddress, 1, LocalDate.LocalDateTime.now().plusDays(1).toString());
                }
            } else {
                accessAttemptRepository.updateAccessAttemptByIdentifier(ipAddress, attemptObject.attempts + 1, LocalDate.LocalDateTime.now().plusDays(1).toString());
            }
            return bookCodeRepository.getBookCodeByCode(bookCode, true).then(object => {
                console.log("Retrieved book successfully: " + object);
                accessAttemptRepository.updateAccessAttemptByIdentifier(ipAddress, 0, LocalDate.LocalDateTime.now().plusDays(1).toString());
                return {response: object, error: null};
            }).catch(error => {
                console.log("Could not validate book Code: " + error);
                return {response: null, error: errorUtils.BOOK_DOES_NOT_EXIST};
            })
        }).catch(error => {
            console.log("Could not get access attempts with following error:" + error);
            return {response: null, error: errorUtils.DB_ERROR};
        });

    },
    registerUser: function (userData) {
        return userRepository.findUserByUsername(userData.username).then(userExists => {
            console.log("Retrieved user successfully: " + userExists);
            return bookCodeRepository.getBookCodeById(userData.bookCodeId, 0, true).then(bookCode => {
                console.log("Retrieved Book Successfully: " + bookCode);
                if (userExists === null && bookCode != null) {
                    return bookCodeRepository.updateBookCodeById(bookCode.id, 1).then(
                        result => {
                            console.log("Updated Book Code Successfully: ", result)
                            return userRepository.registerUser(userData).then(value => {
                                if (value === null) {
                                    return bookCodeRepository.updateBookCodeById(bookCode.id, 0).then(() => {
                                        return null;
                                    });
                                }
                                console.log("Updated user successfully: " + value)
                                return value;
                            }).catch(reason => {
                                console.log("Could not save user in database");
                                console.log(reason);
                                return bookCodeRepository.updateBookCodeById(bookCode.id, 0).then(() => {
                                    return null;
                                });
                            })
                        }).catch(error => {
                        console.log("Could not update book code: " + error);
                        return bookCodeRepository.updateBookCodeById(bookCode.id, 0).then(() => {
                            return null;
                        });
                    });
                } else {
                    console.log("User already exists or book code has been already used!")
                    return bookCodeRepository.updateBookCodeById(bookCode.id, 0).then(() => {
                        return null;
                    });
                }
            }).catch(error => {
                console.log("Could not fetch book code: " + error)
                return null;
            })
        }).catch(error => {
            console.log("Could not fetch user: " + error);
            return null;
        })
    }
}
