// Set PORT webserver is running on
process.env.PORT = 3000;

// Crypto secret
process.env.SECRET = "abcdefg";
// Database credentials
process.env.DB_NAME = 'basignio2';
process.env.DB_HOST = 'localhost';

// Cookie life
process.env.cookieLife = 60*60*24*1000*365*5;

//-- Manual-Input settings --//
	// Manual Input Count
	process.env.manualCount = false;
	// Manual Input Count Max
	process.env.manualCountMax = 10;
	// Manual Input email receiver
	process.env.manualInputEmail = "chapmane@battleabbeyschool.com";


//-- Email settings --//
	//Mail Host
	process.env.mailHost = "192.168.1.37";
	//Mail Host Port
	process.env.mailPort = "25";
	//Mail Sender
	process.env.mailSender = 'it@battleabbeyschool.com';
