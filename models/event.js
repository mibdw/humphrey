var mongoose = require('mongoose'),
	Category = require('./category'),
	User = require('./user');

var eventSchema = mongoose.Schema({
	title: String,
	start: Date,
	end: Date,
	allday: Boolean,
	multiday: Boolean,
	category: { type: String, ref: 'Category' },
	recursion: String,
	note: String,
	user: { type: String, ref: 'User' },
	added: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);