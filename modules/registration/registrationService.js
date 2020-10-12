const registrationRepository = require('./registrationRepository.js')

module.exports = {
    validateBookCode: function (bookCode) {
        let databaseCode = registrationRepository.getBookCodeByCode(bookCode).then(object => {
            return object;
        })
        if (databaseCode != null) {
            
        }
    }
}
