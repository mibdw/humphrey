var React = require('react'),
	$ = require('jquery'),
	_ = require('underscore'),
	moment = require('moment');

var HumphreyWeek = require('./HumphreyWeek.react');

module.exports = React.createClass({
	getInitialState: function () {
		return { 
			dates: [],
			events: [] 
		}
	},
	componentWillReceiveProps: function (nextProps) {
		var self = this,
			dates = this.state.dates,
			oldDate = this.props.date,
			newDate = nextProps.date;

		if (_.isEqual(oldDate, newDate) && this.props.events == nextProps.events) return;

		if (moment(newDate).isSame(oldDate, 'isoWeek')) {
			newDate.position = ' same-week';
		} else if (moment(newDate).isBefore(oldDate)) {
			newDate.position = ' new-left';
		} else if (moment(newDate).isAfter(oldDate)) {
			newDate.position = ' new-right';
		}

		dates.push(newDate);
		this.setState({ dates: dates }, function () {

			if (moment(oldDate).isSame(newDate, 'isoWeek')) {
				var newDates = _.reject(self.state.dates, function (date) {
					return date.position == 0;
				});
				self.setState({ dates: newDates });
				return;
			}

			setTimeout(function () {
				if (moment(newDate).isBefore(oldDate)) {
					$('.week[data-week='+ moment(oldDate).startOf('isoweek').format("YYYY-ww") +']').addClass('old-right');
					$('.week[data-week='+ moment(newDate).startOf('isoweek').format("YYYY-ww") +']').removeClass('new-left old-left new-right old-right');
				}
				if (moment(newDate).isAfter(oldDate)) {
					$('.week[data-week='+ moment(oldDate).startOf('isoweek').format("YYYY-ww") +']').addClass('old-left');
					$('.week[data-week='+ moment(newDate).startOf('isoweek').format("YYYY-ww") +']').removeClass('new-left old-left new-right old-right');

				}
			}, 1);

			setTimeout(function () {
				var newDates = _.reject(self.state.dates, function (date) {
					return moment(oldDate).isSame(date, 'isoWeek')
				});
				self.setState({ dates: newDates });
			}, 400)
		});
	},
	render: function () {	
		var self = this,
			weekList = self.state.dates.map(function (date) {
				var weekNum = moment(date).format('YYYY-ww');
				return (
					<HumphreyWeek 
						date={date} 
						events={self.props.events}
						key={weekNum}
						setPopup={self.props.setPopup}
						setDetail={self.props.setDetail} />
				)
			});

		return (
			<div id='humphrey-weekly'>
				{weekList}
				<div className={this.props.loading ? 'loading active' : 'loading'}>
					<div className='spinner'></div>
				</div> 
			</div>
		)
	}
});