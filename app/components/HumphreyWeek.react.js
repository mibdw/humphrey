var React = require('react'),
	moment = require('moment'),
	_ = require('underscore');

var HumphreyDay = require('./HumphreyDay.react');

module.exports = React.createClass({
	render: function () {
		var self = this,
			startWeek = moment(self.props.date).startOf('isoWeek'),
			weekdays = [
				{ name: 'mon', column: [] },
				{ name: 'tue', column: [] },
				{ name: 'wed', column: [] },
				{ name: 'thu', column: [] },
				{ name: 'fri', column: [] },
				{ name: 'wkd', column: [] }
			];
			
		function happensToday (ev, day) {
			if (moment(ev.start).isBetween(day.start, day.end)) return true;
			if (ev.end && moment(ev.end).isBetween(day.start, day.end)) return true;
			if (ev.end && moment(ev.start).isBefore(day.start) && moment(ev.end).isAfter(day.end)) return true;
			if (ev.end && moment(ev.end).isBefore(day.start)) return false;
			if (moment(ev.start).isAfter(day.end)) return false;
		}

		var events = _.filter(self.props.events, function (ev) { return ev.visible; });
		var events = _.sortBy(events, 'start');
		for (x in events) {
			if (events[x].allday == true) {
				
				events[x].pos = -1;
				var day;

				for (i in weekdays) {
					day = {
						start: moment(startWeek).add(i, 'days').startOf('day').format(),
						end: moment(startWeek).add(i, 'days').endOf('day').format(),
					};
					if (weekdays[i].name == 'wkd') day.end = moment(startWeek).add(6, 'days').endOf('day').format();

					if (events[x].pos > -1) {

						weekdays[i].column[events[x].pos] = (happensToday(events[x], day)) ? events[x]._id : 'empty';

					} else {

						if (happensToday(events[x], day)) {
							var fill = false;
							for (j in weekdays[i].column) {
								if (events[x].pos == -1 && weekdays[i].column[j] == 'empty') {
									weekdays[i].column[j] = events[x]._id;
									events[x].pos = j;
									fill = true;
								}
							}

							if (fill == false) {
								weekdays[i].column.push(events[x]._id);
								events[x].pos = weekdays[i].column.indexOf(events[x]._id);
							}
						} else {
							weekdays[i].column.push('empty');
						}
					}	
				}
			}
		};
		events = _.sortBy(events, 'pos');

		var dataset = weekdays.map(function (weekday, index) {
			var day = {
				start: moment(startWeek).add(index, 'days').startOf('day').format(),
				end: moment(startWeek).add(index, 'days').endOf('day').format(),
				weekday: weekday.name,
				alldays: [],
				singles: []
			};

			if (weekday.name == 'wkd') day.end = moment(startWeek).add(6, 'days').endOf('day').format();

			events.forEach(function (ev) {
				if (moment(ev.start).isBetween(day.start, day.end)) {
					if (ev.allday) day.alldays.push(ev); 
					if (!ev.allday) day.singles.push(ev); 
				}

				if (ev.allday && ev.end) {
					if (moment(ev.end).isBetween(day.start, day.end)) {
						day.alldays.push(ev);
					} else	if (moment(ev.start).isBefore(day.start) && moment(ev.end).isAfter(day.end)) {
						day.alldays.push(ev);
					}
				}
			});

			return day;
		});

		var weekList = dataset.map(function (day, index) {
			return (
				<HumphreyDay 
					dataset={day} 
					key={moment(day.start).format()}
					setPopup={self.props.setPopup} 
					setDetail={self.props.setDetail} />
			)
		});

		return (
			<ul 
				className={'week ' + this.props.date.position} 
				data-week={moment(startWeek).format('YYYY-ww')}>
					{weekList}
			</ul>
		)
	}
});