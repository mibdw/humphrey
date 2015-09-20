var moment = require('moment'),
	Event = require('./../models/event');

module.exports = {
	fetch: function (req) {
		var start, end;

		if (req.data.view == 'weekly') {
			start = moment(req.data.date).startOf('isoweek').format(),
			end = moment(req.data.date).endOf('isoweek').format();
		} else if (req.data.view == 'monthly') {
			start = moment(req.data.date).startOf('month').format(),
			end = moment(req.data.date).endOf('month').format();
		}

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
				req.io.broadcast('highfive', { user: req.session.humphrey, ev: eventData, what: 'create' });
				req.io.emit('message', { m: 'create', o: 'success', ev: eventData });
			});
		});

	},
	update: function (req) {
		var ev = req.data;
		ev.user = ev.user._id;

		Event.findByIdAndUpdate(ev._id, ev, function (err, eventData) {
			if (err) console.log(err);
			req.io.respond(eventData);
			req.io.broadcast('highfive', { user: req.session.humphrey, ev: eventData, what: 'update' });
			req.io.emit('message', { m: 'update', o: 'success', ev: eventData });
		})
	},
	remove: function (req) {

		Event.findByIdAndRemove(req.data._id, function (err, eventData) {
			if (err) console.log(err);
			req.io.respond('success');
			req.io.broadcast('highfive', { user: req.session.humphrey, ev: req.data, what: 'remove' });
			req.io.emit('message', { m: 'remove', o: 'success', ev: req.data });
		})
	}
};