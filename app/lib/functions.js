var moment = require('moment');

module.exports = {
	time: function(){
		return moment().format('HH:mm:ss')
	},
	date: function(){
		return moment().format('DD-MM-YYYY')
	}
}