/*
 * ----------------
 * Config Template
 * ----------------
 */

 // Config Template: Duplicate file and rename to config.js before updating.

 // Define config object
 var config = {};

 // HTTP Config
 config.http = {}
 config.http.port = 3000; // HTTP Server Port
 config.http.cookie = {}
 config.http.cookie.max_life = 60*60*24*1000*365*5; // Maximum Cookie Life - Default: 5 Years
 config.http.session = {}
 config.http.session.secret = '' // Secret for sessions

 // Database Config
 config.db = {}
 config.db.name = ''; // Database name
 config.db.host = ''; // Database host

 // Crypto Config
 config.crypto = {}
 config.crypto.secret = '' // Secret for account passwords

 // Admin Config
 config.admin = {};
 config.admin.email = ''; // Admin email address
 config.admin.password = ''; // Password for admin account

 // Email Config
 config.mail = {};
 config.mail.host = ''; // Mail relay host
 config.mail.port = 25; // Mail relay port
 config.mail.sender_address = '' // Email address used to send mail via relay

 // Manual Input Config
 config.manual_input = {};
 config.manual_input.enabled = true; // If manual input usage count is enabled or not
 config.manual_input.max_uses = 10; // How many times manual input can be used per user before an email is sent
 config.manual_input.email = ''; // Email address that manual input report gets emailed to

 // Export Config
 module.exports = config
