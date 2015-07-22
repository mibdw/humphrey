var moment = require('moment'),
	Event = require('./../models/event');

module.exports = {
	fetch: function (req) {
		var start = moment(req.data).startOf('isoweek').format(),
			end = moment(req.data).endOf('isoweek').format();

			Event.find({})
			.or([
				{ start: { $gt: start, $lte: end }}, 
				{ end: { $gt: start, $lte: end }}, 
				{ start: { $lt: start }, end: { $gt: end }}
			])
			.populate('user', 'name username')
			.populate('category')
			.exec(function (err, eventData) {
			if (err) console.log(err);	
				req.io.respond(eventData);
			});
	},
	detail: function (req) {
		Event.findById(req.data._id)
		.populate('user', 'name username')
		.populate('category')
		.exec(function (err, eventData) {
			if (err) console.log(err);	
			req.io.respond(eventData);
		});
	},
	create: function (req) {
		var ev = new Event(req.data);

		ev.save(function (err) {
			if (err) console.log(err);
			
			Event.findById(ev._id)
			.populate('user', 'name username')
			.populate('category')
			.exec(function (err, eventData) {
				if (err) console.log(err);	

				req.io.respond(eventData);
			});
		});

	},
	update: function (req) {
		var ev = req.data;
		ev.user = ev.user._id;

		Event.findByIdAndUpdate(ev._id, ev, function (err, eventData) {
			if (err) console.log(err);
			req.io.respond(eventData);
			req.io.emit('message', { m: 'Succesfully updated event', o: 'success' });
		})
	},
	remove: function (req) {
		Event.findByIdAndRemove(req.data._id, function (err, eventData) {
			if (err) console.log(err);
			req.io.respond('success');
			req.io.emit('message', { m: 'Succesfully removed event', o: 'success' });
		})
	}
};