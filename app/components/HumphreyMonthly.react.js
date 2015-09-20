var React = require('react'),
	$ = require('jquery'),
	_ = require('underscore'),
	moment = require('moment');

var HumphreyMonth = require('./HumphreyMonth.react');

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

		if (moment(newDate).isSame(oldDate, 'month')) {
			newDate.position = ' same-month';
		} else if (moment(newDate).isBefore(oldDate)) {
			newDate.position = ' new-left';
		} else if (moment(newDate).isAfter(oldDate)) {
			newDate.position = ' new-right';
		}

		dates.push(newDate);
		this.setState({ dates: dates }, function () {

			if (moment(oldDate).isSame(newDate, 'month')) {
				var newDates = _.reject(self.state.dates, function (date) {
					return date.position == 0;
				});
				self.setState({ dates: newDates });
				return;
			}

			setTimeout(function () {
				if (moment(newDate).isBefore(oldDate)) {
					$('.humphrey-month#'+ moment(oldDate).format("YYYY-MM")).addClass('old-right');
					$('.humphrey-month#'+ moment(newDate).format("YYYY-MM")).removeClass('new-left old-left new-right old-right');
				}
				if (moment(newDate).isAfter(oldDate)) {
					$('.humphrey-month#'+ moment(oldDate).format("YYYY-MM")).addClass('old-left');
					$('.humphrey-month#'+ moment(newDate).format("YYYY-MM")).removeClass('new-left old-left new-right old-right');

				}
			}, 1);

			setTimeout(function () {
				var newDates = _.reject(self.state.dates, function (date) {
					return moment(oldDate).isSame(date, 'month')
				});
				self.setState({ dates: newDates });
			}, 400)
		});
	},
	render: function () {	
		var self = this,
			monthList = self.state.dates.map(function (date) {
				var monthNum = moment(date).format('YYYY-MM');
				return (
					<HumphreyMonth 
						date={date} 
						events={self.props.events}
						key={monthNum}
						setPopup={self.props.setPopup}
						setDetail={self.props.setDetail} />
				)
			});

		return (
			<div id='humphrey-monthly'>
				{monthList}
				<div className={this.props.loading ? 'loading active' : 'loading'}>
					<div className='spinner'></div>
				</div> 
			</div>
		)
	}
});