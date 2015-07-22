var React = require('react');

var HumphreyControls = require('./HumphreyControls.react'),
	HumphreyStretch = require('./HumphreyStretch.react');
	
module.exports = React.createClass({
	render: function () {
		return (
			<section id='humphrey-body'>
				<HumphreyControls 
					date={this.props.date}
					user={this.props.user}
					setDate={this.props.setDate}
					setPopup={this.props.setPopup}
					handleAuth={this.props.handleAuth} />

				<HumphreyStretch 
					loading={this.props.loading}
					date={this.props.date}
					events={this.props.events}
					setPopup={this.props.setPopup}
					setDetail={this.props.setDetail} />
			</section>
		)
	}
});