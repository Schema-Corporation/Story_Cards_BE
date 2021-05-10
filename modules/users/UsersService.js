const userRepository = require('../repository/UserRepository');

module.exports = {
    getAffiliateUsers: function(callback) {
        return userRepository.getAffiliateUsers(result => {
            if (result) {
                return callback(result);
            } else {
                console.log("No users found");
                return callback(null);
            }
        });
    }
}