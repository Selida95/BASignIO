/*
 * ------------------------
 * BASignIO: Email Manager
 * ------------------------
 */

 // Dependencies
 const mailer = require('nodemailer');
 const functions = require('./functions')

 // Config
 const config = require('../config')

 // Define manager object
 let manager = {}

 manager.send = (mailOptions, callback) => {
	 let smtpTransport = mailer.createTransport({
		 host : config.mail.host,
		 secureConnection : false, // TLS requires secureConnection to be false
		 port : config.mail.port,
		 tls : {
			 ciphers : 'SSLv3'
		 }
	 })

	 let options = {
		 from : config.mail.sender,
		 to : mailOptions.receiver,
		 subject : mailOptions.subject,
		 text : mailOptions.text,
		 html : '<b>' + mailOptions.text + '.</b>'
	 }

	 if (mailOptions.attachment) {
		 options.attachments = mailOptions.attachment
	 }

	 smtpTransport.sendMail(options, (error, info) => {
		 if (error) throw error;
		 if (info) {
			 callback({ message : 'SUCCESS', data : info })
		 }
	 })
 }

 // Export module
 module.exports = manager;
