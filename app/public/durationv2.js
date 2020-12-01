var moment = require('moment'),
	mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/basignio2', {
	useMongoClient: true
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('Connected to Database...')
});

var reg = require('../models/register');
var stu = require('../models/student');

//var totalMins = 0;
var longestTime = new Array()
//Setting time to 0;
longestTime[1] = 0;

var stuID = new Array();

stu.find({}, function(err, student){
	student.forEach(function(stud){
		stuID.push(stud._id);
		var totalMins;
		reg.find({id: stud._id}, function(err, doc){
			if (err) {
				console.log(err);
			}
			if (doc) {
				doc.forEach(function(pupil){

					
					var start = moment(pupil.timeIn,"HH:mm:ss");
					var end = moment(pupil.timeOut,"HH:mm:ss");

					console.log(start + " " + end);

					totalMins += moment.duration(end.diff(start)).asMinutes();
					console.log(totalMins)
				})
			}
		})
	})
})