var React = require('react'),
	$ = require('jquery'),
	_ = require('underscore'),
	moment = require('moment'),
	fullCalendar = require('fullCalendar');

module.exports = React.createClass({
	componentDidMount: function () {
		var self = this, monthId = moment(self.props.date).format('YYYY-MM'), now = moment();

		var correctedEvents = this.props.events;
		correctedEvents.forEach(function (ev) {
			if (ev.allday && ev.end) ev.end = moment(ev.end).add(1, 'days').format();
			if (!ev.allday) {
				ev.start = ev.start = moment(ev.start).format();
				if (ev.end) ev.end = ev.end = moment(ev.end).format();
			}
		}); 

		$('#' + monthId).fullCalendar({
			firstDay: 1,
			header: false,
			dayNamesShort: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
			events: function (start, end, timezone, callback) {
				var events = _.filter(correctedEvents, function (ev) { return ev.visible; });
				callback(events);
			},
			dayRender: function (date, cell) {
				$(cell).prepend('<span class="bling"></span>')
			},
			eventRender: function (event, element) {
				if (event.allday) {
					$(element).addClass('allday');
					$(element).css('background-color', event.category.color);
					$(element).attr('title', event.title);
				} else {
					var time = moment(event.start).format('HH:mm');
					if (event.end) time = moment(event.start).format('HH:mm') + ' \u2013 '  + moment(event.end).format('HH:mm');

					$(element).addClass('single');
					$(element).prepend('<span class="category" style="background-color:' + event.category.color +'"></span><time>' + time + '</time>');
					$(element).attr('title', time + ', ' + event.title);
				}
			},
			eventClick: function (event, jsEvent, view) {
				self.props.setDetail(event._id);
				self.props.setPopup('detail');
			}
		});
		
		$('#' + monthId).fullCalendar('gotoDate', self.props.date);

		setTimeout(function () {
			$('#humphrey-monthly').css('min-height', $('#' + monthId).height());
		}, 1);
	},
	componentWillReceiveProps: function (nextProps) {
		var self = this, monthId = moment(self.props.date).format('YYYY-MM');
		$('#' + monthId).fullCalendar('refetchEvents');

		setTimeout(function () {
			$('#humphrey-monthly').css('min-height', $('#' + monthId).height());
		}, 1);
	},
	render: function () {
		var self = this;

		return (
			<div className={'humphrey-month ' + this.props.date.position}
				id={moment(self.props.date).format('YYYY-MM')} />
		)
	}
});