var mongoose = require('mongoose'),
	User = require('./../models/user');

module.exports = {
	fetch: function (req) {
		User.findById(req.data._id, 'name username role', function (err, user) {
			if (err) console.log(err);
			req.io.respond(user);
		}); 
	},
	list: function (req) {
		User.find({ 'active': true }, function (err, userList) {
			if (err) console.log(err);
			req.io.respond(userList);
		});
	},
	create: function (req) {
		if (req.data.password && req.data.password != req.data.confirm) {
			req.io.emit('message', { m: 'Passwords do not match', o: 'error' });
			req.io.respond('error');
			return;
		}

		var person = new User({
			name: req.data.name,
			username: req.data.username,
			role: req.data.role
		});

		User.register(person, req.data.password, function (err) {
			if (err) {
				req.io.respond('error');
				req.io.emit('message', { m: err.message, o: 'error' });
				return;
			}

			req.io.respond('success');
			req.io.emit('message', { m: 'Succesfully created user', o: 'success' });
  	});
	},
	update: function (req) {
		User.findById(req.data._id, function (err, person) {
			if (err) console.log(err);

			person.name = req.data.name;
			person.username = req.data.username;
			person.role= req.data.role;
			
			if (req.data.password && req.data.password != req.data.confirm) {
				req.io.emit('message', { m: 'Passwords do not match', o: 'error' });
				req.io.respond('error');
				return;
			} else if (req.data.password && req.data.password == req.data.confirm) {
				person.setPassword(req.data.password, function (err) {
					if (err) console.log(err);
					person.save(function (err) {
						req.io.respond('success');
						req.io.emit('message', { m: 'Succesfully updated user', o: 'success' });
					})
				});
			} else {
				person.save(function (err) {
					req.io.respond('success');
					req.io.emit('message', { m: 'Succesfully updated user', o: 'success' });
				})
			}			
		});
	},
	remove: function (req) {
		User.findByIdAndUpdate(req.data._id, { active: false }, function (err, user) {
			if (err) console.log(err);
			req.io.respond('success');
			req.io.emit('message', { m: 'Succesfully removed user', o: 'success' });
		})
	}
};