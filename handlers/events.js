var moment = require('moment'),
	Event = require('./../models/event');

module.exports = {
	fetch: function (req) {
		var start, end, dayRange = [], monthRange = [moment(req.data.date).month()];
		
		if (req.data.view == 'weekly') {
			start = moment(req.data.date).startOf('isoweek').format(),
			end = moment(req.data.date).endOf('isoweek').format();

			for (i = 0; i < 7; i++) { dayRange.push(moment(start).add(i, 'days').date()) }

		} else if (req.data.view == 'monthly') {
			start = moment(req.data.date).startOf('month').subtract(1, 'months').format(),
			end = moment(req.data.date).endOf('month').add(1, 'months').format();

			for (i = 1; i < 31; i++) { dayRange.push(i) }
		}

		monthRange.push(moment(req.data.date).startOf('month').subtract(1, 'months').month());
		monthRange.push(moment(req.data.date).startOf('month').add(1, 'months').month());

		Event.find({})
		.or([
			{ recursion: 'once', start: { $gt: start, $lte: end }}, 
			{ recursion: 'once', end: { $gt: start, $lte: end }}, 
			{ recursion: 'once', start: { $lt: start }, end: { $gt: end }},
			{ recursion: 'monthly', startDay: { $in: dayRange }, start: { $gte: start}},
			{ recursion: 'monthly', endDay: { $in: dayRange }, start: { $gte: start}},
			{ recursion: 'monthly', startDay: { $lt: moment(start).date() }, endDay: { $gt: moment(end).date() }, start: { $gt: start}},
			{ recursion: 'yearly', startMonth: { $in: monthRange }, startDay: { $in: dayRange }, start: { $gt: start}},
			{ recursion: 'yearly', endMonth: { $in: monthRange }, endDay: { $in: dayRange }, start: { $gt: start}},
			{ recursion: 'yearly', startDay: { $lt: moment(start).date() }, endDay: { $gt: moment(end).date() }, start: { $gt: start}},			
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

		ev.startDay = moment(ev.start).date();
		ev.startMonth = moment(ev.start).month();
		
		if (ev.end) {
			ev.endDay = moment(ev.end).date();
			ev.endMonth = moment(ev.end).month();
		}

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

		ev.startDay = moment(ev.start).date();
		ev.startMonth = moment(ev.start).month();
		
		if (ev.end) {
			ev.endDay = moment(ev.end).date();
			ev.endMonth = moment(ev.end).month();
		}

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