var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schema({
    username: String,
    email: String,
    lastName: String,
    firstName: String,
    password: String,
    role: String
},
{
	collection: 'accounts'
});

module.exports = mongoose.model('Account', Account);
