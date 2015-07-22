passport = require('passport');

module.exports = {
	login: function (req, res) {
		passport.authenticate('local', function (err, user, info) {
			if (err) return console.log(err);
			if (!user) return res.send(info);
		
			req.logIn(user, function (err) {
				if (err) return console.log(err);

				var person = {
					_id: user._id,
					username: user.username,
					role: user.role
				};

				req.session.humphrey = person;
				return res.send(person);
			});
		})(req, res);
	},
	logout: function (req, res) {
		req.logout();
		res.send('logout');
	},
	handshake: function (req) {
		if (req.session.passport.user) req.io.emit('fistbump', req.session.humphrey);
	}
};