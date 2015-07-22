var mongoose = require('mongoose'),
	passportLocalMongoose = require('passport-local-mongoose');

var userSchema = mongoose.Schema({
	name: {
		first: String,
		last: String
	},
	avatar: String,
	date: { type: Date, default: Date.now },
	role: Number,
	active: { type: Boolean, default: true }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);