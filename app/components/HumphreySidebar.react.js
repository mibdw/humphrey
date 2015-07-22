var React = require('react'),
	$ = require('jquery'),
	moment = require('moment'),
	fullCal = require('fullcalendar');

var HumphreyFilter = require('./HumphreyFilter.react');

module.exports = React.createClass({
	componentDidMount: function () {
		var self = this,
			now = moment();

		$('#humphrey-minical').fullCalendar({
			firstDay: 1,
			header: {
				left: '',
				center: 'prev title next',
				right: ''
			},
			buttonIcons: false,
			buttonText: {
				prev: '\u2039',
				next: '\u203A'
			},
			dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
			dayClick: function (date, jsEvent, view) {
				$('thead tr').removeClass('display-week');
				$('thead td[data-date=' + moment(date).format('YYYY-MM-DD') + ']').parent().addClass('display-week');
				var clickDate = moment(date).format('YYYY-MM-DD');
				self.props.setDate(moment(clickDate, 'YYYY-MM-DD'));
			},
			dayRender: function (date, cell) {
				if (moment(date).isSame(self.props.date, 'day')) $('thead td[data-date=' + moment(date).format('YYYY-MM-DD') + ']').parent().addClass('display-week');
				if (moment(date).isSame(now, 'day')) $('thead td[data-date=' + moment(date).format('YYYY-MM-DD') + ']').html('<span>' + moment(date).format('D') + '</span>');
			},
		});

	},
	componentWillReceiveProps: function (nextProps) {
		var self = this;
		$('#humphrey-minical').fullCalendar('gotoDate', nextProps.date);
		if (!moment(nextProps.date).isSame(self.props.date, 'week')) {
			$('thead tr').removeClass('display-week');
			$('thead td[data-date=' + moment(nextProps.date).format('YYYY-MM-DD') + ']').parent().addClass('display-week');
		}
	},
	render: function () {
		return (
			<aside id='humphrey-sidebar'>
				<div id='humphrey-minical'></div>
				
				<HumphreyFilter 
					categories={this.props.categories}
					catFilter={this.props.catFilter}
					toggleFilter={this.props.toggleFilter} />
			</aside>
		)
	}
});