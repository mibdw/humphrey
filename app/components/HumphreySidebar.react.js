var React = require('react'),
	$ = require('jquery'),
	moment = require('moment'),
	fullCal = require('fullcalendar');

var HumphreyFilter = require('./HumphreyFilter.react'),
	HumphreyMinical = require('./HumphreyMinical.react'),
	HumphreyYearcal = require('./HumphreyYearcal.react');

module.exports = React.createClass({
	render: function () {
		var miniView, viewSwitch;

		if (this.props.view == 'weekly') {
			miniView = <HumphreyMinical	
				date={this.props.date}
				setDate={this.props.setDate} />

			viewSwitch = <a href='' onClick={this.props.viewToggle}>Switch to <u>Monthly view</u></a>;
		} else if (this.props.view == 'monthly') {
			miniView = <HumphreyYearcal
				date={this.props.date}
				setDate={this.props.setDate} />

			viewSwitch = <a href='' onClick={this.props.viewToggle}>Switch to <u>Weekly view</u></a>;
		}

		return (
			<aside id='humphrey-sidebar'>
				{miniView}
				
				<HumphreyFilter 
					categories={this.props.categories}
					catFilter={this.props.catFilter}
					toggleFilter={this.props.toggleFilter} />

				<div id='humphrey-viewtoggle'>
					{viewSwitch}
				</div>

			</aside>
		)
	}
});