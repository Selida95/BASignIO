/*
 * -------
 * Config
 * -------
 */

 // Config Template: Duplicate file and rename to config.js before updating.

 // Define config constructor
 var config = {};

 // HTTP Config
 config.http = {}; // HTTP config contructor
 config.http.port = 3000; // Port http server listens on
 config.http.cookie_life = 60*60*24*1000*365*5; // 5 Years - maximum life of a http cookie

 // Database Config
 config.db = {}; // Database config contructor
 config.db.name = ''; // Database name
 config.db.host = ''; // Database host

 // Crypto Config
 config.crypto = {};
 config.crypto.secret = '';

 // Admin Config
 config.admin = {}; // Admin config contructor
 config.admin.email = ''; // Admin email address
 config.admin.password = ''; // Password for Admin account

 // Email Config
 config.mail = {}; // Email config constructor
 config.mail.host = ''; // Mail relay host
 config.mail.port = 25; // Mail relay port
 config.mail.sender = ''; // Sender email address for mail relay

 // Manual Input Config
 config.manual_input = {};
 config.manual_input.enabled = true; // If manual input usage count is enabled or not
 config.manual_input.max_uses = 10; // How many times manual input can be used before an email can be used
 config.manual_input.email = ''; // Email address that manual input report gets emailed to


 // Export Module
 module.exports = config;
