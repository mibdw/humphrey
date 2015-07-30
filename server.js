var express = require('express.io'),
	app = express().http().io(),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	moment = require('moment'),
	User = require('./models/user'),
	Category = require('./models/category'),
	exphbs = require('express-handlebars');

mongoose.connect('mongodb://localhost/humphrey', function (err) {
	if (err) console.log('Could not connect to mongodb on localhost');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(express.session({ secret: 'evriaki' }));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function (req, res) { res.render(__dirname + '/views/main'); });
app.get('/:year/:week', function (req, res) { res.render(__dirname + '/views/main'); });

app.post('/login', require('./handlers/auth').login);
app.get('/logout', require('./handlers/auth').logout);
app.get('/elbowbump', require('./handlers/auth').elbowbump);

app.io.route('auth', require('./handlers/auth'));
app.io.route('events', require('./handlers/events'));
app.io.route('categories', require('./handlers/categories'));
app.io.route('users', require('./handlers/users'));

app.listen(207, function () { console.log('Humphrey launched. Listening on port 207.') });

User.find({}, function (err, results) {
	if (results.length < 1) {
		var firstUser = { username: 'admin@humphrey.io', name: { first: 'Humphrey', last: 'Bogart' }, role: 99};

		User.register(new User(firstUser), 'secret', function(err) {
			if (err) console.log('Could not seed initial user:\n', err);				
			console.log('Welcome to Humphrey, please login with admin@humphrey.io/secret');
		});
	}
});

Category.find({}, function (err, results) {
	if (results.length < 1)	 {
		var firstCat = new Category({ name: 'Uncategorized', color: '#333333' });
		firstCat.save(function (err, category) {
			if (err) console.log('Could not seed initial category:\n', err);
			console.log('Initial category seeded');
		});
	}
});