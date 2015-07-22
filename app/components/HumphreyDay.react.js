var React = require('react'),
	$ = require('jquery'),
	_ = require('underscore'),
	moment = require('moment');

module.exports = React.createClass({
	clickDay: function (e) {
		$('.day, .event').removeClass('active');
		$('.day[data-date=' + e.target.dataset.date + '], .event[data-date=' + e.target.dataset.date + ']').addClass('active');
	},
	clickEvent: function (e) {
		$('.day, .event').removeClass('active');
		$('.day[data-date=' + e.target.dataset.date + '], .event[data-date=' + e.target.dataset.date + ']').addClass('active');
		this.props.setPopup('detail');
		this.props.setDetail(e.target.dataset.eventid);
	},
	mouseEnterEvent: function (e) {
		$('.event.event-' + e.target.dataset.eventid).addClass('hover');
	},
	mouseLeaveEvent: function (e) {
		$('.event').removeClass('hover');
	},
	render: function () {
		var self = this, 
			now = moment(),
			dataset = self.props.dataset,
			dayNumber;

		if (dataset.weekday == 'wkd') {
			var num = Number(moment(dataset.start).format('D'))
			dayNumber = (
				<span className='sat-sun'>
					<span className='saturday'>{num}</span>
					<span className='seperator'>/</span>
					<span className='sunday'>{num + 1}</span>
				</span>
			)
		} else {
			dayNumber = <span className='workday'>{moment(dataset.start).format('D')}</span>
		}

		dataset.alldays = _.sortBy(dataset.alldays, 'pos');
		var alldays = dataset.alldays.map(function (ev, index) {
			var style = { backgroundColor: ev.category.color }
			style.top = (ev.pos * 25);

			var classes = 'event event-' + ev._id;
			if (moment(ev.start).isBefore(dataset.start)) classes = classes + ' yesterday';
			if (ev.end && moment(ev.end).isAfter(dataset.end)) classes = classes + ' tomorrow';

			return (
				<li className={classes} 
					style={style}
					key={ev._id + moment(ev.start).format()}
					title={ev.title}
					onMouseEnter={self.mouseEnterEvent}
					onMouseLeave={self.mouseLeaveEvent}
					onClick={self.clickEvent}
					data-eventid={ev._id}
					data-date={moment(dataset.start).format('YYYY-MM-DD')}>
				 
					<span className='event-title'>{ev.title}</span>
				</li>
			)
		});
		var highestAllday = _.max(dataset.alldays, function (ev) { return ev.pos; });
		var alldaysHeight = { height: ((Number(highestAllday.pos) + 1 ) * 25) + 5 }

		var singles = dataset.singles.map(function (ev, index) {
						
			var time = <time className='event-time' dateTime={ev.start}>{moment(ev.start).format('HH:mm')}</time>;
			if (ev.end) time = <time className='event-time' dateTime={ev.start}>{moment(ev.start).format('HH:mm')} &ndash; {moment(ev.end).format('HH:mm')}</time>

			var weekendDay = '';
			if (dataset.weekday == 'wkd') {
				weekendDay = <span className='event-weekend'>{moment(ev.start).format('ddd')}</span>;
			}

			return (
				<li className='event' 
					key={ev._id + moment(ev.start).format()}
					title={ev.title}
					onClick={self.clickEvent}
					data-eventid={ev._id}
					data-date={moment(dataset.start).format('YYYY-MM-DD')}>
					<i style={{ backgroundColor: ev.category.color }}></i>
					{time}{weekendDay}
					<span className='event-title'>{ev.title}</span>
				</li>
			)
		});

		return (
			<li className={moment(now).isBetween(dataset.start, dataset.end) ? 'today active day ' + dataset.weekday : 'day ' + dataset.weekday }
				onClick={self.clickDay}
				data-date={moment(dataset.start).format('YYYY-MM-DD')}>
				<div className='day-number'>
					{dayNumber}
				</div>
				<div className='day-name'>{dataset.weekday}</div>

				<div className={'event-container ' + dataset.weekday}>
					<ul className='alldays' style={alldaysHeight}>{alldays}</ul>
					<ul className='singles'>{singles}</ul>
				</div>
			</li>
		)
	}
});