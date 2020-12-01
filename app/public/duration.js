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

var totalMins = 0;
var longestTime = new Array()
//Setting time to 0;
longestTime[1] = 0;

var stuID = new Array();

stu.count({}, function(err, count){
	stu.find({}, function(err, student){
		student.forEach(function(stud){
			stuID.push(stud._id);
			//console.log('STU: ' + stud._id);
		})
		console.log(stuID.length);
		//console.log(stuID[276]);
	})
})

for (var i = 0; i <= stuID.length; i++) {

	reg.count({id: stuID[i], loc: 'MH'}, function(err, count){
		if (err) {
			console.log('ERR: ' + err)
		}
		reg.find({id: stuID[i]}, function(err, doc){
			if (err) {
				console.log('ERR: ' + err)
			}
			for (var i = 0; i <= count-1 ; i++) {
				if (doc[i].timeOut != "") {
					//console.log('Time Out: ' + doc[i].timeOut);
					//console.log('Time In: ' + doc[i].timeIn);
					//console.log('Date: ' + doc[i].date);

					if (doc[i].timeIn != 'N/A') {
						var startTime = moment(doc[i].timeIn,"HH:mm:ss");
					}else{
						if (doc[i].date == doc[i-1].date || i == 0) {
							var startTime = moment(doc[i-1].timeIn,"HH:mm:ss");
						}else{
							var startTime = moment('08:30:00',"HH:mm:ss");
							//console.log('START OF DAY');
						}
					}

					if (doc[i].timeOut != 'N/A') {
						var end = moment(doc[i].timeOut,"HH:mm:ss");
					}else{
						if (doc[i].date == doc[i+1].date || i == count-1) {
							var end = moment(doc[i+1].timeOut,"HH:mm:ss");
						}else{
							var end = moment('16:30:00',"HH:mm:ss");
							//console.log('END OF DAY');
						}
					}
					var duration = moment.duration(end.diff(startTime));
					var Mins = duration.asMinutes();

					console.log('Duration: ' + Mins);

					totalMins += Mins

					console.log(' ')
				}
			}	
			console.log('Total Mins: ' + totalMins);
			console.log('Total Hours: ' + totalMins/60);

			if (totalMins > longestTime[1]) {
				longestTime[1] = totalMins;
				longestTime[0] = stuID[i];
			}

		})
	})
	if (i == stuID.length) {
		console.log('StuID: ' + longestTime[0]);
		console.log('longestTime: ' + longestTime[1]);
	}
}

/*var end = moment('16:04:49',"HH:mm:ss");
var startTime = moment('12:40:32',"HH:mm:ss");

var duration = moment.duration(end.diff(startTime));
var hours = duration.asMinutes();

console.log(hours);*/