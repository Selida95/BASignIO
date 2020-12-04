/*
 * --------------
 * Email Manager
 * --------------
 */
const mailer = require('nodemailer');
const utils = require('./utilities')
const config = require('../config')

exports.send = function(mailOptions, callback){
	var smtpTransport = mailer.createTransport({
		host: config.mail.host, // hostname
		secureConnection: false, // TLS requires secureConnection to be false
		port: config.mail.port,
		tls: {
			ciphers:'SSLv3'
		}
	});

    // setup e-mail data with unicode symbols
	var options = {
		from: config.mail.sender, // sender address
		to: mailOptions.receiver, // receiver address
		subject: mailOptions.subject , // Subject line
		text: mailOptions.text, // plaintext body
		html: '<b>' + mailOptions.text + '.</b>', // html body
	};

	if (mailOptions.attachment) {
		options.attachments = mailOptions.attachment
	}

	// send mail with defined transport object
	smtpTransport.sendMail(options, function(err, info){
		if(err){
			callback(err);
		}
		//console.log('Message sent: ' + info.response);
		//console.dir(info);
		callback(null, "Log: " + utils.date() + " " + utils.time() + " " + "Message Sent.");
	});
}
