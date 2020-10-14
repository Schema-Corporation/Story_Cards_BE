const bookCodeRepository = require('../repository/bookCodeRepository.js')
const userRepository = require('../repository/userRepository.js')
module.exports = {
    validateBookCode: function (bookCode) {
        return bookCodeRepository.getBookCodeByCode(bookCode).then(object => {
            console.log("Retrieved book successfully: " + object);
            return object;
        }).catch(() => {
            console.log("Could not validate book Code");
            return null;
        })
    },
    registerUser: function (userData) {
        return userRepository.findUserByUsername(userData.username).then(userExists => {
            console.log("Retrieved user successfully: " + userExists);
            return bookCodeRepository.getBookCodeById(userData.bookCodeId).then(bookCode => {
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
