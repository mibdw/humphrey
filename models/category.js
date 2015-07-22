var mongoose = require('mongoose');;

var categorySchema = mongoose.Schema({
	name: String,
	color: String,
	active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Category', categorySchema);