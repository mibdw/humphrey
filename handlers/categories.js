var mongoose = require('mongoose'),
	Category = require('./../models/category');

module.exports = {
	list: function (req) {
		Category.find({ 'active': true }, function (err, categoryList) {
			if (err) console.log(err);
			req.io.respond(categoryList);
		});
	},
	create: function (req) {
		var newCat = new Category(req.data);
		newCat.save(function (err, category) {
			if (err) console.log(err);
			req.io.respond('success');
			req.io.emit('message', { m: 'Succesfully created', o: 'success' });
		})
	},
	update: function (req) {
		Category.findByIdAndUpdate(req.data._id, req.data, function (err, category) {
			if (err) console.log(err);
			req.io.respond('success');
			req.io.emit('message', { m: 'Succesfully saved', o: 'success' });
		})
	},
	remove: function (req) {
		Category.findByIdAndUpdate(req.data._id, { active: false }, function (err, category) {
			if (err) console.log(err);
			req.io.respond('success');
			req.io.emit('message', { m: 'Succesfully removed', o: 'success' });
		})
	}
};