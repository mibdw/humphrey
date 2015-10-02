var mongoose = require('mongoose'),
	Category = require('./category'),
	User = require('./user');

var eventSchema = mongoose.Schema({
	title: String,
	start: Date,
	startDay: Number,
	startMonth: Number,
	end: Date,
	endDay: Number,
	endMonth: Number,
	allday: Boolean,
	multiday: Boolean,
	category: { type: String, ref: 'Category' },
	recursion: String,
	duration: Number,
	note: String,
	user: { type: String, ref: 'User' },
	added: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);