const	express = require('express'),
		path = require('path'),
		favicon = require('serve-favicon'),
		logger = require('morgan'),
		flash = require('connect-flash'),
		cookieParser = require('cookie-parser'),
		bodyParser = require('body-parser'),
		mongoose = require('mongoose'),
		session = require('express-session'),
		mongoStore = require('connect-mongo')(session);

// --- Config --- //
var config = require('./app/config');
// -------------- //

// --- Database --- //
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, {
	useMongoClient: true
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('Connected to Database...')
});
// ---------------- //

var index = require('./app/routes/index');
var admin = require('./app/routes/admin');
var users = require('./app/routes/users');
var report = require('./app/routes/report');
var registers = require('./app/routes/registers');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'app', 'public', 'img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "ThisIsTheSecret",
                 resave: false,
                 saveUninitialized: true}))
app.use(express.static(path.join(__dirname, 'app', 'public')));
app.use(flash());
app.use(function(req, res, next){
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  next();
})

var accounts = require('./app/models/accounts');

var hash = function(str){
	const secret = process.env.SECRET;

	const hashOut = crypto.createHmac('sha256', secret)
										 .update(str)
										 .digest('hex');

	return hashOut;
}

//Creating default Admin user
  accounts.findOne({'username' : 'admin'}, function(err, doc){
    if (doc) {
      console.log("Admin user exists. Moving on...")
    }else{
      console.log("Creating Admin user...")
      var account = new accounts({
        username: 'admin',
        surname: '',
        forenames: '',
        password: hash(config.admin.password),
        role: 'admin'
      })

      account.save(function(err, acc){
        if (err) return console.error(err);
        console.log('Created Admin account...')
      })
    };
  })

app.locals.ucfirst = function(value){
    return value.charAt(0).toUpperCase() + value.slice(1);
};

app.use('/', index);
app.use('/admin', admin);
app.use('/users', users);
app.use('/reports', report);
app.use('/reg', registers)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
