var React = require('react');

var HumphreyControls = require('./HumphreyControls.react'),
	HumphreyMonthly = require('./HumphreyMonthly.react'),
	HumphreyStretch = require('./HumphreyStretch.react');
	
module.exports = React.createClass({
	render: function () {
		var HumphreyPeriod;
		if (this.props.view == 'weekly') {

			HumphreyPeriod = (
				<HumphreyStretch 
					loading={this.props.loading}
					date={this.props.date}
					events={this.props.events}
					setPopup={this.props.setPopup}
					setDetail={this.props.setDetail} />
			)

		} else if (this.props.view == 'monthly') {

			HumphreyPeriod = (
				<HumphreyMonthly 
					loading={this.props.loading}
					date={this.props.date}
					events={this.props.events}
					setPopup={this.props.setPopup}
					setDetail={this.props.setDetail} />
			)

		}

		return (
			<section id='humphrey-body'>
				<HumphreyControls 
					date={this.props.date}
					view={this.props.view}
					user={this.props.user}
					setDate={this.props.setDate}
					setPopup={this.props.setPopup}
					handleAuth={this.props.handleAuth} />

				{HumphreyPeriod}
			</section>
		)
	}
});